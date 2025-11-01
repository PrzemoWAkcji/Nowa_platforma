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
exports.RegistrationsController = void 0;
const common_1 = require("@nestjs/common");
const registrations_service_1 = require("./registrations.service");
const create_registration_dto_1 = require("./dto/create-registration.dto");
const update_registration_dto_1 = require("./dto/update-registration.dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let RegistrationsController = class RegistrationsController {
    registrationsService;
    constructor(registrationsService) {
        this.registrationsService = registrationsService;
    }
    create(createRegistrationDto, req) {
        return this.registrationsService.create(createRegistrationDto, req.user.id);
    }
    findAll(competitionId, eventId, athleteId, userId) {
        if (competitionId && eventId) {
            return this.registrationsService.findByCompetitionAndEvent(competitionId, eventId);
        }
        if (competitionId) {
            return this.registrationsService.findByCompetition(competitionId);
        }
        if (athleteId) {
            return this.registrationsService.findByAthlete(athleteId);
        }
        if (userId) {
            return this.registrationsService.findByUser(userId);
        }
        return this.registrationsService.findAll();
    }
    findMyRegistrations(req) {
        return this.registrationsService.findByUser(req.user.id);
    }
    getStatistics(competitionId) {
        return this.registrationsService.getRegistrationStatistics(competitionId);
    }
    getStartListSortedByRecords(competitionId, eventId, sortBy = 'PB') {
        return this.registrationsService.getStartListSortedByRecords(competitionId, eventId, sortBy);
    }
    findOne(id) {
        return this.registrationsService.findOne(id);
    }
    update(id, updateRegistrationDto) {
        return this.registrationsService.update(id, updateRegistrationDto);
    }
    confirm(id) {
        return this.registrationsService.confirmRegistration(id);
    }
    cancel(id) {
        return this.registrationsService.cancelRegistration(id);
    }
    reject(id) {
        return this.registrationsService.rejectRegistration(id);
    }
    assignBibNumbers(competitionId, body) {
        return this.registrationsService.assignBibNumbers(competitionId, body.startingNumber || 1);
    }
    remove(id) {
        return this.registrationsService.remove(id);
    }
};
exports.RegistrationsController = RegistrationsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'COACH', 'ATHLETE'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_registration_dto_1.CreateRegistrationDto, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('competitionId')),
    __param(1, (0, common_1.Query)('eventId')),
    __param(2, (0, common_1.Query)('athleteId')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('my-registrations'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "findMyRegistrations", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('start-list/:competitionId/:eventId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __param(1, (0, common_1.Param)('eventId')),
    __param(2, (0, common_1.Query)('sortBy')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "getStartListSortedByRecords", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_registration_dto_1.UpdateRegistrationDto]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/confirm'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "confirm", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "cancel", null);
__decorate([
    (0, common_1.Patch)(':id/reject'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "reject", null);
__decorate([
    (0, common_1.Post)('assign-bib-numbers/:competitionId'),
    __param(0, (0, common_1.Param)('competitionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "assignBibNumbers", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RegistrationsController.prototype, "remove", null);
exports.RegistrationsController = RegistrationsController = __decorate([
    (0, common_1.Controller)('registrations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [registrations_service_1.RegistrationsService])
], RegistrationsController);
//# sourceMappingURL=registrations.controller.js.map