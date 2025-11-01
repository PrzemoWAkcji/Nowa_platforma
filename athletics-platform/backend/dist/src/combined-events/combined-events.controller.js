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
exports.CombinedEventsController = void 0;
const common_1 = require("@nestjs/common");
const combined_events_service_1 = require("./combined-events.service");
const create_combined_event_dto_1 = require("./dto/create-combined-event.dto");
const update_combined_event_result_dto_1 = require("./dto/update-combined-event-result.dto");
const calculate_points_dto_1 = require("./dto/calculate-points.dto");
const validate_performance_dto_1 = require("./dto/validate-performance.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const combined_events_types_1 = require("./types/combined-events.types");
let CombinedEventsController = class CombinedEventsController {
    combinedEventsService;
    constructor(combinedEventsService) {
        this.combinedEventsService = combinedEventsService;
    }
    getEventTypes() {
        return this.combinedEventsService.getAvailableEventTypes();
    }
    getDisciplines(eventType, gender) {
        try {
            if (!Object.values(combined_events_types_1.CombinedEventType).includes(eventType)) {
                throw new common_1.HttpException(`Invalid event type: ${eventType}`, common_1.HttpStatus.BAD_REQUEST);
            }
            const validGender = gender === 'FEMALE' ? 'FEMALE' : 'MALE';
            const disciplines = this.combinedEventsService.getDisciplinesForEvent(eventType, validGender);
            return { eventType, gender: validGender, disciplines };
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas pobierania dyscyplin';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async create(createDto) {
        try {
            return await this.combinedEventsService.createCombinedEvent(createDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas tworzenia wieloboju';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async findOne(id) {
        const combinedEvent = await this.combinedEventsService.getCombinedEvent(id);
        if (!combinedEvent) {
            throw new common_1.HttpException('Wielobój nie został znaleziony', common_1.HttpStatus.NOT_FOUND);
        }
        return combinedEvent;
    }
    async findByCompetition(competitionId) {
        return await this.combinedEventsService.getCombinedEventsByCompetition(competitionId);
    }
    async getRanking(competitionId, eventType) {
        if (!eventType) {
            throw new common_1.HttpException('Typ wieloboju jest wymagany', common_1.HttpStatus.BAD_REQUEST);
        }
        return await this.combinedEventsService.getCombinedEventRanking(competitionId, eventType);
    }
    async getStatistics(competitionId) {
        return await this.combinedEventsService.getCombinedEventStatistics(competitionId);
    }
    async updateResult(id, discipline, updateDto) {
        try {
            const isValid = this.combinedEventsService.validatePerformance(discipline, updateDto.performance);
            if (!isValid) {
                throw new common_1.HttpException('Nieprawidłowy format wyniku', common_1.HttpStatus.BAD_REQUEST);
            }
            return await this.combinedEventsService.updateEventResult(id, discipline, updateDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas aktualizacji wyniku';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async recalculate(id) {
        try {
            return await this.combinedEventsService.recalculateTotalPoints(id);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas przeliczania punktów';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    async remove(id) {
        try {
            return await this.combinedEventsService.deleteCombinedEvent(id);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas usuwania wieloboju';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    calculatePoints(calculatePointsDto) {
        try {
            const isValidPerformance = this.combinedEventsService.validatePerformance(calculatePointsDto.discipline, calculatePointsDto.performance);
            if (!isValidPerformance) {
                throw new common_1.HttpException('Invalid performance format or value', common_1.HttpStatus.BAD_REQUEST);
            }
            const points = this.combinedEventsService.calculatePoints(calculatePointsDto.discipline, calculatePointsDto.performance, calculatePointsDto.gender || 'MALE');
            return { points };
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : 'Błąd podczas obliczania punktów';
            throw new common_1.HttpException(errorMessage, common_1.HttpStatus.BAD_REQUEST);
        }
    }
    validatePerformance(validatePerformanceDto) {
        const isValid = this.combinedEventsService.validatePerformance(validatePerformanceDto.discipline, validatePerformanceDto.performance);
        return { isValid };
    }
};
exports.CombinedEventsController = CombinedEventsController;
__decorate([
    (0, common_1.Get)('types'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CombinedEventsController.prototype, "getEventTypes", null);
__decorate([
    (0, common_1.Get)('types/:eventType/disciplines'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('eventType')),
    __param(1, (0, common_1.Query)('gender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], CombinedEventsController.prototype, "getDisciplines", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_combined_event_dto_1.CreateCombinedEventDto]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('competition/:competitionId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "findByCompetition", null);
__decorate([
    (0, common_1.Get)('competition/:competitionId/ranking'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __param(1, (0, common_1.Query)('eventType')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "getRanking", null);
__decorate([
    (0, common_1.Get)('competition/:competitionId/statistics'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Put)(':id/discipline/:discipline'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('discipline')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_combined_event_result_dto_1.UpdateCombinedEventResultDto]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "updateResult", null);
__decorate([
    (0, common_1.Put)(':id/recalculate'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "recalculate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CombinedEventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('calculate-points'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [calculate_points_dto_1.CalculatePointsDto]),
    __metadata("design:returntype", void 0)
], CombinedEventsController.prototype, "calculatePoints", null);
__decorate([
    (0, common_1.Post)('validate-performance'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [validate_performance_dto_1.ValidatePerformanceDto]),
    __metadata("design:returntype", void 0)
], CombinedEventsController.prototype, "validatePerformance", null);
exports.CombinedEventsController = CombinedEventsController = __decorate([
    (0, common_1.Controller)('combined-events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [combined_events_service_1.CombinedEventsService])
], CombinedEventsController);
//# sourceMappingURL=combined-events.controller.js.map