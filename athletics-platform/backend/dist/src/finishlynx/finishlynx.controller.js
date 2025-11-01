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
exports.FinishlynxController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const client_1 = require("@prisma/client");
const finishlynx_service_1 = require("./finishlynx.service");
const import_finishlynx_dto_1 = require("./dto/import-finishlynx.dto");
let FinishlynxController = class FinishlynxController {
    finishlynxService;
    constructor(finishlynxService) {
        this.finishlynxService = finishlynxService;
    }
    async importResults(importFinishlynxDto) {
        return this.finishlynxService.processImportedData(importFinishlynxDto);
    }
    async importFromFile(file, competitionId) {
        if (!file) {
            throw new common_1.BadRequestException('Nie przesłano pliku');
        }
        const fileContent = file.buffer.toString('utf-8');
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        let fileType;
        switch (fileExtension) {
            case 'evt':
                fileType = 'evt';
                break;
            case 'lif':
                fileType = 'lif';
                break;
            case 'sch':
                fileType = 'sch';
                break;
            default:
                throw new common_1.BadRequestException('Nieobsługiwany typ pliku. Obsługiwane: .evt, .lif, .sch');
        }
        const importFileDto = {
            fileType,
            fileContent,
            competitionId,
        };
        return this.finishlynxService.importFromFile(importFileDto);
    }
    validateFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('Nie przesłano pliku');
        }
        const fileContent = file.buffer.toString('utf-8');
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!['evt', 'lif', 'sch'].includes(fileExtension || '')) {
            throw new common_1.BadRequestException('Nieobsługiwany typ pliku. Obsługiwane: .evt, .lif, .sch');
        }
        return this.finishlynxService.validateFinishlynxFile(fileContent, fileExtension || '');
    }
    getImportHistory() {
        return this.finishlynxService.getImportHistory();
    }
    async manualImport(importFileDto) {
        return this.finishlynxService.importFromFile(importFileDto);
    }
    async previewFile(file, competitionId) {
        if (!file) {
            throw new common_1.BadRequestException('Nie przesłano pliku');
        }
        const fileContent = file.buffer.toString('utf-8');
        const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
        if (!['evt', 'lif', 'sch'].includes(fileExtension || '')) {
            throw new common_1.BadRequestException('Nieobsługiwany typ pliku. Obsługiwane: .evt, .lif, .sch');
        }
        return this.finishlynxService.previewFile(fileContent, fileExtension || '', competitionId);
    }
    async getEventMappingSuggestions(competitionId, eventName) {
        return this.finishlynxService.getEventMappingSuggestions(competitionId, decodeURIComponent(eventName));
    }
    async importWithMapping(data) {
        return this.finishlynxService.importWithCustomMapping(data.importData, data.eventMappings, data.competitionId);
    }
    async importResultsFromAgent(data) {
        return this.finishlynxService.processAgentResults(data.competitionId, data.fileName, data.results);
    }
    async exportStartLists(competitionId) {
        return this.finishlynxService.exportStartListsForAgent(competitionId);
    }
    async generateAgentConfig(competitionId, request) {
        return this.finishlynxService.generateAgentConfigFile(competitionId, request.user);
    }
};
exports.FinishlynxController = FinishlynxController;
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_finishlynx_dto_1.ImportFinishlynxDto]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "importResults", null);
__decorate([
    (0, common_1.Post)('import-file'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "importFromFile", null);
__decorate([
    (0, common_1.Post)('validate-file'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FinishlynxController.prototype, "validateFile", null);
__decorate([
    (0, common_1.Get)('import-history'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FinishlynxController.prototype, "getImportHistory", null);
__decorate([
    (0, common_1.Post)('manual-import'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_finishlynx_dto_1.ImportFileDto]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "manualImport", null);
__decorate([
    (0, common_1.Post)('preview-file'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "previewFile", null);
__decorate([
    (0, common_1.Get)('event-mapping-suggestions/:competitionId/:eventName'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Param)('competitionId')),
    __param(1, (0, common_1.Param)('eventName')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "getEventMappingSuggestions", null);
__decorate([
    (0, common_1.Post)('import-with-mapping'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "importWithMapping", null);
__decorate([
    (0, common_1.Post)('import-results-agent'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "importResultsFromAgent", null);
__decorate([
    (0, common_1.Get)('export-start-lists/:competitionId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Param)('competitionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "exportStartLists", null);
__decorate([
    (0, common_1.Get)('generate-agent-config/:competitionId'),
    (0, roles_decorator_1.Roles)(client_1.UserRole.ADMIN, client_1.UserRole.COACH),
    __param(0, (0, common_1.Param)('competitionId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FinishlynxController.prototype, "generateAgentConfig", null);
exports.FinishlynxController = FinishlynxController = __decorate([
    (0, common_1.Controller)('finishlynx'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [finishlynx_service_1.FinishlynxService])
], FinishlynxController);
//# sourceMappingURL=finishlynx.controller.js.map