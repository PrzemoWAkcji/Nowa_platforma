import { Injectable } from '@nestjs/common';
import * as iconv from 'iconv-lite';

@Injectable()
export class EncodingService {
  /**
   * Inteligentnie wykrywa i dekoduje plik CSV z polskimi znakami
   * Priorytet: Windows-1250 (najczęstsze w Polsce) -> UTF-8 -> ISO-8859-2
   */
  decodeCsvBuffer(buffer: Buffer): string {
    try {
      // 1. Sprawdź czy plik ma BOM UTF-8
      if (this.hasUtf8Bom(buffer)) {
        return buffer.toString('utf-8');
      }

      // 2. Spróbuj UTF-8 (coraz częściej używane)
      const utf8Result = buffer.toString('utf-8');
      if (!utf8Result.includes('�') && this.isValidPolishText(utf8Result)) {
        return utf8Result;
      }

      // 3. Spróbuj Windows-1250 (domyślne dla starszych polskich systemów)
      const windows1250Result = iconv.decode(buffer, 'windows-1250');
      if (this.isValidPolishText(windows1250Result)) {
        return windows1250Result;
      }

      // 4. Spróbuj ISO-8859-2
      const iso88592Result = iconv.decode(buffer, 'iso-8859-2');
      if (this.isValidPolishText(iso88592Result)) {
        return iso88592Result;
      }

      // 5. Ostatnia próba - CP852 (DOS)
      const cp852Result = iconv.decode(buffer, 'cp852');
      if (this.isValidPolishText(cp852Result)) {
        return cp852Result;
      }

      // 6. Fallback do Windows-1250 (najczęstsze)
      return windows1250Result;
    } catch (error) {
      // Ostateczny fallback do UTF-8
      return buffer.toString('utf-8');
    }
  }

  /**
   * Sprawdza czy plik ma BOM UTF-8
   */
  private hasUtf8Bom(buffer: Buffer): boolean {
    return (
      buffer.length >= 3 &&
      buffer[0] === 0xef &&
      buffer[1] === 0xbb &&
      buffer[2] === 0xbf
    );
  }

  /**
   * Sprawdza czy tekst zawiera sensowne polskie znaki i nagłówki
   */
  private isValidPolishText(text: string): boolean {
    // Sprawdź polskie znaki
    const hasPolishChars = /[ąćęłńóśźż]/i.test(text);

    // Sprawdź typowe nagłówki z polskich plików CSV
    const hasValidHeaders =
      text.includes('Pełna nazwa') ||
      text.includes('metrów') ||
      text.includes('Imię') ||
      text.includes('Nazwisko') ||
      text.includes('Data') ||
      text.includes('Klub');

    // Sprawdź czy nie ma znaków zastępczych
    const hasNoReplacementChars = !text.includes('�');

    return (hasPolishChars || hasValidHeaders) && hasNoReplacementChars;
  }

  /**
   * Konwertuje tekst z jednego kodowania na UTF-8
   */
  convertToUtf8(text: string, sourceEncoding: string = 'windows-1250'): string {
    try {
      // Jeśli tekst już jest w UTF-8, zwróć go
      if (sourceEncoding === 'utf-8') {
        return text;
      }

      // Konwertuj z podanego kodowania na UTF-8
      const buffer = iconv.encode(text, sourceEncoding);
      return iconv.decode(buffer, 'utf-8');
    } catch (error) {
      return text; // Zwróć oryginalny tekst w przypadku błędu
    }
  }

  /**
   * Wykrywa kodowanie pliku na podstawie zawartości
   */
  detectEncoding(buffer: Buffer): string {
    if (this.hasUtf8Bom(buffer)) {
      return 'utf-8';
    }

    const utf8Test = buffer.toString('utf-8');
    if (!utf8Test.includes('�') && this.isValidPolishText(utf8Test)) {
      return 'utf-8';
    }

    const windows1250Test = iconv.decode(buffer, 'windows-1250');
    if (this.isValidPolishText(windows1250Test)) {
      return 'windows-1250';
    }

    const iso88592Test = iconv.decode(buffer, 'iso-8859-2');
    if (this.isValidPolishText(iso88592Test)) {
      return 'iso-8859-2';
    }

    // Domyślnie zwróć Windows-1250 (najczęstsze w Polsce)
    return 'windows-1250';
  }
}
