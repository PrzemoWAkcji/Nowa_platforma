const { app, BrowserWindow, ipcMain, dialog, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const AgentCore = require('./core/agent-core');
const logger = require('./utils/logger');

// Konfiguracja
const store = new Store();
let mainWindow;
let tray;
let agentCore;

// Sprawdź czy aplikacja już działa
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Ktoś próbował uruchomić drugą instancję, pokaż okno
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);
}

function createWindow() {
  // Główne okno
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    icon: path.join(__dirname, '../assets/icon.png'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    show: false
  });

  mainWindow.loadFile('src/renderer/index.html');

  // Pokaż okno gdy jest gotowe
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    
    // Inicjalizuj Agent Core
    agentCore = new AgentCore(mainWindow);
    
    // Załaduj ostatnią konfigurację
    const lastConfig = store.get('lastConfiguration');
    if (lastConfig) {
      agentCore.loadConfiguration(lastConfig);
    }
  });

  // Minimalizuj do tray zamiast zamykać
  mainWindow.on('close', (event) => {
    if (!app.isQuiting) {
      event.preventDefault();
      mainWindow.hide();
      
      if (process.platform === 'win32') {
        tray.displayBalloon({
          title: 'Athletics Platform Agent',
          content: 'Aplikacja działa w tle. Kliknij ikonę aby przywrócić okno.'
        });
      }
    }
  });

  createTray();
  createMenu();
  setupIPC();
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png');
  const trayIcon = nativeImage.createFromPath(iconPath);
  tray = new Tray(trayIcon.resize({ width: 16, height: 16 }));
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Pokaż okno',
      click: () => {
        mainWindow.show();
      }
    },
    {
      label: 'Status połączenia',
      enabled: false
    },
    { type: 'separator' },
    {
      label: 'Start synchronizacji',
      click: () => {
        if (agentCore) {
          agentCore.startSync();
        }
      }
    },
    {
      label: 'Stop synchronizacji',
      click: () => {
        if (agentCore) {
          agentCore.stopSync();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Zamknij',
      click: () => {
        app.isQuiting = true;
        app.quit();
      }
    }
  ]);
  
  tray.setContextMenu(contextMenu);
  tray.setToolTip('Athletics Platform Agent');
  
  tray.on('double-click', () => {
    mainWindow.show();
  });
}

function createMenu() {
  const template = [
    {
      label: 'Plik',
      submenu: [
        {
          label: 'Wczytaj konfigurację...',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            const result = await dialog.showOpenDialog(mainWindow, {
              properties: ['openFile'],
              filters: [
                { name: 'Pliki konfiguracji', extensions: ['json', 'roster'] }
              ]
            });
            
            if (!result.canceled && result.filePaths.length > 0) {
              const configPath = result.filePaths[0];
              if (agentCore) {
                agentCore.loadConfigurationFromFile(configPath);
              }
            }
          }
        },
        {
          label: 'Zapisz konfigurację...',
          accelerator: 'CmdOrCtrl+S',
          click: async () => {
            const result = await dialog.showSaveDialog(mainWindow, {
              filters: [
                { name: 'Pliki konfiguracji', extensions: ['json'] }
              ]
            });
            
            if (!result.canceled && result.filePath) {
              if (agentCore) {
                agentCore.saveConfigurationToFile(result.filePath);
              }
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Zamknij',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => {
            app.isQuiting = true;
            app.quit();
          }
        }
      ]
    },
    {
      label: 'Synchronizacja',
      submenu: [
        {
          label: 'Start',
          accelerator: 'F5',
          click: () => {
            if (agentCore) {
              agentCore.startSync();
            }
          }
        },
        {
          label: 'Stop',
          accelerator: 'F6',
          click: () => {
            if (agentCore) {
              agentCore.stopSync();
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Wymuś synchronizację list startowych',
          click: () => {
            if (agentCore) {
              agentCore.forceSyncStartLists();
            }
          }
        },
        {
          label: 'Wymuś synchronizację wyników',
          click: () => {
            if (agentCore) {
              agentCore.forceSyncResults();
            }
          }
        }
      ]
    },
    {
      label: 'Narzędzia',
      submenu: [
        {
          label: 'Otwórz katalog wejściowy',
          click: () => {
            if (agentCore && agentCore.config.inputDirectory) {
              require('electron').shell.openPath(agentCore.config.inputDirectory);
            }
          }
        },
        {
          label: 'Otwórz katalog wyjściowy',
          click: () => {
            if (agentCore && agentCore.config.outputDirectory) {
              require('electron').shell.openPath(agentCore.config.outputDirectory);
            }
          }
        },
        { type: 'separator' },
        {
          label: 'Wyczyść logi',
          click: () => {
            if (agentCore) {
              agentCore.clearLogs();
            }
          }
        },
        {
          label: 'Otwórz narzędzia deweloperskie',
          accelerator: 'F12',
          click: () => {
            mainWindow.webContents.openDevTools();
          }
        }
      ]
    },
    {
      label: 'Pomoc',
      submenu: [
        {
          label: 'O programie',
          click: () => {
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'O programie',
              message: 'Athletics Platform Agent',
              detail: 'Wersja 1.0.0\n\nAgent do synchronizacji z systemem FinishLynx\n\n© 2024 Athletics Platform'
            });
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function setupIPC() {
  // Komunikacja z renderer process
  ipcMain.handle('get-config', () => {
    return agentCore ? agentCore.getConfig() : {};
  });

  ipcMain.handle('set-config', (event, config) => {
    if (agentCore) {
      agentCore.setConfig(config);
      store.set('lastConfiguration', config);
    }
  });

  ipcMain.handle('start-sync', () => {
    if (agentCore) {
      return agentCore.startSync();
    }
  });

  ipcMain.handle('stop-sync', () => {
    if (agentCore) {
      return agentCore.stopSync();
    }
  });

  ipcMain.handle('get-status', () => {
    return agentCore ? agentCore.getStatus() : {};
  });

  ipcMain.handle('get-logs', () => {
    return agentCore ? agentCore.getLogs() : [];
  });

  ipcMain.handle('select-directory', async (event, title) => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: title || 'Wybierz katalog'
    });
    
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle('test-connection', async (event, serverUrl, apiKey) => {
    if (agentCore) {
      return await agentCore.testConnection(serverUrl, apiKey);
    }
    return { success: false, error: 'Agent nie jest zainicjalizowany' };
  });
}

app.on('window-all-closed', () => {
  // Na macOS aplikacje zwykle pozostają aktywne nawet gdy wszystkie okna są zamknięte
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuiting = true;
  
  if (agentCore) {
    agentCore.cleanup();
  }
});

// Obsługa błędów
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});