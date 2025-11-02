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
        const windows1250Data = iconv.decode(buffer, 'windows-1250');
        const hasPolishChars = /[ąćęłńóśźż]/i.test(windows1250Data);
        const hasValidHeaders = windows1250Data.includes('Pełna nazwa') ||
            windows1250Data.includes('metrów') ||
            windows1250Data.includes('Imię');
        if (hasPolishChars || hasValidHeaders) {
            console.log('Detected Windows-1250 encoding');
            return windows1250Data;
        }
        const utf8Test = buffer.toString('utf-8');
        if (!utf8Test.includes('�')) {
            console.log('Detected UTF-8 encoding');
            return utf8Test;
        }
        console.log('Fallback to ISO-8859-2 encoding');
        return iconv.decode(buffer, 'iso-8859-2');
    }
}
const encodingService = new EncodingService();
const testFile = 'c:/nowa platforma/test_athletes.csv';
if (fs.existsSync(testFile)) {
    const buffer = fs.readFileSync(testFile);
    console.log('Original buffer length:', buffer.length);
    console.log('First 50 bytes:', buffer.slice(0, 50));
    const decoded = encodingService.decodeCsvBuffer(buffer);
    console.log('\nDecoded content:');
    console.log(decoded);
    const polishCharsTest = /[ąćęłńóśźż]/i.test(decoded);
    console.log('\nContains Polish characters:', polishCharsTest);
    if (decoded.includes('Łódź')) {
        console.log('✅ "Łódź" correctly decoded');
    }
    else {
        console.log('❌ "Łódź" not found or incorrectly decoded');
    }
    if (decoded.includes('Małgorzata')) {
        console.log('✅ "Małgorzata" correctly decoded');
    }
    else {
        console.log('❌ "Małgorzata" not found or incorrectly decoded');
    }
    if (decoded.includes('Michał')) {
        console.log('✅ "Michał" correctly decoded');
    }
    else {
        console.log('❌ "Michał" not found or incorrectly decoded');
    }
    if (decoded.includes('Wiśniewski')) {
        console.log('✅ "Wiśniewski" correctly decoded');
    }
    else {
        console.log('❌ "Wiśniewski" not found or incorrectly decoded');
    }
    if (decoded.includes('Śląsk')) {
        console.log('✅ "Śląsk" correctly decoded');
    }
    else {
        console.log('❌ "Śląsk" not found or incorrectly decoded');
    }
}
else {
    console.log('Test file not found:', testFile);
}
//# sourceMappingURL=test-encoding.js.map