"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecordsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let RecordsService = class RecordsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createRecordDto, userId) {
        const existingRecord = await this.prisma.record.findFirst({
            where: {
                type: createRecordDto.type,
                eventName: createRecordDto.eventName,
                gender: createRecordDto.gender,
                category: createRecordDto.category,
                nationality: createRecordDto.nationality,
                isActive: true,
                isIndoor: createRecordDto.isIndoor || false,
            },
        });
        const resultValue = this.parseResultToValue(createRecordDto.result, createRecordDto.unit);
        if (existingRecord) {
            const isNewRecordBetter = this.isResultBetter(resultValue, existingRecord.resultValue, createRecordDto.unit);
            if (!isNewRecordBetter) {
                throw new common_1.BadRequestException(`Podany wynik (${createRecordDto.result}) nie jest lepszy od aktualnego rekordu (${existingRecord.result})`);
            }
            await this.prisma.record.update({
                where: { id: existingRecord.id },
                data: {
                    isActive: false,
                    supersededDate: new Date(),
                },
            });
        }
        const newRecord = await this.prisma.record.create({
            data: {
                ...createRecordDto,
                resultValue,
                createdBy: userId || undefined,
            },
        });
        if (existingRecord) {
            await this.prisma.record.update({
                where: { id: existingRecord.id },
                data: {
                    supersededBy: newRecord.id,
                },
            });
        }
        return newRecord;
    }
    async findAll(filters) {
        return this.prisma.record.findMany({
            where: {
                ...filters,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                supersededByRecord: true,
            },
            orderBy: [
                { type: 'asc' },
                { eventName: 'asc' },
                { gender: 'asc' },
                { category: 'asc' },
                { date: 'desc' },
            ],
        });
    }
    async findOne(id) {
        const record = await this.prisma.record.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                    },
                },
                supersededByRecord: true,
                supersededRecords: true,
            },
        });
        if (!record) {
            throw new common_1.NotFoundException('Record not found');
        }
        return record;
    }
    async update(id, updateRecordDto) {
        const record = await this.findOne(id);
        let resultValue = record.resultValue;
        if (updateRecordDto.result) {
            resultValue = this.parseResultToValue(updateRecordDto.result, updateRecordDto.unit || record.unit);
        }
        return this.prisma.record.update({
            where: { id },
            data: {
                ...updateRecordDto,
                resultValue,
            },
        });
    }
    async remove(id) {
        const record = await this.findOne(id);
        return this.prisma.record.delete({
            where: { id },
        });
    }
    async getBestRecord(eventName, type, gender, category, nationality, isIndoor = false) {
        return this.prisma.record.findFirst({
            where: {
                eventName,
                type: type,
                gender: gender,
                category: category,
                nationality,
                isIndoor,
                isActive: true,
                isRatified: true,
            },
            orderBy: {
                resultValue: 'asc',
            },
        });
    }
    async checkPotentialRecord(eventName, result, unit, gender, category, nationality, isIndoor = false) {
        const resultValue = this.parseResultToValue(result, unit);
        const checks = {
            world: false,
            national: false,
            regional: false,
        };
        const worldRecord = await this.getBestRecord(eventName, 'WORLD', gender, category, undefined, isIndoor);
        if (worldRecord) {
            checks.world = this.isResultBetter(resultValue, worldRecord.resultValue, unit);
        }
        const nationalRecord = await this.getBestRecord(eventName, 'NATIONAL', gender, category, nationality, isIndoor);
        if (nationalRecord) {
            checks.national = this.isResultBetter(resultValue, nationalRecord.resultValue, unit);
        }
        return checks;
    }
    async getRecordStatistics() {
        const [totalRecords, worldRecords, nationalRecords, recordsByType, recordsByGender, recentRecords,] = await Promise.all([
            this.prisma.record.count({ where: { isActive: true } }),
            this.prisma.record.count({ where: { type: 'WORLD', isActive: true } }),
            this.prisma.record.count({ where: { type: 'NATIONAL', isActive: true } }),
            this.prisma.record.groupBy({
                by: ['type'],
                where: { isActive: true },
                _count: { id: true },
            }),
            this.prisma.record.groupBy({
                by: ['gender'],
                where: { isActive: true },
                _count: { id: true },
            }),
            this.prisma.record.findMany({
                where: { isActive: true },
                orderBy: { date: 'desc' },
                take: 10,
                select: {
                    id: true,
                    eventName: true,
                    result: true,
                    athleteName: true,
                    nationality: true,
                    date: true,
                    type: true,
                },
            }),
        ]);
        return {
            totalRecords,
            worldRecords,
            nationalRecords,
            recordsByType: recordsByType.reduce((acc, item) => {
                acc[item.type] = item._count.id;
                return acc;
            }, {}),
            recordsByGender: recordsByGender.reduce((acc, item) => {
                acc[item.gender] = item._count.id;
                return acc;
            }, {}),
            recentRecords,
        };
    }
    parseResultToValue(result, unit) {
        try {
            if (unit === 'TIME') {
                if (result.includes(':')) {
                    const parts = result.split(':');
                    if (parts.length === 2) {
                        return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
                    }
                    else if (parts.length === 3) {
                        return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
                    }
                }
                return parseFloat(result);
            }
            if (unit === 'DISTANCE' || unit === 'HEIGHT') {
                return parseFloat(result.replace(/[^\d.]/g, ''));
            }
            if (unit === 'POINTS') {
                return parseFloat(result);
            }
            return parseFloat(result);
        }
        catch {
            throw new common_1.BadRequestException(`Invalid result format: ${result}`);
        }
    }
    isResultBetter(newResult, currentRecord, unit) {
        if (unit === 'TIME') {
            return newResult < currentRecord;
        }
        return newResult > currentRecord;
    }
    async importRecords(csvData, userId) {
        const lines = csvData.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const imported = [];
        const errors = [];
        for (let i = 1; i < lines.length; i++) {
            try {
                const values = lines[i].split(',').map(v => v.trim());
                const recordData = {};
                headers.forEach((header, index) => {
                    recordData[header] = values[index];
                });
                const requiredFields = ['eventName', 'result', 'unit', 'gender', 'category', 'type', 'athleteName', 'nationality', 'date'];
                const missingFields = requiredFields.filter(field => !recordData[field]);
                if (missingFields.length > 0) {
                    errors.push(`Linia ${i + 1}: Brakuje pól: ${missingFields.join(', ')}`);
                    continue;
                }
                recordData['date'] = new Date(recordData['date']);
                recordData['isIndoor'] = recordData['isIndoor'] === 'true';
                recordData['isRatified'] = recordData['isRatified'] !== 'false';
                const record = await this.create(recordData, userId);
                imported.push(record);
            }
            catch (error) {
                errors.push(`Linia ${i + 1}: ${error.message}`);
            }
        }
        return {
            imported: imported.length,
            errors,
            records: imported,
        };
    }
};
exports.RecordsService = RecordsService;
exports.RecordsService = RecordsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RecordsService);
//# sourceMappingURL=records.service.js.map