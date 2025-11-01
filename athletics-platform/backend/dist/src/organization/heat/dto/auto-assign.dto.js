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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdvancedAutoAssignDto = exports.AutoAssignDto = exports.AssignmentMethodEnum = void 0;
const class_validator_1 = require("class-validator");
var AssignmentMethodEnum;
(function (AssignmentMethodEnum) {
    AssignmentMethodEnum["MANUAL"] = "MANUAL";
    AssignmentMethodEnum["SEED_TIME"] = "SEED_TIME";
    AssignmentMethodEnum["RANDOM"] = "RANDOM";
    AssignmentMethodEnum["SERPENTINE"] = "SERPENTINE";
    AssignmentMethodEnum["STRAIGHT_FINAL"] = "STRAIGHT_FINAL";
    AssignmentMethodEnum["ALPHABETICAL_NUMBER"] = "ALPHABETICAL_NUMBER";
    AssignmentMethodEnum["ALPHABETICAL_NAME"] = "ALPHABETICAL_NAME";
    AssignmentMethodEnum["ROUND_ROBIN"] = "ROUND_ROBIN";
    AssignmentMethodEnum["ZIGZAG"] = "ZIGZAG";
    AssignmentMethodEnum["BY_RESULT"] = "BY_RESULT";
    AssignmentMethodEnum["BY_RESULT_INDOOR"] = "BY_RESULT_INDOOR";
    AssignmentMethodEnum["BEST_TO_WORST"] = "BEST_TO_WORST";
    AssignmentMethodEnum["WORST_TO_BEST"] = "WORST_TO_BEST";
    AssignmentMethodEnum["HALF_AND_HALF"] = "HALF_AND_HALF";
    AssignmentMethodEnum["PAIRS"] = "PAIRS";
    AssignmentMethodEnum["PAIRS_INDOOR"] = "PAIRS_INDOOR";
    AssignmentMethodEnum["STANDARD_OUTSIDE"] = "STANDARD_OUTSIDE";
    AssignmentMethodEnum["STANDARD_INSIDE"] = "STANDARD_INSIDE";
    AssignmentMethodEnum["WATERFALL"] = "WATERFALL";
    AssignmentMethodEnum["WATERFALL_REVERSE"] = "WATERFALL_REVERSE";
    AssignmentMethodEnum["WA_HALVES_AND_PAIRS"] = "WA_HALVES_AND_PAIRS";
    AssignmentMethodEnum["WA_SPRINTS_STRAIGHT"] = "WA_SPRINTS_STRAIGHT";
    AssignmentMethodEnum["WA_200M"] = "WA_200M";
    AssignmentMethodEnum["WA_400M_800M"] = "WA_400M_800M";
    AssignmentMethodEnum["WA_9_LANES"] = "WA_9_LANES";
})(AssignmentMethodEnum || (exports.AssignmentMethodEnum = AssignmentMethodEnum = {}));
class AutoAssignDto {
    eventId;
    round;
    method;
    maxLanes;
    heatsCount;
    finalistsCount;
}
exports.AutoAssignDto = AutoAssignDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoAssignDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AutoAssignDto.prototype, "round", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AssignmentMethodEnum),
    __metadata("design:type", String)
], AutoAssignDto.prototype, "method", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AutoAssignDto.prototype, "maxLanes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AutoAssignDto.prototype, "heatsCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AutoAssignDto.prototype, "finalistsCount", void 0);
class AdvancedAutoAssignDto {
    eventId;
    round;
    seriesMethod;
    laneMethod;
    maxLanes;
    heatsCount;
    finalistsCount;
    maxLanesIndoor;
    seedingCriteria;
}
exports.AdvancedAutoAssignDto = AdvancedAutoAssignDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdvancedAutoAssignDto.prototype, "eventId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], AdvancedAutoAssignDto.prototype, "round", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AssignmentMethodEnum),
    __metadata("design:type", String)
], AdvancedAutoAssignDto.prototype, "seriesMethod", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AssignmentMethodEnum),
    __metadata("design:type", String)
], AdvancedAutoAssignDto.prototype, "laneMethod", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdvancedAutoAssignDto.prototype, "maxLanes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdvancedAutoAssignDto.prototype, "heatsCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdvancedAutoAssignDto.prototype, "finalistsCount", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], AdvancedAutoAssignDto.prototype, "maxLanesIndoor", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], AdvancedAutoAssignDto.prototype, "seedingCriteria", void 0);
//# sourceMappingURL=auto-assign.dto.js.map