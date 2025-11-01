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
var StartListImportService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StartListImportService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const import_startlist_dto_1 = require("./dto/import-startlist.dto");
let StartListImportService = StartListImportService_1 = class StartListImportService {
    prisma;
    logger = new common_1.Logger(StartListImportService_1.name);
    constructor(prisma) {
        this.prisma = prisma;
    }
    async importStartList(dto) {
        try {
            const competition = await this.prisma.competition.findUnique({
                where: { id: dto.competitionId },
                include: { events: true },
            });
            if (!competition) {
                throw new common_1.BadRequestException('Zawody nie zostały znalezione');
            }
            const csvRows = this.parseCSV(dto.csvData);
            if (csvRows.length === 0) {
                throw new common_1.BadRequestException('Plik CSV jest pusty lub nieprawidłowy');
            }
            const detectedFormat = dto.format === import_startlist_dto_1.StartListFormat.AUTO
                ? this.detectFormat(csvRows[0])
                : dto.format || import_startlist_dto_1.StartListFormat.PZLA;
            const parsedEntries = this.parseEntries(csvRows, detectedFormat);
            const result = await this.processImport(dto.competitionId, parsedEntries, competition);
            return {
                success: true,
                message: `Pomyślnie zaimportowano ${result.importedCount} zawodników`,
                importedCount: result.importedCount,
                errors: result.errors,
                warnings: result.warnings,
                detectedFormat,
                entries: parsedEntries,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message || 'Błąd podczas importu',
                importedCount: 0,
                errors: [error.message],
                warnings: [],
                detectedFormat: dto.format || import_startlist_dto_1.StartListFormat.PZLA,
                entries: [],
            };
        }
    }
    parseCSV(csvData) {
        const lines = csvData.trim().split(/\r?\n/);
        if (lines.length < 2)
            return [];
        const separator = csvData.includes(';') ? ';' : ',';
        const headers = this.parseCSVLine(lines[0], separator);
        const rows = [];
        for (let i = 1; i < lines.length; i++) {
            if (lines[i].trim() === '')
                continue;
            const values = this.parseCSVLine(lines[i], separator);
            if (values.length >= headers.length - 2) {
                const row = {};
                headers.forEach((header, index) => {
                    row[header] = values[index] || '';
                });
                rows.push(row);
            }
        }
        return rows;
    }
    parseCSVLine(line, separator) {
        const result = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            }
            else if (char === separator && !inQuotes) {
                result.push(current.trim());
                current = '';
            }
            else {
                current += char;
            }
        }
        result.push(current.trim());
        return result;
    }
    detectFormat(firstRow) {
        const pzlaColumns = ['Nazwisko', 'Imię', 'DataUr', 'NazwaPZLA', 'Klub'];
        const rosterColumns = [
            'FirstName',
            'LastName',
            'DateOfBirth',
            'EventCode',
            'ClubName',
        ];
        const hasPZLAColumns = pzlaColumns.some((col) => Object.prototype.hasOwnProperty.call(firstRow, col));
        const hasRosterColumns = rosterColumns.some((col) => Object.prototype.hasOwnProperty.call(firstRow, col));
        if (hasPZLAColumns)
            return import_startlist_dto_1.StartListFormat.PZLA;
        if (hasRosterColumns)
            return import_startlist_dto_1.StartListFormat.ROSTER;
        return import_startlist_dto_1.StartListFormat.PZLA;
    }
    parseEntries(rows, format) {
        return rows
            .map((row) => {
            if (format === import_startlist_dto_1.StartListFormat.PZLA) {
                return this.parsePZLARow(row);
            }
            else {
                return this.parseRosterRow(row);
            }
        })
            .filter((entry) => entry !== null);
    }
    parsePZLARow(row) {
        try {
            const lastName = row.Nazwisko || row['Nazwisko'];
            const firstName = row['Imię'] || row['Imi�'] || row['Imie'];
            if (!lastName || !firstName || lastName === 'Nazwisko') {
                return null;
            }
            let dateOfBirth = '';
            const birthDateField = row.DataUr || row['DataUr'];
            if (birthDateField) {
                const dateMatch = birthDateField.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (dateMatch) {
                    dateOfBirth = birthDateField;
                }
            }
            const eventName = row['Pełna nazwa'] || row['Pe�na nazwa'] || row.NazwaPZLA;
            const gender = this.determineGenderFromEventName(eventName);
            const relayTeam = row.Sztafeta?.trim() || undefined;
            const relayPositionStr = row.skład?.trim() || row['sk�ad']?.trim() || undefined;
            const relayPosition = relayPositionStr
                ? parseInt(relayPositionStr, 10)
                : undefined;
            const isRelayByName = eventName &&
                (eventName.toLowerCase().includes('4x') ||
                    eventName.toLowerCase().includes('4 x') ||
                    eventName.toLowerCase().includes('sztafeta') ||
                    eventName.toLowerCase().includes('relay'));
            const isRelay = !!(relayTeam && relayPosition) || isRelayByName;
            const categoryFromEvent = this.extractCategoryFromEventName(eventName);
            return {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dateOfBirth,
                gender,
                club: row.Klub?.trim() || undefined,
                licenseNumber: row['Licencja PZLA']?.trim() || undefined,
                nationality: 'POL',
                eventName: eventName,
                eventCode: row.NrKonkur,
                category: categoryFromEvent,
                bibNumber: row.NrStart?.trim() || undefined,
                lane: row.Tor?.trim() || undefined,
                heat: row.Seria?.trim() || undefined,
                personalBest: row.PB?.trim() || undefined,
                seasonBest: row.SB?.trim() || undefined,
                relayTeam: relayTeam || (isRelayByName ? row.Klub?.trim() : undefined),
                relayPosition: relayPosition || (isRelayByName ? 1 : undefined),
                isRelay,
                coach: row.Trener?.trim() || undefined,
                notes: row.OOM?.trim() || undefined,
            };
        }
        catch (error) {
            this.logger.error('Error parsing PZLA row:', error, row);
            return null;
        }
    }
    parseRosterRow(row) {
        try {
            if (!row.LastName || !row.FirstName || row.LastName === 'LastName') {
                return null;
            }
            let dateOfBirth = '';
            if (row.DateOfBirth) {
                const dateMatch = row.DateOfBirth.match(/(\d{4})-(\d{2})-(\d{2})/);
                if (dateMatch) {
                    dateOfBirth = row.DateOfBirth;
                }
            }
            const gender = row.Gender?.toUpperCase() === 'MALE' ? 'MALE' : 'FEMALE';
            return {
                firstName: row.FirstName.trim(),
                lastName: row.LastName.trim(),
                dateOfBirth,
                gender: gender,
                club: row.ClubName?.trim() || row.ShortClubName?.trim() || undefined,
                nationality: row.CountryCode?.trim() || undefined,
                eventName: row.PZLAEventCode || row.EventCode,
                eventCode: row.EventCode,
                category: row.AgeGroup,
                bibNumber: row.BibNumber?.trim() || undefined,
                lane: row.Lane?.trim() || undefined,
                personalBest: row.PersonalBest?.trim() || undefined,
                seasonBest: row.SeasonBest?.trim() || undefined,
                seedTime: row.SeedingResult?.trim() || undefined,
                notes: [row.NotesPublic, row.NotesInternal].filter(Boolean).join('; ') ||
                    undefined,
            };
        }
        catch (error) {
            this.logger.error('Error parsing Roster row:', error, row);
            return null;
        }
    }
    determineGenderFromEventName(eventName) {
        if (!eventName)
            return 'MALE';
        const lowerName = eventName.toLowerCase();
        if (lowerName.includes('kobiet') ||
            lowerName.includes('women') ||
            lowerName.includes('female') ||
            lowerName.includes('k4x') ||
            lowerName.includes('girls')) {
            return 'FEMALE';
        }
        if (lowerName.includes('mężczyzn') ||
            lowerName.includes('men') ||
            lowerName.includes('male') ||
            lowerName.includes('m4x') ||
            lowerName.includes('boys')) {
            return 'MALE';
        }
        return 'MALE';
    }
    async processImport(competitionId, entries, competition) {
        let importedCount = 0;
        const errors = [];
        const warnings = [];
        const regularEntries = entries.filter((entry) => !entry.isRelay);
        const relayEntries = entries.filter((entry) => entry.isRelay);
        for (const entry of regularEntries) {
            try {
                const result = await this.processRegularEntry(competitionId, entry, competition);
                if (result.success) {
                    importedCount++;
                }
                else {
                    warnings.push(result.message);
                }
            }
            catch (error) {
                errors.push(`Błąd dla ${entry.firstName} ${entry.lastName}: ${error.message}`);
            }
        }
        if (relayEntries.length > 0) {
            try {
                const relayResult = await this.processRelayEntries(competitionId, relayEntries, competition);
                importedCount += relayResult.importedCount;
                errors.push(...relayResult.errors);
                warnings.push(...relayResult.warnings);
            }
            catch (error) {
                errors.push(`Błąd podczas przetwarzania sztafet: ${error.message}`);
            }
        }
        return { importedCount, errors, warnings };
    }
    async processRegularEntry(competitionId, entry, competition) {
        const athlete = await this.findOrCreateAthlete(entry);
        const event = await this.findOrCreateEvent(competitionId, entry);
        const existingRegistration = await this.prisma.registration.findFirst({
            where: {
                athleteId: athlete.id,
                competitionId: competitionId,
            },
        });
        let registration;
        if (existingRegistration) {
            registration = existingRegistration;
        }
        else {
            registration = await this.prisma.registration.create({
                data: {
                    athleteId: athlete.id,
                    competitionId: competitionId,
                    userId: competition.createdById,
                    status: 'CONFIRMED',
                    bibNumber: entry.bibNumber,
                    seedTime: entry.seedTime || entry.personalBest || entry.seasonBest,
                    notes: entry.notes,
                },
            });
        }
        const existingEventRegistration = await this.prisma.registrationEvent.findFirst({
            where: {
                registrationId: registration.id,
                eventId: event.id,
            },
        });
        if (!existingEventRegistration) {
            await this.prisma.registrationEvent.create({
                data: {
                    registrationId: registration.id,
                    eventId: event.id,
                    seedTime: entry.seedTime || entry.personalBest || entry.seasonBest,
                },
            });
            return { success: true, message: 'Zaimportowano zawodnika' };
        }
        else {
            return {
                success: false,
                message: `Zawodnik ${entry.firstName} ${entry.lastName} już jest zarejestrowany na konkurencję ${entry.eventName}`,
            };
        }
    }
    async processRelayEntries(competitionId, entries, competition) {
        const errors = [];
        const warnings = [];
        let importedCount = 0;
        const groupedEntries = this.groupRelayEntries(entries);
        for (const [clubName, eventGroups] of Object.entries(groupedEntries)) {
            for (const [eventName, athletes] of Object.entries(eventGroups)) {
                try {
                    const event = await this.findOrCreateEvent(competitionId, athletes[0]);
                    const teams = this.createRelayTeams(clubName, athletes);
                    for (const [teamIndex, teamAthletes] of teams.entries()) {
                        const teamName = teams.length > 1
                            ? `${clubName} ${this.numberToRoman(teamIndex + 1)}`
                            : clubName;
                        const relayTeam = await this.findOrCreateRelayTeam(competitionId, teamName, clubName, competition.createdById);
                        for (const athleteEntry of teamAthletes) {
                            const athlete = await this.findOrCreateAthlete(athleteEntry);
                            const position = athleteEntry.relayPosition || 1;
                            await this.addAthleteToRelayTeam(relayTeam.id, athlete.id, position, position > 4);
                        }
                        await this.registerRelayTeamForEvent(relayTeam.id, event.id);
                        importedCount += teamAthletes.length;
                    }
                }
                catch (error) {
                    errors.push(`Błąd dla klubu ${clubName} w konkurencji ${eventName}: ${error.message}`);
                }
            }
        }
        return { importedCount, errors, warnings };
    }
    groupRelayEntries(entries) {
        const grouped = {};
        for (const entry of entries) {
            const clubName = entry.club || 'Nieznany klub';
            const eventName = entry.eventName;
            if (!grouped[clubName]) {
                grouped[clubName] = {};
            }
            if (!grouped[clubName][eventName]) {
                grouped[clubName][eventName] = [];
            }
            grouped[clubName][eventName].push(entry);
        }
        for (const club of Object.values(grouped)) {
            for (const athletes of Object.values(club)) {
                athletes.sort((a, b) => (a.relayPosition || 999) - (b.relayPosition || 999));
                athletes.forEach((athlete, index) => {
                    if (!athlete.relayPosition) {
                        athlete.relayPosition = index + 1;
                    }
                });
            }
        }
        return grouped;
    }
    createRelayTeams(clubName, athletes) {
        const teams = [];
        const maxTeamSize = 6;
        for (let i = 0; i < athletes.length; i += maxTeamSize) {
            const teamAthletes = athletes.slice(i, i + maxTeamSize);
            teamAthletes.forEach((athlete, index) => {
                athlete.relayPosition = index + 1;
            });
            teams.push(teamAthletes);
        }
        return teams;
    }
    async findOrCreateRelayTeam(competitionId, teamName, clubName, createdById) {
        const existingTeam = await this.prisma.relayTeam.findFirst({
            where: {
                name: teamName,
                competitionId: competitionId,
            },
        });
        if (existingTeam) {
            return existingTeam;
        }
        return await this.prisma.relayTeam.create({
            data: {
                name: teamName,
                club: clubName,
                competitionId: competitionId,
                createdById: createdById,
            },
        });
    }
    async addAthleteToRelayTeam(teamId, athleteId, position, isReserve) {
        const existingMember = await this.prisma.relayTeamMember.findFirst({
            where: {
                teamId: teamId,
                athleteId: athleteId,
            },
        });
        if (existingMember) {
            return existingMember;
        }
        const existingPosition = await this.prisma.relayTeamMember.findFirst({
            where: {
                teamId: teamId,
                position: position,
            },
        });
        if (existingPosition) {
            const existingPositions = await this.prisma.relayTeamMember.findMany({
                where: { teamId: teamId },
                select: { position: true },
            });
            const usedPositions = existingPositions.map((p) => p.position);
            let newPosition = 1;
            while (usedPositions.includes(newPosition)) {
                newPosition++;
            }
            position = newPosition;
            isReserve = newPosition > 4;
        }
        return await this.prisma.relayTeamMember.create({
            data: {
                teamId: teamId,
                athleteId: athleteId,
                position: position,
                isReserve: isReserve,
            },
        });
    }
    async registerRelayTeamForEvent(teamId, eventId) {
        const existingRegistration = await this.prisma.relayTeamRegistration.findFirst({
            where: {
                teamId: teamId,
                eventId: eventId,
            },
        });
        if (existingRegistration) {
            return existingRegistration;
        }
        return await this.prisma.relayTeamRegistration.create({
            data: {
                teamId: teamId,
                eventId: eventId,
            },
        });
    }
    numberToRoman(num) {
        const romanNumerals = [
            'I',
            'II',
            'III',
            'IV',
            'V',
            'VI',
            'VII',
            'VIII',
            'IX',
            'X',
        ];
        return romanNumerals[num - 1] || num.toString();
    }
    async findOrCreateAthlete(entry) {
        if (entry.licenseNumber) {
            const existingByLicense = await this.prisma.athlete.findUnique({
                where: { licenseNumber: entry.licenseNumber },
            });
            if (existingByLicense)
                return existingByLicense;
        }
        const existingByName = await this.prisma.athlete.findFirst({
            where: {
                firstName: entry.firstName,
                lastName: entry.lastName,
                dateOfBirth: entry.dateOfBirth
                    ? new Date(entry.dateOfBirth)
                    : undefined,
            },
        });
        if (existingByName)
            return existingByName;
        return await this.prisma.athlete.create({
            data: {
                firstName: entry.firstName,
                lastName: entry.lastName,
                dateOfBirth: entry.dateOfBirth
                    ? new Date(entry.dateOfBirth)
                    : new Date(),
                gender: entry.gender,
                club: entry.club,
                licenseNumber: entry.licenseNumber,
                nationality: entry.nationality,
                category: this.determineCategoryFromAge(entry.dateOfBirth),
            },
        });
    }
    async findOrCreateEvent(competitionId, entry) {
        const category = entry.category
            ? this.mapCategory(entry.category)
            : this.determineCategoryFromAge(entry.dateOfBirth);
        const existing = await this.prisma.event.findFirst({
            where: {
                competitionId,
                name: entry.eventName,
                gender: entry.gender,
                category: category,
            },
        });
        if (existing)
            return existing;
        return await this.prisma.event.create({
            data: {
                name: entry.eventName,
                competitionId,
                type: this.determineEventType(entry.eventName),
                gender: entry.gender,
                category: category,
                unit: this.determineUnit(entry.eventName),
            },
        });
    }
    determineCategoryFromAge(dateOfBirth) {
        if (!dateOfBirth)
            return client_1.Category.SENIOR;
        const birthDate = new Date(dateOfBirth);
        const currentYear = new Date().getFullYear();
        const birthYear = birthDate.getFullYear();
        const age = currentYear - birthYear;
        if (age <= 8)
            return client_1.Category.U8;
        if (age <= 9)
            return client_1.Category.U9;
        if (age <= 10)
            return client_1.Category.U10;
        if (age <= 11)
            return client_1.Category.U11;
        if (age <= 12)
            return client_1.Category.U12;
        if (age <= 13)
            return client_1.Category.U13;
        if (age <= 14)
            return client_1.Category.U14;
        if (age <= 15)
            return client_1.Category.U15;
        if (age <= 16)
            return client_1.Category.U16;
        if (age <= 18)
            return client_1.Category.U18;
        if (age <= 20)
            return client_1.Category.U20;
        if (age <= 23)
            return client_1.Category.U23;
        if (age >= 35 && age < 40)
            return client_1.Category.M35;
        if (age >= 40 && age < 45)
            return client_1.Category.M40;
        if (age >= 45 && age < 50)
            return client_1.Category.M45;
        if (age >= 50 && age < 55)
            return client_1.Category.M50;
        if (age >= 55 && age < 60)
            return client_1.Category.M55;
        if (age >= 60 && age < 65)
            return client_1.Category.M60;
        if (age >= 65 && age < 70)
            return client_1.Category.M65;
        if (age >= 70 && age < 75)
            return client_1.Category.M70;
        if (age >= 75 && age < 80)
            return client_1.Category.M75;
        if (age >= 80 && age < 85)
            return client_1.Category.M80;
        if (age >= 85 && age < 90)
            return client_1.Category.M85;
        if (age >= 90 && age < 95)
            return client_1.Category.M90;
        if (age >= 95 && age < 100)
            return client_1.Category.M95;
        if (age >= 100)
            return client_1.Category.M100;
        return client_1.Category.SENIOR;
    }
    mapCategory(category) {
        if (!category)
            return client_1.Category.SENIOR;
        const categoryUpper = category.toUpperCase().trim();
        const categoryMap = {
            '8': client_1.Category.AGE_8,
            '9': client_1.Category.AGE_9,
            '10': client_1.Category.AGE_10,
            '11': client_1.Category.AGE_11,
            '12': client_1.Category.AGE_12,
            '13': client_1.Category.AGE_13,
            '14': client_1.Category.AGE_14,
            '15': client_1.Category.AGE_15,
            '16': client_1.Category.AGE_16,
            '17': client_1.Category.AGE_17,
            '18': client_1.Category.AGE_18,
            U8: client_1.Category.U8,
            U9: client_1.Category.U9,
            U10: client_1.Category.U10,
            U11: client_1.Category.U11,
            U12: client_1.Category.U12,
            U13: client_1.Category.U13,
            U14: client_1.Category.U14,
            U15: client_1.Category.U15,
            U16: client_1.Category.U16,
            U18: client_1.Category.U18,
            U20: client_1.Category.U20,
            U23: client_1.Category.U23,
            M35: client_1.Category.M35,
            M40: client_1.Category.M40,
            M45: client_1.Category.M45,
            M50: client_1.Category.M50,
            M55: client_1.Category.M55,
            M60: client_1.Category.M60,
            M65: client_1.Category.M65,
            M70: client_1.Category.M70,
            M75: client_1.Category.M75,
            M80: client_1.Category.M80,
            M85: client_1.Category.M85,
            M90: client_1.Category.M90,
            M95: client_1.Category.M95,
            M100: client_1.Category.M100,
            SENIOR: client_1.Category.SENIOR,
            SEN: client_1.Category.SENIOR,
        };
        return categoryMap[categoryUpper] || client_1.Category.SENIOR;
    }
    extractCategoryFromEventName(eventName) {
        if (!eventName)
            return undefined;
        const name = eventName.toLowerCase();
        const categoryPatterns = [
            /\bu18\b/i,
            /\bu20\b/i,
            /\bu16\b/i,
            /\bu15\b/i,
            /\bu14\b/i,
            /\bu13\b/i,
            /\bu12\b/i,
            /\bu11\b/i,
            /\bu10\b/i,
            /\bu9\b/i,
            /\bu8\b/i,
            /\bm35\b/i,
            /\bm40\b/i,
            /\bm45\b/i,
            /\bm50\b/i,
            /\bm55\b/i,
            /\bm60\b/i,
            /\bm65\b/i,
            /\bm70\b/i,
            /\bm75\b/i,
            /\bm80\b/i,
            /\bm85\b/i,
            /\bm90\b/i,
            /\bm95\b/i,
            /\bm100\b/i,
            /\bsenior\b/i,
            /\bsen\b/i,
        ];
        for (const pattern of categoryPatterns) {
            const match = eventName.match(pattern);
            if (match) {
                return match[0].toUpperCase();
            }
        }
        return undefined;
    }
    determineEventType(eventName) {
        const lowerName = eventName.toLowerCase();
        if (lowerName.includes('4x') ||
            lowerName.includes('4 x') ||
            lowerName.includes('sztafeta') ||
            lowerName.includes('relay')) {
            return 'RELAY';
        }
        if (lowerName.includes('skok') ||
            lowerName.includes('rzut') ||
            lowerName.includes('jump') ||
            lowerName.includes('throw') ||
            lowerName.includes('pchnięcie') ||
            lowerName.includes('shot') ||
            lowerName.includes('dysk') ||
            lowerName.includes('disk') ||
            lowerName.includes('młot') ||
            lowerName.includes('hammer') ||
            lowerName.includes('oszczep') ||
            lowerName.includes('javelin') ||
            lowerName.includes('kula') ||
            lowerName.includes('put') ||
            lowerName.includes('wzwyż') ||
            lowerName.includes('high') ||
            lowerName.includes('dal') ||
            lowerName.includes('long') ||
            lowerName.includes('tyczka') ||
            lowerName.includes('pole')) {
            return 'FIELD';
        }
        if (lowerName.includes('wielobój') ||
            lowerName.includes('combined') ||
            lowerName.includes('decathlon') ||
            lowerName.includes('heptathlon') ||
            lowerName.includes('pentathlon') ||
            lowerName.includes('10-bój') ||
            lowerName.includes('7-bój') ||
            lowerName.includes('5-bój')) {
            return 'COMBINED';
        }
        if (lowerName.includes('maraton') ||
            lowerName.includes('marathon') ||
            lowerName.includes('półmaraton') ||
            lowerName.includes('half') ||
            (lowerName.includes('km') && !lowerName.includes('m '))) {
            return 'ROAD';
        }
        return 'TRACK';
    }
    determineUnit(eventName) {
        const lowerName = eventName.toLowerCase();
        if (lowerName.includes('wzwyż') ||
            lowerName.includes('high') ||
            lowerName.includes('tyczka') ||
            lowerName.includes('pole')) {
            return 'HEIGHT';
        }
        if (lowerName.includes('skok') ||
            lowerName.includes('rzut') ||
            lowerName.includes('jump') ||
            lowerName.includes('throw') ||
            lowerName.includes('pchnięcie') ||
            lowerName.includes('shot') ||
            lowerName.includes('dysk') ||
            lowerName.includes('disk') ||
            lowerName.includes('młot') ||
            lowerName.includes('hammer') ||
            lowerName.includes('oszczep') ||
            lowerName.includes('javelin') ||
            lowerName.includes('kula') ||
            lowerName.includes('put') ||
            lowerName.includes('dal') ||
            lowerName.includes('long')) {
            return 'DISTANCE';
        }
        if (lowerName.includes('wielobój') ||
            lowerName.includes('combined') ||
            lowerName.includes('decathlon') ||
            lowerName.includes('heptathlon') ||
            lowerName.includes('pentathlon') ||
            lowerName.includes('10-bój') ||
            lowerName.includes('7-bój') ||
            lowerName.includes('5-bój')) {
            return 'POINTS';
        }
        return 'TIME';
    }
};
exports.StartListImportService = StartListImportService;
exports.StartListImportService = StartListImportService = StartListImportService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], StartListImportService);
//# sourceMappingURL=startlist-import.service.js.map