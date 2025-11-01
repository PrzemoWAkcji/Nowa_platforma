const chokidar = require('chokidar');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
const cron = require('node-cron');
const logger = require('../utils/logger');
const FinishLynxParser = require('./finishlynx-parser');
const EventExporter = require('./event-exporter');

class AgentCore {
  constructor(mainWindow) {
    this.mainWindow = mainWindow;
    this.config = {
      serverUrl: '',
      apiKey: '',
      inputDirectory: '',
      outputDirectory: '',
      competitionId: '',
      competitionName: '',
      email: '',
      deviceId: '',
      timingSystem: 'FinishLynx',
      devServer: false,
      autoSync: true,
      syncInterval: 10, // sekundy
      enableNotifications: true
    };
    
    this.status = {
      isRunning: false,
      connectionStatus: 'disconnected', // disconnected, connecting, connected, error
      monitorStatus: 'inactive', // inactive, active, error
      lastSync: null,
      lastError: null,
      processedFiles: 0,
      queuedFiles: []
    };
    
    this.watchers = [];
    this.syncTask = null;
    this.fileQueue = [];
    this.parser = new FinishLynxParser();
    this.exporter = new EventExporter();
    
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    // Wysyłaj aktualizacje statusu do UI
    setInterval(() => {
      this.sendStatusUpdate();
    }, 1000);
  }

  sendStatusUpdate() {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('status-update', this.status);
    }
  }

  sendLogMessage(level, message, data = null) {
    logger[level](message, data);
    
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.webContents.send('log-message', {
        timestamp: new Date().toISOString(),
        level,
        message,
        data
      });
    }
  }

  async loadConfiguration(config) {
    this.config = { ...this.config, ...config };
    this.sendLogMessage('info', 'Konfiguracja załadowana', this.config);
    
    // Sprawdź połączenie
    if (this.config.serverUrl && this.config.apiKey) {
      await this.testConnection();
    }
  }

  async loadConfigurationFromFile(filePath) {
    try {
      const data = await fs.readFile(filePath, 'utf8');
      let config;
      
      if (filePath.endsWith('.roster')) {
        // Parsuj plik .roster (format Roster Athletics)
        config = this.parseRosterFile(data);
      } else {
        // JSON
        config = JSON.parse(data);
      }
      
      await this.loadConfiguration(config);
      this.sendLogMessage('info', `Konfiguracja wczytana z pliku: ${filePath}`);
    } catch (error) {
      this.sendLogMessage('error', `Błąd wczytywania konfiguracji: ${error.message}`);
      throw error;
    }
  }

  async saveConfigurationToFile(filePath) {
    try {
      let configData;
      
      if (filePath.endsWith('.roster')) {
        // Generuj plik .roster w formacie kompatybilnym z Roster Athletics
        configData = this.generateRosterFile();
      } else {
        // Standardowy format JSON
        configData = JSON.stringify(this.config, null, 2);
      }
      
      await fs.writeFile(filePath, configData, 'utf8');
      this.sendLogMessage('info', `Konfiguracja zapisana do pliku: ${filePath}`);
    } catch (error) {
      this.sendLogMessage('error', `Błąd zapisywania konfiguracji: ${error.message}`);
      throw error;
    }
  }

  generateRosterFile() {
    // Generuj plik .roster w formacie identycznym z Roster Athletics
    const rosterData = {
      url: this.config.serverUrl?.replace(/^https?:\/\//, '') || 'localhost:3000',
      token: this.config.apiKey || '',
      deviceId: this.config.deviceId || `athletics-platform-agent-${Date.now()}`,
      email: this.config.email || '',
      meetingId: parseInt(this.config.competitionId) || 0,
      meetingName: this.config.competitionName || 'Athletics Platform Competition',
      timingSystem: 'FinishLynx',
      devServer: this.config.serverUrl?.includes('localhost') || this.config.serverUrl?.includes('127.0.0.1') || false
    };
    
    return JSON.stringify(rosterData);
  }

  parseRosterFile(data) {
    // Parsuj plik .roster w formacie JSON (kompatybilność z Roster Athletics)
    try {
      const rosterData = JSON.parse(data);
      
      // Mapuj format Roster Athletics na nasz format
      const config = {
        serverUrl: `https://${rosterData.url}` || '',
        apiKey: rosterData.token || '',
        competitionId: rosterData.meetingId?.toString() || '',
        competitionName: rosterData.meetingName || '',
        email: rosterData.email || '',
        deviceId: rosterData.deviceId || '',
        timingSystem: rosterData.timingSystem || 'FinishLynx',
        devServer: rosterData.devServer || false
      };
      
      // Jeśli to dev server, użyj http zamiast https
      if (config.devServer) {
        config.serverUrl = config.serverUrl.replace('https://', 'http://');
      }
      
      return config;
    } catch (error) {
      throw new Error(`Błąd parsowania pliku .roster: ${error.message}. Sprawdź czy plik zawiera prawidłowy JSON.`);
    }
  }

  async testConnection(serverUrl = null, apiKey = null) {
    const url = serverUrl || this.config.serverUrl;
    const key = apiKey || this.config.apiKey;
    
    if (!url || !key) {
      this.status.connectionStatus = 'error';
      this.status.lastError = 'Brak URL serwera lub klucza API';
      return { success: false, error: this.status.lastError };
    }

    try {
      this.status.connectionStatus = 'connecting';
      this.sendLogMessage('info', 'Testowanie połączenia...');
      
      const response = await axios.get(`${url}/api/health`, {
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      if (response.status === 200) {
        this.status.connectionStatus = 'connected';
        this.status.lastError = null;
        this.sendLogMessage('info', 'Połączenie nawiązane pomyślnie');
        return { success: true };
      } else {
        throw new Error(`Nieprawidłowy status odpowiedzi: ${response.status}`);
      }
    } catch (error) {
      this.status.connectionStatus = 'error';
      this.status.lastError = error.message;
      this.sendLogMessage('error', `Błąd połączenia: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  async startSync() {
    if (this.status.isRunning) {
      this.sendLogMessage('warn', 'Synchronizacja już działa');
      return;
    }

    // Sprawdź konfigurację
    if (!this.validateConfig()) {
      return;
    }

    try {
      this.status.isRunning = true;
      this.status.monitorStatus = 'active';
      this.sendLogMessage('info', 'Rozpoczynanie synchronizacji...');

      // Sprawdź połączenie
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        throw new Error('Nie można nawiązać połączenia z serwerem');
      }

      // Uruchom monitoring katalogów
      await this.startDirectoryWatching();
      
      // Uruchom cykliczną synchronizację
      this.startPeriodicSync();
      
      // Wykonaj początkową synchronizację list startowych
      await this.syncStartLists();
      
      this.sendLogMessage('info', 'Synchronizacja uruchomiona pomyślnie');
      
    } catch (error) {
      this.status.isRunning = false;
      this.status.monitorStatus = 'error';
      this.status.lastError = error.message;
      this.sendLogMessage('error', `Błąd uruchamiania synchronizacji: ${error.message}`);
    }
  }

  async stopSync() {
    if (!this.status.isRunning) {
      this.sendLogMessage('warn', 'Synchronizacja nie działa');
      return;
    }

    try {
      this.status.isRunning = false;
      this.status.monitorStatus = 'inactive';
      
      // Zatrzymaj monitoring katalogów
      this.stopDirectoryWatching();
      
      // Zatrzymaj cykliczną synchronizację
      this.stopPeriodicSync();
      
      this.sendLogMessage('info', 'Synchronizacja zatrzymana');
      
    } catch (error) {
      this.sendLogMessage('error', `Błąd zatrzymywania synchronizacji: ${error.message}`);
    }
  }

  validateConfig() {
    const required = ['serverUrl', 'apiKey', 'inputDirectory', 'outputDirectory', 'competitionId'];
    const missing = required.filter(key => !this.config[key]);
    
    if (missing.length > 0) {
      const error = `Brak wymaganych ustawień: ${missing.join(', ')}`;
      this.status.lastError = error;
      this.sendLogMessage('error', error);
      return false;
    }
    
    return true;
  }

  async startDirectoryWatching() {
    // Monitor katalogu wyjściowego FinishLynx (pliki .lif)
    const outputWatcher = chokidar.watch(
      path.join(this.config.outputDirectory, '*.lif'),
      {
        ignored: /^\./, 
        persistent: true,
        ignoreInitial: true
      }
    );

    outputWatcher.on('add', (filePath) => {
      this.sendLogMessage('info', `Nowy plik wyników: ${path.basename(filePath)}`);
      this.queueFileForProcessing(filePath, 'result');
    });

    outputWatcher.on('change', (filePath) => {
      this.sendLogMessage('info', `Zmiana w pliku wyników: ${path.basename(filePath)}`);
      this.queueFileForProcessing(filePath, 'result');
    });

    outputWatcher.on('error', (error) => {
      this.sendLogMessage('error', `Błąd monitorowania katalogu wyjściowego: ${error.message}`);
    });

    this.watchers.push(outputWatcher);
    this.sendLogMessage('info', `Monitoring katalogu wyjściowego: ${this.config.outputDirectory}`);
  }

  stopDirectoryWatching() {
    this.watchers.forEach(watcher => {
      watcher.close();
    });
    this.watchers = [];
    this.sendLogMessage('info', 'Monitoring katalogów zatrzymany');
  }

  startPeriodicSync() {
    if (this.config.autoSync && this.config.syncInterval > 0) {
      // Uruchom zadanie cykliczne
      this.syncTask = cron.schedule(`*/${this.config.syncInterval} * * * * *`, async () => {
        await this.processFileQueue();
      }, {
        scheduled: false
      });
      
      this.syncTask.start();
      this.sendLogMessage('info', `Cykliczna synchronizacja uruchomiona (co ${this.config.syncInterval}s)`);
    }
  }

  stopPeriodicSync() {
    if (this.syncTask) {
      this.syncTask.stop();
      this.syncTask = null;
      this.sendLogMessage('info', 'Cykliczna synchronizacja zatrzymana');
    }
  }

  queueFileForProcessing(filePath, type) {
    const fileInfo = {
      path: filePath,
      type: type, // 'result' lub 'startlist'
      timestamp: new Date(),
      processed: false
    };
    
    // Usuń duplikaty
    this.fileQueue = this.fileQueue.filter(f => f.path !== filePath);
    this.fileQueue.push(fileInfo);
    
    this.status.queuedFiles = this.fileQueue.filter(f => !f.processed);
  }

  async processFileQueue() {
    if (this.fileQueue.length === 0) {
      return;
    }

    const unprocessedFiles = this.fileQueue.filter(f => !f.processed);
    
    for (const fileInfo of unprocessedFiles) {
      try {
        if (fileInfo.type === 'result') {
          await this.processResultFile(fileInfo.path);
        }
        
        fileInfo.processed = true;
        this.status.processedFiles++;
        this.status.lastSync = new Date();
        
      } catch (error) {
        this.sendLogMessage('error', `Błąd przetwarzania pliku ${fileInfo.path}: ${error.message}`);
        // Nie oznaczaj jako przetworzone - spróbuj ponownie później
      }
    }
    
    // Wyczyść przetworzone pliki starsze niż 1 godzina
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    this.fileQueue = this.fileQueue.filter(f => 
      !f.processed || f.timestamp > oneHourAgo
    );
    
    this.status.queuedFiles = this.fileQueue.filter(f => !f.processed);
  }

  async processResultFile(filePath) {
    try {
      this.sendLogMessage('info', `Przetwarzanie pliku wyników: ${path.basename(filePath)}`);
      
      // Odczytaj plik
      const content = await fs.readFile(filePath, 'utf8');
      
      // Parsuj wyniki
      const results = this.parser.parseLifFile(content);
      
      if (results.length === 0) {
        this.sendLogMessage('warn', `Brak wyników w pliku: ${path.basename(filePath)}`);
        return;
      }
      
      // Wyślij wyniki do serwera
      await this.uploadResults(results, path.basename(filePath));
      
      this.sendLogMessage('info', `Pomyślnie przesłano ${results.length} wyników z pliku ${path.basename(filePath)}`);
      
    } catch (error) {
      throw new Error(`Błąd przetwarzania pliku wyników: ${error.message}`);
    }
  }

  async uploadResults(results, fileName) {
    try {
      const response = await axios.post(
        `${this.config.serverUrl}/api/finishlynx/import-results-agent`,
        {
          competitionId: this.config.competitionId,
          fileName: fileName,
          results: results
        },
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      if (response.status !== 200) {
        throw new Error(`Serwer zwrócił status: ${response.status}`);
      }

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(`Błąd serwera: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        throw new Error('Brak odpowiedzi od serwera');
      } else {
        throw new Error(`Błąd żądania: ${error.message}`);
      }
    }
  }

  async syncStartLists() {
    try {
      this.sendLogMessage('info', 'Synchronizacja list startowych...');
      
      // Pobierz listy startowe z serwera
      const response = await axios.get(
        `${this.config.serverUrl}/api/finishlynx/export-start-lists/${this.config.competitionId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const startLists = response.data;
      
      // Eksportuj do plików .evt
      for (const eventData of startLists) {
        await this.exporter.exportEventToFile(
          eventData,
          this.config.inputDirectory
        );
      }
      
      this.sendLogMessage('info', `Wyeksportowano ${startLists.length} list startowych`);
      
    } catch (error) {
      this.sendLogMessage('error', `Błąd synchronizacji list startowych: ${error.message}`);
      throw error;
    }
  }

  async forceSyncStartLists() {
    if (!this.status.isRunning) {
      this.sendLogMessage('warn', 'Synchronizacja nie jest uruchomiona');
      return;
    }
    
    try {
      await this.syncStartLists();
    } catch (error) {
      this.sendLogMessage('error', `Błąd wymuszonej synchronizacji list startowych: ${error.message}`);
    }
  }

  async forceSyncResults() {
    if (!this.status.isRunning) {
      this.sendLogMessage('warn', 'Synchronizacja nie jest uruchomiona');
      return;
    }
    
    try {
      await this.processFileQueue();
    } catch (error) {
      this.sendLogMessage('error', `Błąd wymuszonej synchronizacji wyników: ${error.message}`);
    }
  }

  getConfig() {
    return { ...this.config };
  }

  setConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  getStatus() {
    return { ...this.status };
  }

  getLogs() {
    return logger.getLogs();
  }

  clearLogs() {
    logger.clearLogs();
    this.sendLogMessage('info', 'Logi wyczyszczone');
  }

  cleanup() {
    this.stopSync();
    this.sendLogMessage('info', 'Agent zamknięty');
  }
}

module.exports = AgentCore;