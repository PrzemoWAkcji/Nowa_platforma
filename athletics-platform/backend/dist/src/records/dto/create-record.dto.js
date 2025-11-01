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
exports.CreateRecordDto = exports.Unit = exports.Gender = exports.RecordLevel = exports.RecordType = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
var RecordType;
(function (RecordType) {
    RecordType["WORLD"] = "WORLD";
    RecordType["CONTINENTAL"] = "CONTINENTAL";
    RecordType["NATIONAL"] = "NATIONAL";
    RecordType["REGIONAL"] = "REGIONAL";
    RecordType["CLUB"] = "CLUB";
    RecordType["FACILITY"] = "FACILITY";
})(RecordType || (exports.RecordType = RecordType = {}));
var RecordLevel;
(function (RecordLevel) {
    RecordLevel["SENIOR"] = "SENIOR";
    RecordLevel["JUNIOR"] = "JUNIOR";
    RecordLevel["YOUTH"] = "YOUTH";
    RecordLevel["CADETS"] = "CADETS";
    RecordLevel["MASTERS"] = "MASTERS";
    RecordLevel["PARA"] = "PARA";
})(RecordLevel || (exports.RecordLevel = RecordLevel = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["MIXED"] = "MIXED";
})(Gender || (exports.Gender = Gender = {}));
var Unit;
(function (Unit) {
    Unit["TIME"] = "TIME";
    Unit["DISTANCE"] = "DISTANCE";
    Unit["HEIGHT"] = "HEIGHT";
    Unit["POINTS"] = "POINTS";
})(Unit || (exports.Unit = Unit = {}));
class CreateRecordDto {
    type;
    level;
    eventName;
    discipline;
    gender;
    category;
    result;
    unit;
    wind;
    altitude;
    isIndoor;
    athleteName;
    nationality;
    dateOfBirth;
    competitionName;
    location;
    venue;
    date;
    isRatified;
    ratifiedBy;
    ratifiedDate;
}
exports.CreateRecordDto = CreateRecordDto;
__decorate([
    (0, class_validator_1.IsEnum)(RecordType),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(RecordLevel),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "level", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "eventName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "discipline", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "result", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Unit),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "wind", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateRecordDto.prototype, "altitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateRecordDto.prototype, "isIndoor", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "athleteName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "competitionName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "location", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "venue", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "date", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Transform)(({ value }) => value === 'true' || value === true),
    __metadata("design:type", Boolean)
], CreateRecordDto.prototype, "isRatified", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "ratifiedBy", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateRecordDto.prototype, "ratifiedDate", void 0);
//# sourceMappingURL=create-record.dto.js.map