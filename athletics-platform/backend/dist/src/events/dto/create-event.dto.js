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
exports.CreateEventDto = exports.Unit = exports.Category = exports.Gender = exports.EventType = void 0;
const class_validator_1 = require("class-validator");
var EventType;
(function (EventType) {
    EventType["TRACK"] = "TRACK";
    EventType["FIELD"] = "FIELD";
    EventType["ROAD"] = "ROAD";
    EventType["COMBINED"] = "COMBINED";
    EventType["RELAY"] = "RELAY";
})(EventType || (exports.EventType = EventType = {}));
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["MIXED"] = "MIXED";
})(Gender || (exports.Gender = Gender = {}));
var Category;
(function (Category) {
    Category["WIELE"] = "WIELE";
    Category["AGE_0_11"] = "AGE_0_11";
    Category["AGE_5"] = "AGE_5";
    Category["AGE_6"] = "AGE_6";
    Category["AGE_7"] = "AGE_7";
    Category["AGE_8"] = "AGE_8";
    Category["AGE_9"] = "AGE_9";
    Category["AGE_10"] = "AGE_10";
    Category["AGE_11"] = "AGE_11";
    Category["AGE_12"] = "AGE_12";
    Category["AGE_13"] = "AGE_13";
    Category["AGE_14"] = "AGE_14";
    Category["AGE_15"] = "AGE_15";
    Category["AGE_16"] = "AGE_16";
    Category["AGE_17"] = "AGE_17";
    Category["AGE_18"] = "AGE_18";
    Category["AGE_19"] = "AGE_19";
    Category["AGE_20"] = "AGE_20";
    Category["AGE_21"] = "AGE_21";
    Category["AGE_22"] = "AGE_22";
    Category["CLASS_1_SZKOLA_SREDNIA"] = "CLASS_1_SZKOLA_SREDNIA";
    Category["CLASS_2_SZKOLA_SREDNIA"] = "CLASS_2_SZKOLA_SREDNIA";
    Category["CLASS_3_SZKOLA_SREDNIA"] = "CLASS_3_SZKOLA_SREDNIA";
    Category["CLASS_4_SZKOLA_SREDNIA"] = "CLASS_4_SZKOLA_SREDNIA";
    Category["CLASS_5_SZKOLA_SREDNIA"] = "CLASS_5_SZKOLA_SREDNIA";
    Category["CLASS_6_SZKOLA_SREDNIA"] = "CLASS_6_SZKOLA_SREDNIA";
    Category["CLASS_7"] = "CLASS_7";
    Category["CLASS_8"] = "CLASS_8";
    Category["U8"] = "U8";
    Category["U9"] = "U9";
    Category["U10"] = "U10";
    Category["U11"] = "U11";
    Category["U12"] = "U12";
    Category["U13"] = "U13";
    Category["U14"] = "U14";
    Category["U15"] = "U15";
    Category["U16"] = "U16";
    Category["U18"] = "U18";
    Category["U20"] = "U20";
    Category["U23"] = "U23";
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
    Category["M85"] = "M85";
    Category["M90"] = "M90";
    Category["M95"] = "M95";
    Category["M100"] = "M100";
    Category["M105"] = "M105";
    Category["M110"] = "M110";
})(Category || (exports.Category = Category = {}));
var Unit;
(function (Unit) {
    Unit["TIME"] = "TIME";
    Unit["DISTANCE"] = "DISTANCE";
    Unit["HEIGHT"] = "HEIGHT";
    Unit["POINTS"] = "POINTS";
})(Unit || (exports.Unit = Unit = {}));
class CreateEventDto {
    name;
    type;
    gender;
    category;
    unit;
    competitionId;
    maxParticipants;
    seedTimeRequired;
    discipline;
    distance;
    scheduledTime;
}
exports.CreateEventDto = CreateEventDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(EventType),
    __metadata("design:type", String)
], CreateEventDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Gender),
    __metadata("design:type", String)
], CreateEventDto.prototype, "gender", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Category),
    __metadata("design:type", String)
], CreateEventDto.prototype, "category", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(Unit),
    __metadata("design:type", String)
], CreateEventDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "competitionId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateEventDto.prototype, "maxParticipants", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateEventDto.prototype, "seedTimeRequired", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "discipline", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateEventDto.prototype, "distance", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Matches)(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d{3})?Z?$/, {
        message: 'scheduledTime must be in ISO-8601 format (e.g., "2025-07-12T09:02" or "2025-07-12T09:02:00")',
    }),
    __metadata("design:type", String)
], CreateEventDto.prototype, "scheduledTime", void 0);
//# sourceMappingURL=create-event.dto.js.map