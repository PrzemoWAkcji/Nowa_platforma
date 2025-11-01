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
exports.UpdateRegistrationDto = exports.PaymentStatus = exports.RegistrationStatus = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_registration_dto_1 = require("./create-registration.dto");
const class_validator_1 = require("class-validator");
var RegistrationStatus;
(function (RegistrationStatus) {
    RegistrationStatus["PENDING"] = "PENDING";
    RegistrationStatus["CONFIRMED"] = "CONFIRMED";
    RegistrationStatus["CANCELLED"] = "CANCELLED";
    RegistrationStatus["REJECTED"] = "REJECTED";
    RegistrationStatus["WAITLIST"] = "WAITLIST";
})(RegistrationStatus || (exports.RegistrationStatus = RegistrationStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "PENDING";
    PaymentStatus["PROCESSING"] = "PROCESSING";
    PaymentStatus["COMPLETED"] = "COMPLETED";
    PaymentStatus["FAILED"] = "FAILED";
    PaymentStatus["REFUNDED"] = "REFUNDED";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
class UpdateRegistrationDto extends (0, mapped_types_1.PartialType)(create_registration_dto_1.CreateRegistrationDto) {
    status;
    paymentStatus;
    bibNumber;
}
exports.UpdateRegistrationDto = UpdateRegistrationDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(RegistrationStatus),
    __metadata("design:type", String)
], UpdateRegistrationDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(PaymentStatus),
    __metadata("design:type", String)
], UpdateRegistrationDto.prototype, "paymentStatus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], UpdateRegistrationDto.prototype, "bibNumber", void 0);
//# sourceMappingURL=update-registration.dto.js.map