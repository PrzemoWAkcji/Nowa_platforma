class FinishLynxParser {
  constructor() {
    this.eventInfo = null;
  }

  parseLifFile(content) {
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith(';'));
    const results = [];
    
    for (const line of lines) {
      const parts = line.split(',');
      
      // Sprawdź czy to linia z informacjami o konkurencji
      if (this.isEventInfoLine(parts)) {
        this.eventInfo = this.parseEventInfo(parts);
        continue;
      }
      
      // Sprawdź czy to linia z wynikiem zawodnika
      if (this.isResultLine(parts)) {
        const result = this.parseResultLine(parts);
        if (result) {
          results.push(result);
        }
      }
    }
    
    return results;
  }

  isEventInfoLine(parts) {
    // Linia z informacjami o konkurencji ma zwykle:
    // - Numer konkurencji w pierwszej kolumnie
    // - Rundę w drugiej kolumnie  
    // - Serię w trzeciej kolumnie
    // - Nazwę konkurencji w czwartej kolumnie
    // - Czasami timestamp na końcu
    
    if (parts.length < 4) return false;
    
    // Sprawdź czy pierwsza kolumna to numer konkurencji (liczba)
    const eventNumber = parts[0].trim();
    if (!eventNumber || eventNumber.match(/^(DNS|DNF|DQ|\d+)$/)) {
      return false; // To prawdopodobnie wynik zawodnika
    }
    
    // Sprawdź czy trzecia kolumna zawiera nazwę konkurencji
    const eventName = parts[3]?.trim();
    if (!eventName || eventName.length < 3) {
      return false;
    }
    
    return true;
  }

  parseEventInfo(parts) {
    return {
      eventNumber: parts[0]?.trim() || '',
      round: parts[1]?.trim() || '',
      heat: parts[2]?.trim() || '',
      eventName: parts[3]?.trim() || '',
      timestamp: parts[10] || parts[11] || parts[parts.length - 1] || ''
    };
  }

  isResultLine(parts) {
    if (parts.length < 6) return false;
    
    const position = parts[0]?.trim();
    
    // Sprawdź czy pierwsza kolumna to pozycja lub status
    return position && (
      position.match(/^\d+$/) ||  // Pozycja numeryczna
      position === 'DNS' ||       // Did Not Start
      position === 'DNF' ||       // Did Not Finish
      position === 'DQ'           // Disqualified
    );
  }

  parseResultLine(parts) {
    try {
      const position = parts[0]?.trim();
      const startNumber = parts[1]?.trim();
      const result = parts[6]?.trim() || '';
      const licenseNumber = parts[7]?.trim();
      const reactionTime = parts[8]?.trim();
      const wind = parts[9]?.trim();
      
      // Podstawowe walidacje
      if (!licenseNumber) {
        return null; // Brak numeru licencji - nie można zidentyfikować zawodnika
      }

      const resultData = {
        position: position && position.match(/^\d+$/) ? parseInt(position) : null,
        startNumber: startNumber || '',
        result: result || '',
        licenseNumber: licenseNumber,
        reactionTime: reactionTime && !isNaN(parseFloat(reactionTime)) ? parseFloat(reactionTime) : null,
        wind: wind && !isNaN(parseFloat(wind)) ? parseFloat(wind) : null,
        status: this.determineStatus(position, result),
        club: parts[4]?.trim() || parts[5]?.trim() || '', // Klub może być w kolumnie 4 lub 5
        
        // Dodaj informacje o konkurencji jeśli dostępne
        eventInfo: this.eventInfo ? { ...this.eventInfo } : null
      };

      return resultData;
    } catch (error) {
      console.error('Błąd parsowania linii wyniku:', error, parts);
      return null;
    }
  }

  determineStatus(position, result) {
    if (position === 'DNS') return 'DNS';
    if (position === 'DNF') return 'DNF';
    if (position === 'DQ') return 'DQ';
    
    // Jeśli jest pozycja numeryczna i wynik, to prawdopodobnie ważny wynik
    if (position && position.match(/^\d+$/) && result) {
      return 'VALID';
    }
    
    // Jeśli brak wyniku ale jest pozycja, może być problemem
    if (position && position.match(/^\d+$/) && !result) {
      return 'NO_RESULT';
    }
    
    return 'UNKNOWN';
  }

  parseEvtFile(content) {
    // Parser dla plików .evt (listy startowe)
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith(';'));
    const events = [];
    const athletes = [];
    let currentEvent = null;

    for (const line of lines) {
      const parts = line.split(',');
      
      // Linia z informacjami o konkurencji
      if (parts.length >= 6 && parts[0] && !parts[0].startsWith(' ')) {
        currentEvent = {
          eventNumber: parts[0]?.trim(),
          round: parts[1]?.trim(),
          heat: parts[2]?.trim(),
          eventName: parts[3]?.trim()
        };
        events.push(currentEvent);
      } 
      // Linia z zawodnikiem
      else if (parts.length >= 8 && parts[0] === '' && currentEvent) {
        const athlete = {
          eventNumber: currentEvent.eventNumber,
          eventName: currentEvent.eventName,
          startNumber: parts[1]?.trim(),
          position: parts[2]?.trim(),
          lastName: parts[3]?.trim(),
          firstName: parts[4]?.trim(),
          club: parts[5]?.trim(),
          licenseNumber: parts[7]?.trim()
        };
        athletes.push(athlete);
      }
    }

    return { events, athletes };
  }

  parseSchFile(content) {
    // Parser dla plików .sch (harmonogram)
    const lines = content.split('\n').filter(line => line.trim() && !line.startsWith(';'));
    const schedule = [];

    for (const line of lines) {
      const parts = line.split(',');
      
      if (parts.length >= 3) {
        schedule.push({
          eventNumber: parts[0]?.trim(),
          round: parts[1]?.trim(),
          heat: parts[2]?.trim(),
          time: parts[3]?.trim() || null
        });
      }
    }

    return schedule;
  }

  // Pomocnicze metody walidacji
  validateLifFile(content) {
    try {
      const results = this.parseLifFile(content);
      return {
        valid: true,
        resultCount: results.length,
        hasEventInfo: !!this.eventInfo,
        eventInfo: this.eventInfo
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  validateEvtFile(content) {
    try {
      const data = this.parseEvtFile(content);
      return {
        valid: true,
        eventCount: data.events.length,
        athleteCount: data.athletes.length
      };
    } catch (error) {
      return {
        valid: false,
        error: error.message
      };
    }
  }

  // Metoda do czyszczenia stanu parsera
  reset() {
    this.eventInfo = null;
  }
}

module.exports = FinishLynxParser;