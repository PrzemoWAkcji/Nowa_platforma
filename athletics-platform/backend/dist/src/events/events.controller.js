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
var EventsController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventsController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_event_dto_1 = require("./dto/create-event.dto");
const update_event_dto_1 = require("./dto/update-event.dto");
const events_service_1 = require("./events.service");
let EventsController = EventsController_1 = class EventsController {
    eventsService;
    logger = new common_1.Logger(EventsController_1.name);
    constructor(eventsService) {
        this.eventsService = eventsService;
    }
    create(createEventDto) {
        this.logger.debug(`Creating event: ${createEventDto.name}`);
        return this.eventsService.create(createEventDto);
    }
    findAll(competitionId, type, category) {
        if (competitionId) {
            return this.eventsService.findByCompetition(competitionId);
        }
        if (type) {
            return this.eventsService.findByType(type);
        }
        if (category) {
            return this.eventsService.findByCategory(category);
        }
        return this.eventsService.findAll();
    }
    findOne(id) {
        return this.eventsService.findOne(id);
    }
    getStatistics(id) {
        return this.eventsService.getEventStatistics(id);
    }
    update(id, updateEventDto) {
        return this.eventsService.update(id, updateEventDto);
    }
    remove(id) {
        return this.eventsService.remove(id);
    }
    markAsCompleted(id) {
        return this.eventsService.markAsCompleted(id);
    }
    markAsOngoing(id) {
        return this.eventsService.markAsOngoing(id);
    }
};
exports.EventsController = EventsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_event_dto_1.CreateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('competitionId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_event_dto_1.UpdateEventDto]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "markAsCompleted", null);
__decorate([
    (0, common_1.Post)(':id/ongoing'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EventsController.prototype, "markAsOngoing", null);
exports.EventsController = EventsController = EventsController_1 = __decorate([
    (0, common_1.Controller)('events'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [events_service_1.EventsService])
], EventsController);
//# sourceMappingURL=events.controller.js.map