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
exports.CreateCompetitionDto = exports.CompetitionType = void 0;
const class_validator_1 = require("class-validator");
var CompetitionType;
(function (CompetitionType) {
    CompetitionType["OUTDOOR"] = "OUTDOOR";
    CompetitionType["INDOOR"] = "INDOOR";
    CompetitionType["ROAD"] = "ROAD";
    CompetitionType["CROSS_COUNTRY"] = "CROSS_COUNTRY";
    CompetitionType["TRAIL"] = "TRAIL";
    CompetitionType["DUATHLON"] = "DUATHLON";
    CompetitionType["TRIATHLON"] = "TRIATHLON";
    CompetitionType["MULTI_EVENT"] = "MULTI_EVENT";
})(CompetitionType || (exports.CompetitionType = CompetitionType = {}));
class CreateCompetitionDto {
    name;
    description;
    startDate;
    endDate;
    location;
    venue;
    type;
    registrationStartDate;
    registrationEndDate;
    maxParticipants;
    registrationFee;
    isPublic;
    allowLateRegistration;
    liveResultsEnabled;
    logos;
}
exports.CreateCompetitionDto = CreateCompetitionDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "venue", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(CompetitionType),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "registrationStartDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateCompetitionDto.prototype, "registrationEndDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCompetitionDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateCompetitionDto.prototype, "registrationFee", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCompetitionDto.prototype, "isPublic", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCompetitionDto.prototype, "allowLateRegistration", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCompetitionDto.prototype, "liveResultsEnabled", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], CreateCompetitionDto.prototype, "logos", void 0);
//# sourceMappingURL=create-competition.dto.js.map