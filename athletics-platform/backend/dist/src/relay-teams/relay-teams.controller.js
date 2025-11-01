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
exports.RelayTeamsController = void 0;
const common_1 = require("@nestjs/common");
const relay_teams_service_1 = require("./relay-teams.service");
const dto_1 = require("./dto");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
let RelayTeamsController = class RelayTeamsController {
    relayTeamsService;
    constructor(relayTeamsService) {
        this.relayTeamsService = relayTeamsService;
    }
    create(createRelayTeamDto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.relayTeamsService.create(createRelayTeamDto, userId);
    }
    findByCompetition(competitionId) {
        return this.relayTeamsService.findByCompetition(competitionId);
    }
    findOne(id) {
        return this.relayTeamsService.findOne(id);
    }
    update(id, updateRelayTeamDto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.relayTeamsService.update(id, updateRelayTeamDto, userId);
    }
    remove(id, req) {
        const userId = req.user.sub || req.user.userId;
        return this.relayTeamsService.remove(id, userId);
    }
    addMember(teamId, addMemberDto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.relayTeamsService.addMember(teamId, addMemberDto, userId);
    }
    removeMember(teamId, memberId, req) {
        const userId = req.user.sub || req.user.userId;
        return this.relayTeamsService.removeMember(teamId, memberId, userId);
    }
    debugMembers(teamId) {
        return this.relayTeamsService.debugMembers(teamId);
    }
    fixMembers(teamId) {
        return this.relayTeamsService.fixTeamMembers(teamId);
    }
    registerForEvent(registrationDto, req) {
        const userId = req.user.sub || req.user.userId;
        return this.relayTeamsService.registerForEvent(registrationDto, userId);
    }
    getEventRegistrations(eventId) {
        return this.relayTeamsService.getEventRegistrations(eventId);
    }
    addResult(resultDto) {
        return this.relayTeamsService.addResult(resultDto);
    }
    getEventResults(eventId) {
        return this.relayTeamsService.getEventResults(eventId);
    }
};
exports.RelayTeamsController = RelayTeamsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'COACH'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateRelayTeamDto, Object]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('competition/:competitionId'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "findByCompetition", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateRelayTeamDto, Object]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/members'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.AddRelayTeamMemberDto, Object]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "addMember", null);
__decorate([
    (0, common_1.Delete)(':teamId/members/:memberId'),
    __param(0, (0, common_1.Param)('teamId')),
    __param(1, (0, common_1.Param)('memberId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "removeMember", null);
__decorate([
    (0, common_1.Get)(':teamId/debug-members'),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "debugMembers", null);
__decorate([
    (0, common_1.Post)(':teamId/fix-members'),
    __param(0, (0, common_1.Param)('teamId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "fixMembers", null);
__decorate([
    (0, common_1.Post)('registrations'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateRelayTeamRegistrationDto, Object]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "registerForEvent", null);
__decorate([
    (0, common_1.Get)('events/:eventId/registrations'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "getEventRegistrations", null);
__decorate([
    (0, common_1.Post)('results'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateRelayTeamResultDto]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "addResult", null);
__decorate([
    (0, common_1.Get)('events/:eventId/results'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RelayTeamsController.prototype, "getEventResults", null);
exports.RelayTeamsController = RelayTeamsController = __decorate([
    (0, common_1.Controller)('relay-teams'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [relay_teams_service_1.RelayTeamsService])
], RelayTeamsController);
//# sourceMappingURL=relay-teams.controller.js.map