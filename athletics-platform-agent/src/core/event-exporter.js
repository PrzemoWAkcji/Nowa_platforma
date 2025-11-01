const fs = require('fs').promises;
const path = require('path');

class EventExporter {
  constructor() {
    this.encoding = 'utf8';
  }

  async exportEventToFile(eventData, outputDirectory) {
    try {
      // Generuj nazwę pliku na podstawie danych konkurencji
      const fileName = this.generateFileName(eventData);
      const filePath = path.join(outputDirectory, fileName);
      
      // Generuj zawartość pliku .evt
      const content = this.generateEvtContent(eventData);
      
      // Zapisz plik
      await fs.writeFile(filePath, content, this.encoding);
      
      return {
        success: true,
        fileName: fileName,
        filePath: filePath,
        athleteCount: eventData.registrations?.length || 0
      };
    } catch (error) {
      throw new Error(`Błąd eksportu konkurencji: ${error.message}`);
    }
  }

  generateFileName(eventData) {
    // Generuj nazwę pliku w formacie: Event_[numer]_[nazwa]_[runda]_[seria].evt
    const eventNumber = eventData.eventNumber || '1';
    const eventName = this.sanitizeFileName(eventData.name || 'Event');
    const round = eventData.round || 'Final';
    const heat = eventData.heat || '1';
    
    return `Event_${eventNumber}_${eventName}_${round}_${heat}.evt`;
  }

  sanitizeFileName(name) {
    // Usuń znaki niedozwolone w nazwach plików
    return name
      .replace(/[<>:"/\\|?*]/g, '')
      .replace(/\s+/g, '_')
      .substring(0, 50); // Ogranicz długość
  }

  generateEvtContent(eventData) {
    const lines = [];
    
    // Linia nagłówkowa z informacjami o konkurencji
    const headerLine = [
      eventData.eventNumber || '1',
      eventData.round || 'Final',
      eventData.heat || '1',
      eventData.name || 'Event',
      '', // Pole 5 - zwykle puste
      '', // Pole 6 - zwykle puste
      '', // Pole 7 - zwykle puste
      '', // Pole 8 - zwykle puste
      '', // Pole 9 - zwykle puste
      '', // Pole 10 - zwykle puste
      eventData.scheduledTime || '' // Zaplanowany czas
    ].join(',');
    
    lines.push(headerLine);
    
    // Linie z zawodnikami
    if (eventData.registrations && eventData.registrations.length > 0) {
      eventData.registrations.forEach((registration, index) => {
        const athlete = registration.athlete;
        
        const athleteLine = [
          '', // Pole 1 - puste dla linii zawodnika
          registration.startNumber || (index + 1).toString(), // Numer startowy
          '', // Pole 3 - pozycja (puste dla listy startowej)
          athlete.lastName || '',
          athlete.firstName || '',
          athlete.club || '',
          '', // Pole 7 - dodatkowe info
          athlete.licenseNumber || '',
          '', // Pole 9 - dodatkowe info
          '', // Pole 10 - dodatkowe info
          ''  // Pole 11 - dodatkowe info
        ].join(',');
        
        lines.push(athleteLine);
      });
    }
    
    return lines.join('\n') + '\n';
  }

  async exportMultipleEvents(eventsData, outputDirectory) {
    const results = [];
    
    for (const eventData of eventsData) {
      try {
        const result = await this.exportEventToFile(eventData, outputDirectory);
        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          eventName: eventData.name,
          error: error.message
        });
      }
    }
    
    return results;
  }

  async exportScheduleFile(scheduleData, outputDirectory) {
    try {
      const fileName = 'Schedule.sch';
      const filePath = path.join(outputDirectory, fileName);
      
      const content = this.generateSchContent(scheduleData);
      
      await fs.writeFile(filePath, content, this.encoding);
      
      return {
        success: true,
        fileName: fileName,
        filePath: filePath,
        eventCount: scheduleData.length
      };
    } catch (error) {
      throw new Error(`Błąd eksportu harmonogramu: ${error.message}`);
    }
  }

  generateSchContent(scheduleData) {
    const lines = [];
    
    scheduleData.forEach(item => {
      const line = [
        item.eventNumber || '',
        item.round || '',
        item.heat || '',
        item.scheduledTime || ''
      ].join(',');
      
      lines.push(line);
    });
    
    return lines.join('\n') + '\n';
  }

  // Metoda do generowania pliku konfiguracyjnego dla FinishLynx
  async exportFinishLynxConfig(configData, outputDirectory) {
    try {
      const fileName = 'finishlynx.cfg';
      const filePath = path.join(outputDirectory, fileName);
      
      const content = this.generateFinishLynxConfig(configData);
      
      await fs.writeFile(filePath, content, this.encoding);
      
      return {
        success: true,
        fileName: fileName,
        filePath: filePath
      };
    } catch (error) {
      throw new Error(`Błąd eksportu konfiguracji FinishLynx: ${error.message}`);
    }
  }

  generateFinishLynxConfig(configData) {
    const config = [
      '[Database]',
      `InputDirectory=${configData.inputDirectory || ''}`,
      `OutputDirectory=${configData.outputDirectory || ''}`,
      'EventCode=Unicode',
      'LIFCode=Unicode',
      '',
      '[Results]',
      'StandardPrecision=1/1000',
      'User1=Enable',
      '',
      '[Competition]',
      `Name=${configData.competitionName || ''}`,
      `Date=${configData.competitionDate || ''}`,
      `Venue=${configData.venue || ''}`,
      ''
    ];
    
    return config.join('\n');
  }

  // Walidacja katalogu wyjściowego
  async validateOutputDirectory(directory) {
    try {
      const stats = await fs.stat(directory);
      if (!stats.isDirectory()) {
        throw new Error('Podana ścieżka nie jest katalogiem');
      }
      
      // Sprawdź uprawnienia do zapisu
      await fs.access(directory, fs.constants.W_OK);
      
      return { valid: true };
    } catch (error) {
      if (error.code === 'ENOENT') {
        return { valid: false, error: 'Katalog nie istnieje' };
      } else if (error.code === 'EACCES') {
        return { valid: false, error: 'Brak uprawnień do zapisu w katalogu' };
      } else {
        return { valid: false, error: error.message };
      }
    }
  }

  // Czyszczenie starych plików
  async cleanupOldFiles(directory, maxAge = 24 * 60 * 60 * 1000) { // 24 godziny
    try {
      const files = await fs.readdir(directory);
      const now = Date.now();
      let deletedCount = 0;
      
      for (const file of files) {
        if (file.endsWith('.evt') || file.endsWith('.sch')) {
          const filePath = path.join(directory, file);
          const stats = await fs.stat(filePath);
          
          if (now - stats.mtime.getTime() > maxAge) {
            await fs.unlink(filePath);
            deletedCount++;
          }
        }
      }
      
      return { success: true, deletedCount };
    } catch (error) {
      throw new Error(`Błąd czyszczenia starych plików: ${error.message}`);
    }
  }
}

module.exports = EventExporter;