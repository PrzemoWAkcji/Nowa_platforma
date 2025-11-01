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
exports.EquipmentController = void 0;
const common_1 = require("@nestjs/common");
const equipment_service_1 = require("./equipment.service");
let EquipmentController = class EquipmentController {
    equipmentService;
    constructor(equipmentService) {
        this.equipmentService = equipmentService;
    }
    getAllCategories() {
        return {
            categories: this.equipmentService.getAllCategories().map((category) => ({
                value: category,
                label: this.equipmentService.getCategoryDescription(category),
            })),
        };
    }
    getEquipmentSpecs(category, discipline, gender) {
        if (!category || !discipline || !gender) {
            return {
                error: 'Missing required parameters: category, discipline, gender',
            };
        }
        const specs = this.equipmentService.getEquipmentSpecs(category, discipline, gender);
        return {
            category,
            discipline,
            gender,
            specs,
        };
    }
    getCategoryDescription(category) {
        if (!category) {
            return { error: 'Missing category parameter' };
        }
        return {
            category,
            description: this.equipmentService.getCategoryDescription(category),
        };
    }
};
exports.EquipmentController = EquipmentController;
__decorate([
    (0, common_1.Get)('categories'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], EquipmentController.prototype, "getAllCategories", null);
__decorate([
    (0, common_1.Get)('specs'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('discipline')),
    __param(2, (0, common_1.Query)('gender')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], EquipmentController.prototype, "getEquipmentSpecs", null);
__decorate([
    (0, common_1.Get)('category-description'),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], EquipmentController.prototype, "getCategoryDescription", null);
exports.EquipmentController = EquipmentController = __decorate([
    (0, common_1.Controller)('equipment'),
    __metadata("design:paramtypes", [equipment_service_1.EquipmentService])
], EquipmentController);
//# sourceMappingURL=equipment.controller.js.map