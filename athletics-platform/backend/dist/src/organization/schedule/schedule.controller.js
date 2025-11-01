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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const schedule_service_1 = require("./schedule.service");
const schedule_generator_service_1 = require("./schedule-generator.service");
const create_schedule_dto_1 = require("./dto/create-schedule.dto");
const update_schedule_dto_1 = require("./dto/update-schedule.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
let ScheduleController = class ScheduleController {
    scheduleService;
    scheduleGeneratorService;
    constructor(scheduleService, scheduleGeneratorService) {
        this.scheduleService = scheduleService;
        this.scheduleGeneratorService = scheduleGeneratorService;
    }
    create(createScheduleDto) {
        return this.scheduleService.create(createScheduleDto);
    }
    findAll(competitionId) {
        return this.scheduleService.findAll(competitionId);
    }
    findOne(id) {
        return this.scheduleService.findOne(id);
    }
    update(id, updateScheduleDto) {
        return this.scheduleService.update(id, updateScheduleDto);
    }
    remove(id) {
        return this.scheduleService.remove(id);
    }
    publish(id) {
        return this.scheduleService.publish(id);
    }
    unpublish(id) {
        return this.scheduleService.unpublish(id);
    }
    updateItemStatus(scheduleId, itemId, status) {
        return this.scheduleService.updateItemStatus(scheduleId, itemId, status);
    }
    getEventParticipants(eventId) {
        return this.scheduleService.getEventParticipants(eventId);
    }
    generateSchedule(options) {
        return this.scheduleGeneratorService.generateSchedule(options);
    }
    getMinuteProgram(competitionId) {
        return this.scheduleGeneratorService.generateMinuteProgram(competitionId);
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_schedule_dto_1.CreateScheduleDto]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_schedule_dto_1.UpdateScheduleDto]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/publish'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "publish", null);
__decorate([
    (0, common_1.Post)(':id/unpublish'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "unpublish", null);
__decorate([
    (0, common_1.Patch)(':scheduleId/items/:itemId/status'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH', 'JUDGE'),
    __param(0, (0, common_1.Param)('scheduleId')),
    __param(1, (0, common_1.Param)('itemId')),
    __param(2, (0, common_1.Body)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "updateItemStatus", null);
__decorate([
    (0, common_1.Get)('events/:eventId/participants'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "getEventParticipants", null);
__decorate([
    (0, common_1.Post)('generate'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "generateSchedule", null);
__decorate([
    (0, common_1.Get)('competitions/:competitionId/minute-program'),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ScheduleController.prototype, "getMinuteProgram", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, common_1.Controller)('organization/schedules'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService,
        schedule_generator_service_1.ScheduleGeneratorService])
], ScheduleController);
//# sourceMappingURL=schedule.controller.js.map