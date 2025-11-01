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
exports.CreateAthleteDto = exports.Category = exports.Gender = void 0;
const class_validator_1 = require("class-validator");
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["MIXED"] = "MIXED";
})(Gender || (exports.Gender = Gender = {}));
var Category;
(function (Category) {
    Category["U16"] = "U16";
    Category["U18"] = "U18";
    Category["U20"] = "U20";
    Category["SENIOR"] = "SENIOR";
    Category["M35"] = "M35";
    Category["M40"] = "M40";
    Category["M45"] = "M45";
    Category["M50"] = "M50";
    Category["M55"] = "M55";
    Category["M60"] = "M60";
    Category["M65"] = "M65";
    Category["M70"] = "M70";
    Category["M75"] = "M75";
    Category["M80"] = "M80";
})(Category || (exports.Category = Category = {}));
class CreateAthleteDto {
    firstName;
    lastName;
    dateOfBirth;
    gender;
    club;
    category;
    nationality;
    classification;
    isParaAthlete;
    coachId;
}
exports.CreateAthleteDto = CreateAthleteDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "dateOfBirth", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "club", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Category),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "nationality", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "classification", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateAthleteDto.prototype, "isParaAthlete", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateAthleteDto.prototype, "coachId", void 0);
//# sourceMappingURL=create-athlete.dto.js.map