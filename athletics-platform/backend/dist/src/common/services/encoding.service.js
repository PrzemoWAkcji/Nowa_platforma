"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncodingService = void 0;
const common_1 = require("@nestjs/common");
const iconv = require("iconv-lite");
let EncodingService = class EncodingService {
    decodeCsvBuffer(buffer) {
        try {
            if (this.hasUtf8Bom(buffer)) {
                return buffer.toString('utf-8');
            }
            const utf8Result = buffer.toString('utf-8');
            if (!utf8Result.includes('�') && this.isValidPolishText(utf8Result)) {
                return utf8Result;
            }
            const windows1250Result = iconv.decode(buffer, 'windows-1250');
            if (this.isValidPolishText(windows1250Result)) {
                return windows1250Result;
            }
            const iso88592Result = iconv.decode(buffer, 'iso-8859-2');
            if (this.isValidPolishText(iso88592Result)) {
                return iso88592Result;
            }
            const cp852Result = iconv.decode(buffer, 'cp852');
            if (this.isValidPolishText(cp852Result)) {
                return cp852Result;
            }
            return windows1250Result;
        }
        catch (error) {
            return buffer.toString('utf-8');
        }
    }
    hasUtf8Bom(buffer) {
        return (buffer.length >= 3 &&
            buffer[0] === 0xef &&
            buffer[1] === 0xbb &&
            buffer[2] === 0xbf);
    }
    isValidPolishText(text) {
        const hasPolishChars = /[ąćęłńóśźż]/i.test(text);
        const hasValidHeaders = text.includes('Pełna nazwa') ||
            text.includes('metrów') ||
            text.includes('Imię') ||
            text.includes('Nazwisko') ||
            text.includes('Data') ||
            text.includes('Klub');
        const hasNoReplacementChars = !text.includes('�');
        return (hasPolishChars || hasValidHeaders) && hasNoReplacementChars;
    }
    convertToUtf8(text, sourceEncoding = 'windows-1250') {
        try {
            if (sourceEncoding === 'utf-8') {
                return text;
            }
            const buffer = iconv.encode(text, sourceEncoding);
            return iconv.decode(buffer, 'utf-8');
        }
        catch (error) {
            return text;
        }
    }
    detectEncoding(buffer) {
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
        return 'windows-1250';
    }
};
exports.EncodingService = EncodingService;
exports.EncodingService = EncodingService = __decorate([
    (0, common_1.Injectable)()
], EncodingService);
//# sourceMappingURL=encoding.service.js.map