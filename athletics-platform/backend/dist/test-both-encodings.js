"use strict";
const fs = require('fs');
const iconv = require('iconv-lite');
class EncodingService {
    decodeCsvBuffer(buffer) {
        const hasUtf8Bom = buffer.length >= 3 &&
            buffer[0] === 0xef &&
            buffer[1] === 0xbb &&
            buffer[2] === 0xbf;
        if (hasUtf8Bom) {
            console.log('Detected UTF-8 BOM');
            return buffer.toString('utf-8');
        }
        const utf8Test = buffer.toString('utf-8');
        const hasReplacementChars = utf8Test.includes('�');
        const hasPolishCharsUtf8 = /[ąćęłńóśźż]/i.test(utf8Test);
        const hasValidHeadersUtf8 = utf8Test.includes('Pełna nazwa') ||
            utf8Test.includes('metrów') ||
            utf8Test.includes('Imię') ||
            utf8Test.includes('Nazwisko') ||
            utf8Test.includes('Data urodzenia');
        if (!hasReplacementChars && (hasPolishCharsUtf8 || hasValidHeadersUtf8)) {
            console.log('Detected UTF-8 encoding');
            return utf8Test;
        }
        const windows1250Data = iconv.decode(buffer, 'windows-1250');
        const hasPolishCharsWin1250 = /[ąćęłńóśźż]/i.test(windows1250Data);
        const hasValidHeadersWin1250 = windows1250Data.includes('Pełna nazwa') ||
            windows1250Data.includes('metrów') ||
            windows1250Data.includes('Imię');
        if (hasPolishCharsWin1250 || hasValidHeadersWin1250) {
            console.log('Detected Windows-1250 encoding');
            return windows1250Data;
        }
        if (!hasReplacementChars) {
            console.log('Fallback to UTF-8 encoding');
            return utf8Test;
        }
        console.log('Fallback to ISO-8859-2 encoding');
        return iconv.decode(buffer, 'iso-8859-2');
    }
}
const encodingService = new EncodingService();
console.log('=== TEST 1: UTF-8 FILE ===');
const utf8File = 'c:/nowa platforma/test_athletes.csv';
if (fs.existsSync(utf8File)) {
    const buffer = fs.readFileSync(utf8File);
    console.log('File size:', buffer.length, 'bytes');
    const decoded = encodingService.decodeCsvBuffer(buffer);
    console.log('First line:', decoded.split('\n')[0]);
    console.log('Contains "Łódź":', decoded.includes('Łódź') ? '✅' : '❌');
}
console.log('\n=== TEST 2: Windows-1250 FILE ===');
const win1250File = 'c:/nowa platforma/test_athletes_win1250.csv';
if (fs.existsSync(win1250File)) {
    const buffer = fs.readFileSync(win1250File);
    console.log('File size:', buffer.length, 'bytes');
    const decoded = encodingService.decodeCsvBuffer(buffer);
    console.log('First line:', decoded.split('\n')[0]);
    console.log('Contains "Łódź":', decoded.includes('Łódź') ? '✅' : '❌');
}
else {
    console.log('Windows-1250 test file not found');
}
//# sourceMappingURL=test-both-encodings.js.map