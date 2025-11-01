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
exports.RegisterDto = void 0;
const class_validator_1 = require("class-validator");
const client_1 = require("@prisma/client");
class RegisterDto {
    email;
    password;
    firstName;
    lastName;
    phone;
    role;
}
exports.RegisterDto = RegisterDto;
__decorate([
    (0, class_validator_1.IsEmail)({}, { message: 'Podaj prawidłowy adres email' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Email jest wymagany' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "email", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Hasło musi być tekstem' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Hasło jest wymagane' }),
    (0, class_validator_1.MinLength)(8, { message: 'Hasło musi mieć co najmniej 8 znaków' }),
    (0, class_validator_1.Matches)(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
        message: 'Hasło musi zawierać co najmniej jedną małą literę, jedną wielką literę, jedną cyfrę i jeden znak specjalny',
    }),
    __metadata("design:type", String)
], RegisterDto.prototype, "password", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Imię musi być tekstem' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Imię jest wymagane' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "firstName", void 0);
__decorate([
    (0, class_validator_1.IsString)({ message: 'Nazwisko musi być tekstem' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Nazwisko jest wymagane' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "lastName", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Telefon musi być tekstem' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(client_1.UserRole, { message: 'Rola musi być jedną z: ATHLETE, COACH, ADMIN' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Rola jest wymagana' }),
    __metadata("design:type", String)
], RegisterDto.prototype, "role", void 0);
//# sourceMappingURL=register.dto.js.map