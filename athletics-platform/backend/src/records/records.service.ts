import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRecordDto } from './dto/create-record.dto';
import { UpdateRecordDto } from './dto/update-record.dto';
import type { Record } from '@prisma/client';

@Injectable()
export class RecordsService {
  constructor(private prisma: PrismaService) {}

  async create(createRecordDto: CreateRecordDto, userId?: string) {
    // Sprawdź czy istnieje już aktywny rekord dla tej kombinacji
    const existingRecord = await this.prisma.record.findFirst({
      where: {
        type: createRecordDto.type as any,
        eventName: createRecordDto.eventName,
        gender: createRecordDto.gender as any,
        category: createRecordDto.category as any,
        nationality: createRecordDto.nationality,
        isActive: true,
        isIndoor: createRecordDto.isIndoor || false,
      },
    });

    // Konwertuj wynik na wartość numeryczną
    const resultValue = this.parseResultToValue(
      createRecordDto.result,
      createRecordDto.unit,
    );

    // Jeśli istnieje rekord, sprawdź czy nowy jest lepszy
    if (existingRecord) {
      const isNewRecordBetter = this.isResultBetter(
        resultValue,
        existingRecord.resultValue,
        createRecordDto.unit,
      );

      if (!isNewRecordBetter) {
        throw new BadRequestException(
          `Podany wynik (${createRecordDto.result}) nie jest lepszy od aktualnego rekordu (${existingRecord.result})`,
        );
      }

      // Dezaktywuj stary rekord
      await this.prisma.record.update({
        where: { id: existingRecord.id },
        data: {
          isActive: false,
          supersededDate: new Date(),
        },
      });
    }

    // Utwórz nowy rekord
    const newRecord = await this.prisma.record.create({
      data: {
        ...createRecordDto,
        resultValue,
        createdBy: userId || undefined,
      } as any,
    });

    // Jeśli istniał stary rekord, połącz je relacją
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

  async findAll(filters?: {
    type?: string;
    eventName?: string;
    gender?: string;
    category?: string;
    nationality?: string;
    isActive?: boolean;
    isIndoor?: boolean;
  }) {
    return this.prisma.record.findMany({
      where: {
        ...filters,
      } as any,
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

  async findOne(id: string) {
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
      throw new NotFoundException('Record not found');
    }

    return record;
  }

  async update(id: string, updateRecordDto: UpdateRecordDto) {
    const record = await this.findOne(id);

    // Jeśli aktualizujemy wynik, przelicz wartość numeryczną
    let resultValue = record.resultValue;
    if (updateRecordDto.result) {
      resultValue = this.parseResultToValue(
        updateRecordDto.result,
        updateRecordDto.unit || record.unit,
      );
    }

    return this.prisma.record.update({
      where: { id },
      data: {
        ...updateRecordDto,
        resultValue,
      } as any,
    });
  }

  async remove(id: string) {
    const record = await this.findOne(id);
    return this.prisma.record.delete({
      where: { id },
    });
  }

  /**
   * Pobiera najlepszy rekord dla danej kombinacji parametrów
   */
  async getBestRecord(
    eventName: string,
    type: string,
    gender: string,
    category: string,
    nationality?: string,
    isIndoor: boolean = false,
  ) {
    return this.prisma.record.findFirst({
      where: {
        eventName,
        type: type as any,
        gender: gender as any,
        category: category as any,
        nationality,
        isIndoor,
        isActive: true,
        isRatified: true,
      },
      orderBy: {
        resultValue: 'asc', // Dla biegów - mniejszy czas jest lepszy
      },
    });
  }

  /**
   * Sprawdza czy wynik może być rekordem
   */
  async checkPotentialRecord(
    eventName: string,
    result: string,
    unit: string,
    gender: string,
    category: string,
    nationality: string,
    isIndoor: boolean = false,
  ) {
    const resultValue = this.parseResultToValue(result, unit);
    
    const checks = {
      world: false,
      national: false,
      regional: false,
    };

    // Sprawdź rekord świata
    const worldRecord = await this.getBestRecord(
      eventName,
      'WORLD',
      gender,
      category,
      undefined,
      isIndoor,
    );
    if (worldRecord) {
      checks.world = this.isResultBetter(resultValue, worldRecord.resultValue, unit);
    }

    // Sprawdź rekord kraju
    const nationalRecord = await this.getBestRecord(
      eventName,
      'NATIONAL',
      gender,
      category,
      nationality,
      isIndoor,
    );
    if (nationalRecord) {
      checks.national = this.isResultBetter(resultValue, nationalRecord.resultValue, unit);
    }

    return checks;
  }

  /**
   * Pobiera statystyki rekordów
   */
  async getRecordStatistics() {
    const [
      totalRecords,
      worldRecords,
      nationalRecords,
      recordsByType,
      recordsByGender,
      recentRecords,
    ] = await Promise.all([
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

  /**
   * Konwertuje wynik tekstowy na wartość numeryczną
   */
  private parseResultToValue(result: string, unit: string): number {
    try {
      if (unit === 'TIME') {
        // Format: "10.50" lub "2:15.30" lub "1:23:45.67"
        if (result.includes(':')) {
          const parts = result.split(':');
          if (parts.length === 2) {
            // mm:ss.ms
            return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
          } else if (parts.length === 3) {
            // hh:mm:ss.ms
            return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
          }
        }
        return parseFloat(result);
      }

      if (unit === 'DISTANCE' || unit === 'HEIGHT') {
        // Usuń jednostki i konwertuj na metry
        return parseFloat(result.replace(/[^\d.]/g, ''));
      }

      if (unit === 'POINTS') {
        return parseFloat(result);
      }

      return parseFloat(result);
    } catch {
      throw new BadRequestException(`Invalid result format: ${result}`);
    }
  }

  /**
   * Sprawdza czy wynik jest lepszy od istniejącego rekordu
   */
  private isResultBetter(newResult: number, currentRecord: number, unit: string): boolean {
    if (unit === 'TIME') {
      // Dla czasu - mniejszy jest lepszy
      return newResult < currentRecord;
    }
    // Dla odległości, wysokości i punktów - większy jest lepszy
    return newResult > currentRecord;
  }

  /**
   * Importuje rekordy z pliku CSV
   */
  async importRecords(csvData: string, userId?: string) {
    const lines = csvData.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim());
    
    const imported: any[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim());
        const recordData = {};
        
        headers.forEach((header, index) => {
          recordData[header] = values[index];
        });

        // Walidacja wymaganych pól
        const requiredFields = ['eventName', 'result', 'unit', 'gender', 'category', 'type', 'athleteName', 'nationality', 'date'];
        const missingFields = requiredFields.filter(field => !recordData[field]);
        
        if (missingFields.length > 0) {
          errors.push(`Linia ${i + 1}: Brakuje pól: ${missingFields.join(', ')}`);
          continue;
        }

        // Konwertuj datę
        recordData['date'] = new Date(recordData['date']);
        recordData['isIndoor'] = recordData['isIndoor'] === 'true';
        recordData['isRatified'] = recordData['isRatified'] !== 'false';

        const record = await this.create(recordData as CreateRecordDto, userId);
        imported.push(record);
      } catch (error) {
        errors.push(`Linia ${i + 1}: ${error.message}`);
      }
    }

    return {
      imported: imported.length,
      errors,
      records: imported,
    };
  }
}