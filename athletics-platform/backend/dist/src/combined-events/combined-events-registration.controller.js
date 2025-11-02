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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CombinedEventsRegistrationController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const combined_events_registration_service_1 = require("./combined-events-registration.service");
const generate_individual_events_dto_1 = require("./dto/generate-individual-events.dto");
let CombinedEventsRegistrationController = class CombinedEventsRegistrationController {
    registrationService;
    constructor(registrationService) {
        this.registrationService = registrationService;
    }
    async registerAthlete(dto) {
        try {
            return await this.registrationService.registerAthleteForCombinedEvent(dto);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas rejestracji zawodnika na wielobój';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async bulkRegisterAthletes(dto) {
        try {
            return await this.registrationService.bulkRegisterAthletesForCombinedEvent(dto);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas masowej rejestracji zawodników';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async splitCombinedEvent(combinedEventId, dto) {
        try {
            return await this.registrationService.splitCombinedEventIntoSeparateEvents({
                combinedEventId,
                createRegistrations: dto.createRegistrations,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas rozdzielania wieloboju na konkurencje';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getCombinedEventRegistrations(competitionId) {
        try {
            return await this.registrationService.getCombinedEventRegistrations(competitionId);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas pobierania rejestracji na wieloboje';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    getAvailableEvents() {
        return [
            {
                type: 'PENTATHLON_U16_MALE',
                name: 'Pięciobój U16 chłopcy',
                description: '110m ppł, Skok w dal, Kula 5kg, Skok wzwyż, 1000m',
                gender: 'MALE',
                disciplines: ['110H', 'LJ', 'SP', 'HJ', '1000M'],
                category: 'U16',
            },
            {
                type: 'PENTATHLON_U16_FEMALE',
                name: 'Pięciobój U16 dziewczęta',
                description: '80m ppł, Skok wzwyż, Kula 3kg, Skok w dal, 600m',
                gender: 'FEMALE',
                disciplines: ['80H', 'HJ', 'SP', 'LJ', '600M'],
                category: 'U16',
            },
            {
                type: 'PENTATHLON_INDOOR',
                name: 'Pięciobój (indoor)',
                description: '60m ppł, Skok wzwyż, Kula, Skok w dal, 800m',
                gender: 'BOTH',
                disciplines: ['60H', 'HJ', 'SP', 'LJ', '800M'],
                category: 'SENIOR',
            },
            {
                type: 'DECATHLON',
                name: 'Dziesięciobój',
                description: 'Oficjalny 10-bój męski',
                gender: 'MALE',
                disciplines: [
                    '100M',
                    'LJ',
                    'SP',
                    'HJ',
                    '400M',
                    '110H',
                    'DT',
                    'PV',
                    'JT',
                    '1500M',
                ],
                category: 'SENIOR',
            },
            {
                type: 'HEPTATHLON',
                name: 'Siedmiobój',
                description: 'Oficjalny 7-bój żeński',
                gender: 'FEMALE',
                disciplines: ['100H', 'HJ', 'SP', '200M', 'LJ', 'JT', '800M'],
                category: 'SENIOR',
            },
        ];
    }
    async generateIndividualEvents(dto) {
        try {
            return await this.registrationService.generateIndividualEventsFromCombinedEvents(dto);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas generowania konkurencji składowych';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async getCombinedEventsForGeneration(competitionId) {
        try {
            return await this.registrationService.getCombinedEventsForGeneration(competitionId);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas pobierania konkurencji wielobojowych';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
};
exports.CombinedEventsRegistrationController = CombinedEventsRegistrationController;
__decorate([
    (0, common_1.Post)('register'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'COACH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CombinedEventsRegistrationController.prototype, "registerAthlete", null);
__decorate([
    (0, common_1.Post)('bulk-register'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'COACH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CombinedEventsRegistrationController.prototype, "bulkRegisterAthletes", null);
__decorate([
    (0, common_1.Post)('split/:combinedEventId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('combinedEventId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CombinedEventsRegistrationController.prototype, "splitCombinedEvent", null);
__decorate([
    (0, common_1.Get)('competition/:competitionId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsRegistrationController.prototype, "getCombinedEventRegistrations", null);
__decorate([
    (0, common_1.Get)('available-events'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CombinedEventsRegistrationController.prototype, "getAvailableEvents", null);
__decorate([
    (0, common_1.Post)('generate-individual-events'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [generate_individual_events_dto_1.GenerateIndividualEventsDto]),
    __metadata("design:returntype", Promise)
], CombinedEventsRegistrationController.prototype, "generateIndividualEvents", null);
__decorate([
    (0, common_1.Get)('competition/:competitionId/combined-events-for-generation'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsRegistrationController.prototype, "getCombinedEventsForGeneration", null);
exports.CombinedEventsRegistrationController = CombinedEventsRegistrationController = __decorate([
    (0, common_1.Controller)('combined-events-registration'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [combined_events_registration_service_1.CombinedEventsRegistrationService])
], CombinedEventsRegistrationController);
//# sourceMappingURL=combined-events-registration.controller.js.map