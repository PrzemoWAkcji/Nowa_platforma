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
exports.ImportFileDto = exports.ImportFinishlynxDto = exports.FinishlynxAthleteResultDto = exports.FinishlynxEventDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class FinishlynxEventDto {
    eventNumber;
    round;
    heat;
    eventName;
    timestamp;
}
exports.FinishlynxEventDto = FinishlynxEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxEventDto.prototype, "eventNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxEventDto.prototype, "round", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxEventDto.prototype, "heat", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxEventDto.prototype, "eventName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxEventDto.prototype, "timestamp", void 0);
class FinishlynxAthleteResultDto {
    startNumber;
    position;
    lastName;
    firstName;
    club;
    licenseNumber;
    result;
    reactionTime;
    wind;
    status;
}
exports.FinishlynxAthleteResultDto = FinishlynxAthleteResultDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "startNumber", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "position", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "club", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "licenseNumber", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "result", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "reactionTime", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "wind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], FinishlynxAthleteResultDto.prototype, "status", void 0);
class ImportFinishlynxDto {
    events;
    results;
    competitionId;
}
exports.ImportFinishlynxDto = ImportFinishlynxDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FinishlynxEventDto),
    __metadata("design:type", Array)
], ImportFinishlynxDto.prototype, "events", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => FinishlynxAthleteResultDto),
    __metadata("design:type", Array)
], ImportFinishlynxDto.prototype, "results", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportFinishlynxDto.prototype, "competitionId", void 0);
class ImportFileDto {
    fileType;
    fileContent;
    competitionId;
}
exports.ImportFileDto = ImportFileDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportFileDto.prototype, "fileType", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportFileDto.prototype, "fileContent", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ImportFileDto.prototype, "competitionId", void 0);
//# sourceMappingURL=import-finishlynx.dto.js.map