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
exports.CompetitionsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const competitions_service_1 = require("./competitions.service");
const create_competition_dto_1 = require("./dto/create-competition.dto");
const update_competition_dto_1 = require("./dto/update-competition.dto");
const import_startlist_dto_1 = require("./dto/import-startlist.dto");
const finishlynx_service_1 = require("../finishlynx/finishlynx.service");
const startlist_import_service_1 = require("./startlist-import.service");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const iconv = require("iconv-lite");
let CompetitionsController = class CompetitionsController {
    competitionsService;
    finishlynxService;
    startListImportService;
    constructor(competitionsService, finishlynxService, startListImportService) {
        this.competitionsService = competitionsService;
        this.finishlynxService = finishlynxService;
        this.startListImportService = startListImportService;
    }
    create(createCompetitionDto) {
        return this.competitionsService.create(createCompetitionDto);
    }
    findAll() {
        return this.competitionsService.findAll();
    }
    findPublic() {
        return this.competitionsService.findPublic();
    }
    findOne(id) {
        return this.competitionsService.findOne(id);
    }
    update(id, updateCompetitionDto) {
        return this.competitionsService.update(id, updateCompetitionDto);
    }
    remove(id) {
        return this.competitionsService.remove(id);
    }
    async downloadAgentConfig(id, request, response) {
        const configData = await this.finishlynxService.generateAgentConfigFile(id, request.user);
        response.setHeader('Content-Disposition', `attachment; filename="${configData.filename}"`);
        response.setHeader('Content-Type', 'application/json');
        response.send(configData.content);
    }
    async toggleLiveResults(id, body) {
        return this.competitionsService.toggleLiveResults(id, body.enabled);
    }
    async getLiveResults(token) {
        const competition = await this.competitionsService.findByLiveResultsToken(token);
        if (!competition || !competition.liveResultsEnabled) {
            throw new Error('Live results not available');
        }
        return competition;
    }
    async getCompetitionByAgentId(agentId) {
        return this.competitionsService.findByAgentId(agentId);
    }
    async importStartList(competitionId, file, format, updateExisting, createMissingAthletes) {
        if (!file) {
            throw new common_1.BadRequestException('Plik CSV jest wymagany');
        }
        let csvData;
        try {
            csvData = file.buffer.toString('utf-8');
            if (csvData.includes('�')) {
                csvData = iconv.decode(file.buffer, 'windows-1250');
                if (csvData.includes('�')) {
                    csvData = iconv.decode(file.buffer, 'iso-8859-2');
                }
            }
        }
        catch (error) {
            csvData = file.buffer.toString('utf-8');
        }
        const importDto = {
            competitionId,
            csvData,
            format: format === 'international'
                ? import_startlist_dto_1.StartListFormat.ROSTER
                : import_startlist_dto_1.StartListFormat.PZLA,
        };
        return this.startListImportService.importStartList(importDto);
    }
    async importStartListJson(competitionId, body) {
        if (!body.csvData) {
            throw new common_1.BadRequestException('Dane CSV są wymagane');
        }
        const importDto = {
            competitionId,
            csvData: body.csvData,
            format: body.format === 'international'
                ? import_startlist_dto_1.StartListFormat.ROSTER
                : body.format === 'PZLA'
                    ? import_startlist_dto_1.StartListFormat.PZLA
                    : import_startlist_dto_1.StartListFormat.AUTO,
        };
        return this.startListImportService.importStartList(importDto);
    }
    async updateCompetitionStatuses() {
        return this.competitionsService.updateCompetitionStatuses();
    }
    async uploadLogos(competitionId, files) {
        if (!files || files.length === 0) {
            throw new common_1.BadRequestException('Nie przesłano żadnych plików');
        }
        return this.competitionsService.uploadLogos(competitionId, files);
    }
    async deleteLogo(competitionId, logoId) {
        return this.competitionsService.deleteLogo(competitionId, logoId);
    }
    async getLogos(competitionId) {
        return this.competitionsService.getLogos(competitionId);
    }
};
exports.CompetitionsController = CompetitionsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_competition_dto_1.CreateCompetitionDto]),
    __metadata("design:returntype", void 0)
], CompetitionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompetitionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('public'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CompetitionsController.prototype, "findPublic", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompetitionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_competition_dto_1.UpdateCompetitionDto]),
    __metadata("design:returntype", void 0)
], CompetitionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CompetitionsController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/agent-config'),
    (0, roles_decorator_1.Roles)('ADMIN', 'JUDGE'),
    (0, common_1.Header)('Content-Type', 'application/json'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "downloadAgentConfig", null);
__decorate([
    (0, common_1.Post)(':id/live-results/toggle'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "toggleLiveResults", null);
__decorate([
    (0, common_1.Get)('live/:token'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "getLiveResults", null);
__decorate([
    (0, common_1.Get)('agent/:agentId'),
    __param(0, (0, common_1.Param)('agentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "getCompetitionByAgentId", null);
__decorate([
    (0, common_1.Post)(':id/import-startlist'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('format')),
    __param(3, (0, common_1.Body)('updateExisting')),
    __param(4, (0, common_1.Body)('createMissingAthletes')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String, String]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "importStartList", null);
__decorate([
    (0, common_1.Post)(':id/import-startlist-json'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER', 'JUDGE'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "importStartListJson", null);
__decorate([
    (0, common_1.Post)('update-statuses'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "updateCompetitionStatuses", null);
__decorate([
    (0, common_1.Post)(':id/logos'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FilesInterceptor)('logos', 5, {
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, callback) => {
            if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|svg\+xml|webp)$/)) {
                return callback(new common_1.BadRequestException('Tylko pliki obrazów są dozwolone'), false);
            }
            callback(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "uploadLogos", null);
__decorate([
    (0, common_1.Delete)(':id/logos/:logoId'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Param)('logoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "deleteLogo", null);
__decorate([
    (0, common_1.Get)(':id/logos'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CompetitionsController.prototype, "getLogos", null);
exports.CompetitionsController = CompetitionsController = __decorate([
    (0, common_1.Controller)('competitions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [competitions_service_1.CompetitionsService,
        finishlynx_service_1.FinishlynxService,
        startlist_import_service_1.StartListImportService])
], CompetitionsController);
//# sourceMappingURL=competitions.controller.js.map