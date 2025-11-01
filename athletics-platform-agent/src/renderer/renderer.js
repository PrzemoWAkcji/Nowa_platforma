const { ipcRenderer } = require('electron');

class AgentUI {
    constructor() {
        this.config = {};
        this.status = {};
        this.logs = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.loadConfiguration();
        this.startStatusUpdates();
    }

    initializeElements() {
        // Configuration elements
        this.serverUrlInput = document.getElementById('server-url');
        this.apiKeyInput = document.getElementById('api-key');
        this.competitionIdInput = document.getElementById('competition-id');
        this.competitionNameInput = document.getElementById('competition-name');
        this.emailInput = document.getElementById('email');
        this.inputDirectoryInput = document.getElementById('input-directory');
        this.outputDirectoryInput = document.getElementById('output-directory');
        this.autoSyncCheckbox = document.getElementById('auto-sync');
        this.syncIntervalInput = document.getElementById('sync-interval');
        this.enableNotificationsCheckbox = document.getElementById('enable-notifications');

        // Status elements
        this.connectionStatus = document.getElementById('connection-status');
        this.monitorStatus = document.getElementById('monitor-status');
        this.detailedConnectionStatus = document.getElementById('detailed-connection-status');
        this.detailedMonitorStatus = document.getElementById('detailed-monitor-status');
        this.lastSyncElement = document.getElementById('last-sync');
        this.processedFilesElement = document.getElementById('processed-files');
        this.fileQueueElement = document.getElementById('file-queue');

        // Logs elements
        this.logsContainer = document.getElementById('logs-container');
        this.logLevelFilter = document.getElementById('log-level-filter');

        // Buttons
        this.testConnectionBtn = document.getElementById('test-connection');
        this.selectInputDirBtn = document.getElementById('select-input-dir');
        this.selectOutputDirBtn = document.getElementById('select-output-dir');
        this.saveConfigBtn = document.getElementById('save-config');
        this.startSyncBtn = document.getElementById('start-sync');
        this.stopSyncBtn = document.getElementById('stop-sync');
        this.forceSyncStartlistsBtn = document.getElementById('force-sync-startlists');
        this.forceSyncResultsBtn = document.getElementById('force-sync-results');
        this.clearQueueBtn = document.getElementById('clear-queue');
        this.clearLogsBtn = document.getElementById('clear-logs');
        this.exportLogsBtn = document.getElementById('export-logs');

        // Tabs
        this.tabButtons = document.querySelectorAll('.tab-button');
        this.tabContents = document.querySelectorAll('.tab-content');
    }

    setupEventListeners() {
        // Tab switching
        this.tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabName = button.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Configuration buttons
        this.testConnectionBtn.addEventListener('click', () => this.testConnection());
        this.selectInputDirBtn.addEventListener('click', () => this.selectDirectory('input'));
        this.selectOutputDirBtn.addEventListener('click', () => this.selectDirectory('output'));
        this.saveConfigBtn.addEventListener('click', () => this.saveConfiguration());

        // Control buttons
        this.startSyncBtn.addEventListener('click', () => this.startSync());
        this.stopSyncBtn.addEventListener('click', () => this.stopSync());
        this.forceSyncStartlistsBtn.addEventListener('click', () => this.forceSyncStartlists());
        this.forceSyncResultsBtn.addEventListener('click', () => this.forceSyncResults());

        // Logs buttons
        this.clearLogsBtn.addEventListener('click', () => this.clearLogs());
        this.exportLogsBtn.addEventListener('click', () => this.exportLogs());
        this.logLevelFilter.addEventListener('change', () => this.filterLogs());

        // IPC listeners
        ipcRenderer.on('status-update', (event, status) => {
            this.updateStatus(status);
        });

        ipcRenderer.on('log-message', (event, logEntry) => {
            this.addLogEntry(logEntry);
        });

        // Auto-save configuration on input changes
        [this.serverUrlInput, this.apiKeyInput, this.competitionIdInput, this.emailInput,
         this.autoSyncCheckbox, this.syncIntervalInput, this.enableNotificationsCheckbox].forEach(element => {
            element.addEventListener('change', () => {
                this.saveConfiguration();
            });
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        this.tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.tab === tabName);
        });

        // Update tab contents
        this.tabContents.forEach(content => {
            content.classList.toggle('active', content.id === `${tabName}-tab`);
        });

        // Load data for specific tabs
        if (tabName === 'logs') {
            this.loadLogs();
        }
    }

    async loadConfiguration() {
        try {
            this.config = await ipcRenderer.invoke('get-config');
            this.updateConfigurationUI();
        } catch (error) {
            console.error('Błąd ładowania konfiguracji:', error);
        }
    }

    updateConfigurationUI() {
        this.serverUrlInput.value = this.config.serverUrl || '';
        this.apiKeyInput.value = this.config.apiKey || '';
        this.competitionIdInput.value = this.config.competitionId || '';
        this.competitionNameInput.value = this.config.competitionName || '';
        this.emailInput.value = this.config.email || '';
        this.inputDirectoryInput.value = this.config.inputDirectory || '';
        this.outputDirectoryInput.value = this.config.outputDirectory || '';
        this.autoSyncCheckbox.checked = this.config.autoSync !== false;
        this.syncIntervalInput.value = this.config.syncInterval || 10;
        this.enableNotificationsCheckbox.checked = this.config.enableNotifications !== false;
    }

    async saveConfiguration() {
        const config = {
            serverUrl: this.serverUrlInput.value.trim(),
            apiKey: this.apiKeyInput.value.trim(),
            competitionId: this.competitionIdInput.value.trim(),
            competitionName: this.competitionNameInput.value.trim(),
            email: this.emailInput.value.trim(),
            inputDirectory: this.inputDirectoryInput.value.trim(),
            outputDirectory: this.outputDirectoryInput.value.trim(),
            autoSync: this.autoSyncCheckbox.checked,
            syncInterval: parseInt(this.syncIntervalInput.value) || 10,
            enableNotifications: this.enableNotificationsCheckbox.checked
        };

        try {
            await ipcRenderer.invoke('set-config', config);
            this.config = config;
            this.showNotification('Konfiguracja zapisana', 'success');
        } catch (error) {
            console.error('Błąd zapisywania konfiguracji:', error);
            this.showNotification('Błąd zapisywania konfiguracji', 'error');
        }
    }

    async testConnection() {
        const serverUrl = this.serverUrlInput.value.trim();
        const apiKey = this.apiKeyInput.value.trim();

        if (!serverUrl || !apiKey) {
            this.showNotification('Wprowadź URL serwera i klucz API', 'warning');
            return;
        }

        this.testConnectionBtn.disabled = true;
        this.testConnectionBtn.textContent = 'Testowanie...';

        try {
            const result = await ipcRenderer.invoke('test-connection', serverUrl, apiKey);
            
            if (result.success) {
                this.showNotification('Połączenie nawiązane pomyślnie', 'success');
            } else {
                this.showNotification(`Błąd połączenia: ${result.error}`, 'error');
            }
        } catch (error) {
            this.showNotification(`Błąd testowania połączenia: ${error.message}`, 'error');
        } finally {
            this.testConnectionBtn.disabled = false;
            this.testConnectionBtn.textContent = 'Testuj połączenie';
        }
    }

    async selectDirectory(type) {
        const title = type === 'input' ? 'Wybierz katalog wejściowy' : 'Wybierz katalog wyjściowy';
        
        try {
            const directory = await ipcRenderer.invoke('select-directory', title);
            
            if (directory) {
                if (type === 'input') {
                    this.inputDirectoryInput.value = directory;
                } else {
                    this.outputDirectoryInput.value = directory;
                }
                
                await this.saveConfiguration();
            }
        } catch (error) {
            console.error('Błąd wyboru katalogu:', error);
            this.showNotification('Błąd wyboru katalogu', 'error');
        }
    }

    async startSync() {
        this.startSyncBtn.disabled = true;
        this.startSyncBtn.textContent = 'Uruchamianie...';

        try {
            await ipcRenderer.invoke('start-sync');
            this.showNotification('Synchronizacja uruchomiona', 'success');
        } catch (error) {
            console.error('Błąd uruchamiania synchronizacji:', error);
            this.showNotification('Błąd uruchamiania synchronizacji', 'error');
        } finally {
            this.startSyncBtn.disabled = false;
            this.startSyncBtn.textContent = 'Start synchronizacji';
        }
    }

    async stopSync() {
        this.stopSyncBtn.disabled = true;
        this.stopSyncBtn.textContent = 'Zatrzymywanie...';

        try {
            await ipcRenderer.invoke('stop-sync');
            this.showNotification('Synchronizacja zatrzymana', 'info');
        } catch (error) {
            console.error('Błąd zatrzymywania synchronizacji:', error);
            this.showNotification('Błąd zatrzymywania synchronizacji', 'error');
        } finally {
            this.stopSyncBtn.disabled = false;
            this.stopSyncBtn.textContent = 'Stop synchronizacji';
        }
    }

    async forceSyncStartlists() {
        // Implementacja wymuszonej synchronizacji list startowych
        this.showNotification('Wymuszanie synchronizacji list startowych...', 'info');
    }

    async forceSyncResults() {
        // Implementacja wymuszonej synchronizacji wyników
        this.showNotification('Wymuszanie synchronizacji wyników...', 'info');
    }

    updateStatus(status) {
        this.status = status;

        // Update header status indicators
        this.updateStatusIndicator(this.connectionStatus, status.connectionStatus);
        this.updateStatusIndicator(this.monitorStatus, status.monitorStatus);

        // Update detailed status
        this.detailedConnectionStatus.textContent = this.getStatusText(status.connectionStatus);
        this.detailedConnectionStatus.className = `status-value status-${status.connectionStatus}`;
        
        this.detailedMonitorStatus.textContent = this.getStatusText(status.monitorStatus);
        this.detailedMonitorStatus.className = `status-value status-${status.monitorStatus}`;

        // Update other status info
        this.lastSyncElement.textContent = status.lastSync ? 
            new Date(status.lastSync).toLocaleString() : 'Nigdy';
        this.processedFilesElement.textContent = status.processedFiles || 0;

        // Update file queue
        this.updateFileQueue(status.queuedFiles || []);

        // Update button states
        this.updateButtonStates(status.isRunning);
    }

    updateStatusIndicator(element, status) {
        element.textContent = this.getStatusText(status);
        element.className = `status-value status-${status}`;
    }

    getStatusText(status) {
        const statusTexts = {
            'connected': 'Połączono',
            'connecting': 'Łączenie',
            'disconnected': 'Rozłączono',
            'error': 'Błąd',
            'active': 'Aktywny',
            'inactive': 'Nieaktywny'
        };
        return statusTexts[status] || status;
    }

    updateFileQueue(queuedFiles) {
        if (queuedFiles.length === 0) {
            this.fileQueueElement.innerHTML = '<p class="empty-message">Brak plików w kolejce</p>';
            return;
        }

        const html = queuedFiles.map(file => `
            <div class="file-item">
                <div class="file-info">
                    <div class="file-name">${file.name || 'Nieznany plik'}</div>
                    <div class="file-details">
                        ${file.type} • ${new Date(file.timestamp).toLocaleString()}
                    </div>
                </div>
                <div class="file-status ${file.processed ? 'completed' : 'pending'}">
                    ${file.processed ? 'Przetworzone' : 'Oczekuje'}
                </div>
            </div>
        `).join('');

        this.fileQueueElement.innerHTML = html;
    }

    updateButtonStates(isRunning) {
        this.startSyncBtn.disabled = isRunning;
        this.stopSyncBtn.disabled = !isRunning;
        this.forceSyncStartlistsBtn.disabled = !isRunning;
        this.forceSyncResultsBtn.disabled = !isRunning;
    }

    async loadLogs() {
        try {
            this.logs = await ipcRenderer.invoke('get-logs');
            this.displayLogs();
        } catch (error) {
            console.error('Błąd ładowania logów:', error);
        }
    }

    addLogEntry(logEntry) {
        this.logs.unshift(logEntry); // Dodaj na początek
        
        // Ogranicz liczbę logów w pamięci
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(0, 1000);
        }

        // Jeśli zakładka logów jest aktywna, odśwież wyświetlanie
        if (document.getElementById('logs-tab').classList.contains('active')) {
            this.displayLogs();
        }
    }

    displayLogs() {
        const filteredLogs = this.filterLogsByLevel();
        
        if (filteredLogs.length === 0) {
            this.logsContainer.innerHTML = '<p class="empty-message">Brak logów</p>';
            return;
        }

        const html = filteredLogs.map(log => `
            <div class="log-entry ${log.level}">
                <span class="log-timestamp">${new Date(log.timestamp).toLocaleTimeString()}</span>
                <span class="log-level ${log.level}">[${log.level.toUpperCase()}]</span>
                <span class="log-message">${log.message}</span>
                ${log.data ? `\n${JSON.stringify(log.data, null, 2)}` : ''}
            </div>
        `).join('');

        this.logsContainer.innerHTML = html;
        
        // Scroll to bottom
        this.logsContainer.scrollTop = this.logsContainer.scrollHeight;
    }

    filterLogsByLevel() {
        const selectedLevel = this.logLevelFilter.value;
        if (!selectedLevel) {
            return this.logs;
        }
        return this.logs.filter(log => log.level === selectedLevel);
    }

    filterLogs() {
        this.displayLogs();
    }

    async clearLogs() {
        try {
            await ipcRenderer.invoke('clear-logs');
            this.logs = [];
            this.displayLogs();
            this.showNotification('Logi wyczyszczone', 'info');
        } catch (error) {
            console.error('Błąd czyszczenia logów:', error);
            this.showNotification('Błąd czyszczenia logów', 'error');
        }
    }

    async exportLogs() {
        // Implementacja eksportu logów
        this.showNotification('Eksport logów - funkcja w przygotowaniu', 'info');
    }

    startStatusUpdates() {
        // Aktualizuj status co sekundę
        setInterval(async () => {
            try {
                const status = await ipcRenderer.invoke('get-status');
                this.updateStatus(status);
            } catch (error) {
                console.error('Błąd aktualizacji statusu:', error);
            }
        }, 1000);
    }

    showNotification(message, type = 'info') {
        // Prosta implementacja powiadomień
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Dodaj style dla powiadomień jeśli nie istnieją
        if (!document.querySelector('.notification-styles')) {
            const style = document.createElement('style');
            style.className = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 6px;
                    color: white;
                    font-weight: 500;
                    z-index: 1000;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-success { background-color: #10b981; }
                .notification-error { background-color: #ef4444; }
                .notification-warning { background-color: #f59e0b; }
                .notification-info { background-color: #3b82f6; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        // Usuń po 3 sekundach
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
}

// Inicjalizuj UI po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    new AgentUI();
});