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
exports.HeatController = void 0;
const common_1 = require("@nestjs/common");
const heat_service_1 = require("./heat.service");
const create_heat_dto_1 = require("./dto/create-heat.dto");
const update_heat_dto_1 = require("./dto/update-heat.dto");
const auto_assign_dto_1 = require("./dto/auto-assign.dto");
const jwt_auth_guard_1 = require("../../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../../auth/guards/roles.guard");
const roles_decorator_1 = require("../../auth/decorators/roles.decorator");
let HeatController = class HeatController {
    heatService;
    constructor(heatService) {
        this.heatService = heatService;
    }
    create(createHeatDto) {
        return this.heatService.create(createHeatDto);
    }
    findAll(eventId, round) {
        return this.heatService.findAll(eventId, round);
    }
    getEventHeats(eventId) {
        return this.heatService.getEventHeats(eventId);
    }
    findOne(id) {
        return this.heatService.findOne(id);
    }
    update(id, updateHeatDto) {
        return this.heatService.update(id, updateHeatDto);
    }
    remove(id) {
        return this.heatService.remove(id);
    }
    autoAssign(autoAssignDto) {
        return this.heatService.autoAssign(autoAssignDto);
    }
    advancedAutoAssign(advancedAutoAssignDto) {
        return this.heatService.advancedAutoAssign(advancedAutoAssignDto);
    }
};
exports.HeatController = HeatController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH', 'JUDGE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_heat_dto_1.CreateHeatDto]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('eventId')),
    __param(1, (0, common_1.Query)('round')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('event/:eventId'),
    __param(0, (0, common_1.Param)('eventId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "getEventHeats", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH', 'JUDGE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_heat_dto_1.UpdateHeatDto]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('auto-assign'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH', 'JUDGE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auto_assign_dto_1.AutoAssignDto]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "autoAssign", null);
__decorate([
    (0, common_1.Post)('advanced-auto-assign'),
    (0, roles_decorator_1.Roles)('ADMIN', 'COACH', 'JUDGE'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [auto_assign_dto_1.AdvancedAutoAssignDto]),
    __metadata("design:returntype", void 0)
], HeatController.prototype, "advancedAutoAssign", null);
exports.HeatController = HeatController = __decorate([
    (0, common_1.Controller)('organization/heats'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [heat_service_1.HeatService])
], HeatController);
//# sourceMappingURL=heat.controller.js.map