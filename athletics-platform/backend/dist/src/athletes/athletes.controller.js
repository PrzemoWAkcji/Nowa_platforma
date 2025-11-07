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
exports.AthletesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const athletes_service_1 = require("./athletes.service");
const create_athlete_dto_1 = require("./dto/create-athlete.dto");
const update_athlete_dto_1 = require("./dto/update-athlete.dto");
let AthletesController = class AthletesController {
    athletesService;
    constructor(athletesService) {
        this.athletesService = athletesService;
    }
    create(createAthleteDto) {
        return this.athletesService.create(createAthleteDto);
    }
    findAll(category, gender, paraAthletes) {
        if (paraAthletes === 'true') {
            return this.athletesService.findParaAthletes();
        }
        if (category) {
            return this.athletesService.findByCategory(category);
        }
        if (gender) {
            return this.athletesService.findByGender(gender);
        }
        return this.athletesService.findAll();
    }
    findByCoach(coachId) {
        return this.athletesService.findByCoach(coachId);
    }
    findOne(id) {
        return this.athletesService.findOne(id);
    }
    getStats(id) {
        return this.athletesService.getAthleteStats(id);
    }
    update(id, updateAthleteDto) {
        return this.athletesService.update(id, updateAthleteDto);
    }
    remove(id) {
        return this.athletesService.remove(id);
    }
    async importFromCsv(file, format = 'auto', updateExisting = false) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        return this.athletesService.importFromCsv(file.buffer, format, updateExisting);
    }
    getAthleteRecords(id, eventName) {
        return this.athletesService.getAthleteRecords(id, eventName);
    }
    getAthleteRankings(eventName, sortBy = 'PB', gender, category, limit = '50') {
        return this.athletesService.getAthletesSortedByRecords(eventName, sortBy, gender, category, parseInt(limit));
    }
    clearSeasonBests(year) {
        const targetYear = year ? parseInt(year) : undefined;
        return this.athletesService.clearSeasonBests(targetYear);
    }
};
exports.AthletesController = AthletesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'COACH'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_athlete_dto_1.CreateAthleteDto]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('gender')),
    __param(2, (0, common_1.Query)('paraAthletes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('coach/:coachId'),
    __param(0, (0, common_1.Param)('coachId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "findByCoach", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'COACH'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_athlete_dto_1.UpdateAthleteDto]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('import-csv'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('format')),
    __param(2, (0, common_1.Body)('updateExisting')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], AthletesController.prototype, "importFromCsv", null);
__decorate([
    (0, common_1.Get)(':id/records'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('event')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "getAthleteRecords", null);
__decorate([
    (0, common_1.Get)('rankings/:eventName'),
    __param(0, (0, common_1.Param)('eventName')),
    __param(1, (0, common_1.Query)('sortBy')),
    __param(2, (0, common_1.Query)('gender')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "getAthleteRankings", null);
__decorate([
    (0, common_1.Post)('clear-season-bests'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Query)('year')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AthletesController.prototype, "clearSeasonBests", null);
exports.AthletesController = AthletesController = __decorate([
    (0, common_1.Controller)('athletes'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [athletes_service_1.AthletesService])
], AthletesController);
//# sourceMappingURL=athletes.controller.js.map