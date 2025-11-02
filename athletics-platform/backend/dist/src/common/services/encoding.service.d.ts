export declare class EncodingService {
    decodeCsvBuffer(buffer: Buffer): string;
    private hasUtf8Bom;
    private isValidPolishText;
    convertToUtf8(text: string, sourceEncoding?: string): string;
    detectEncoding(buffer: Buffer): string;
}
