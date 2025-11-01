const winston = require('winston');
const path = require('path');

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000; // Maksymalna liczba logów w pamięci
    
    // Konfiguracja Winston
    this.winston = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
      defaultMeta: { service: 'athletics-platform-agent' },
      transports: [
        // Zapisuj błędy do pliku
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs', 'error.log'), 
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        // Zapisuj wszystkie logi do pliku
        new winston.transports.File({ 
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ]
    });

    // W trybie deweloperskim dodaj konsolę
    if (process.env.NODE_ENV !== 'production') {
      this.winston.add(new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }));
    }
  }

  log(level, message, meta = null) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level,
      message: message,
      meta: meta
    };

    // Dodaj do pamięci
    this.logs.push(logEntry);
    
    // Ogranicz liczbę logów w pamięci
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Zapisz przez Winston
    this.winston.log(level, message, meta);
  }

  info(message, meta = null) {
    this.log('info', message, meta);
  }

  warn(message, meta = null) {
    this.log('warn', message, meta);
  }

  error(message, meta = null) {
    this.log('error', message, meta);
  }

  debug(message, meta = null) {
    this.log('debug', message, meta);
  }

  getLogs(level = null, limit = 100) {
    let filteredLogs = this.logs;
    
    if (level) {
      filteredLogs = this.logs.filter(log => log.level === level);
    }
    
    return filteredLogs.slice(-limit).reverse(); // Najnowsze na górze
  }

  clearLogs() {
    this.logs = [];
  }

  getLogStats() {
    const stats = {
      total: this.logs.length,
      info: 0,
      warn: 0,
      error: 0,
      debug: 0
    };

    this.logs.forEach(log => {
      if (stats.hasOwnProperty(log.level)) {
        stats[log.level]++;
      }
    });

    return stats;
  }

  // Eksport logów do pliku
  async exportLogs(filePath, level = null, limit = null) {
    const fs = require('fs').promises;
    
    try {
      let logsToExport = this.logs;
      
      if (level) {
        logsToExport = logsToExport.filter(log => log.level === level);
      }
      
      if (limit) {
        logsToExport = logsToExport.slice(-limit);
      }
      
      const content = logsToExport.map(log => 
        `${log.timestamp} [${log.level.toUpperCase()}] ${log.message}${log.meta ? ' ' + JSON.stringify(log.meta) : ''}`
      ).join('\n');
      
      await fs.writeFile(filePath, content, 'utf8');
      
      return { success: true, exportedCount: logsToExport.length };
    } catch (error) {
      this.error('Błąd eksportu logów', { error: error.message, filePath });
      throw error;
    }
  }

  // Konfiguracja poziomu logowania
  setLevel(level) {
    this.winston.level = level;
    this.info(`Poziom logowania zmieniony na: ${level}`);
  }

  // Sprawdź czy katalog logs istnieje, jeśli nie - utwórz
  async ensureLogDirectory() {
    const fs = require('fs').promises;
    const logDir = path.join(process.cwd(), 'logs');
    
    try {
      await fs.access(logDir);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(logDir, { recursive: true });
        this.info('Utworzono katalog logów', { path: logDir });
      }
    }
  }
}

// Singleton
const logger = new Logger();

// Upewnij się, że katalog logów istnieje
logger.ensureLogDirectory().catch(console.error);

module.exports = logger;