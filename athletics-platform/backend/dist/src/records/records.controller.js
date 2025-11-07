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
exports.RecordsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const public_decorator_1 = require("../auth/decorators/public.decorator");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const create_record_dto_1 = require("./dto/create-record.dto");
const update_record_dto_1 = require("./dto/update-record.dto");
const records_service_1 = require("./records.service");
let RecordsController = class RecordsController {
    recordsService;
    constructor(recordsService) {
        this.recordsService = recordsService;
    }
    create(createRecordDto) {
        return this.recordsService.create(createRecordDto);
    }
    findAll(type, eventName, gender, category, nationality, isActive, isIndoor) {
        const filters = {};
        if (type)
            filters['type'] = type;
        if (eventName)
            filters['eventName'] = eventName;
        if (gender)
            filters['gender'] = gender;
        if (category)
            filters['category'] = category;
        if (nationality)
            filters['nationality'] = nationality;
        if (isActive !== undefined)
            filters['isActive'] = isActive === 'true';
        if (isIndoor !== undefined)
            filters['isIndoor'] = isIndoor === 'true';
        return this.recordsService.findAll(filters);
    }
    getStatistics() {
        return this.recordsService.getRecordStatistics();
    }
    checkPotentialRecord(eventName, result, unit, gender, category, nationality, isIndoor) {
        return this.recordsService.checkPotentialRecord(eventName, result, unit, gender, category, nationality, isIndoor === 'true');
    }
    getBestRecord(eventName, type, gender, category, nationality, isIndoor) {
        return this.recordsService.getBestRecord(eventName, type, gender, category, nationality, isIndoor === 'true');
    }
    async importRecords(file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        const csvData = file.buffer.toString('utf-8');
        return this.recordsService.importRecords(csvData);
    }
    findOne(id) {
        return this.recordsService.findOne(id);
    }
    update(id, updateRecordDto) {
        return this.recordsService.update(id, updateRecordDto);
    }
    remove(id) {
        return this.recordsService.remove(id);
    }
};
exports.RecordsController = RecordsController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_record_dto_1.CreateRecordDto]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('type')),
    __param(1, (0, common_1.Query)('eventName')),
    __param(2, (0, common_1.Query)('gender')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('nationality')),
    __param(5, (0, common_1.Query)('isActive')),
    __param(6, (0, common_1.Query)('isIndoor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('statistics'),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('check-potential'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('eventName')),
    __param(1, (0, common_1.Query)('result')),
    __param(2, (0, common_1.Query)('unit')),
    __param(3, (0, common_1.Query)('gender')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('nationality')),
    __param(6, (0, common_1.Query)('isIndoor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "checkPotentialRecord", null);
__decorate([
    (0, common_1.Get)('best'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('eventName')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('gender')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('nationality')),
    __param(5, (0, common_1.Query)('isIndoor')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "getBestRecord", null);
__decorate([
    (0, common_1.Post)('import'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecordsController.prototype, "importRecords", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'ORGANIZER'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_record_dto_1.UpdateRecordDto]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RecordsController.prototype, "remove", null);
exports.RecordsController = RecordsController = __decorate([
    (0, common_1.Controller)('records'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [records_service_1.RecordsService])
], RecordsController);
//# sourceMappingURL=records.controller.js.map