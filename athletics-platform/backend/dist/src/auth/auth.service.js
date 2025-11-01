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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcryptjs");
const security_logger_service_1 = require("../common/logger/security-logger.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    securityLogger;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, securityLogger) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.securityLogger = securityLogger;
    }
    async register(registerDto) {
        const { email, password, firstName, lastName, phone, role } = registerDto;
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Użytkownik z tym adresem email już istnieje');
        }
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                role,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        return {
            user,
            token,
            message: 'Rejestracja przebiegła pomyślnie',
        };
    }
    async login(loginDto, ip, userAgent) {
        const { email, password } = loginDto;
        this.logger.debug(`Login attempt for email: ${email}`);
        const user = await this.prisma.user.findUnique({
            where: { email },
        });
        if (!user) {
            this.logger.warn(`Failed login attempt for non-existent user: ${email}`);
            this.securityLogger.logFailedLogin(email, ip || 'unknown', userAgent);
            throw new common_1.UnauthorizedException('Nieprawidłowy email lub hasło');
        }
        if (!user.isActive) {
            this.logger.warn(`Failed login attempt for inactive user: ${email}`);
            this.securityLogger.logFailedLogin(email, ip || 'unknown', userAgent);
            throw new common_1.UnauthorizedException('Konto zostało dezaktywowane');
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            this.logger.warn(`Failed login attempt - invalid password for user: ${email}`);
            this.securityLogger.logFailedLogin(email, ip || 'unknown', userAgent);
            throw new common_1.UnauthorizedException('Nieprawidłowy email lub hasło');
        }
        await this.prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
        });
        this.securityLogger.logSuccessfulLogin(user.id, user.email, ip || 'unknown', userAgent);
        this.logger.log(`Successful login for user: ${email}`);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        };
        const token = this.jwtService.sign(payload);
        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                phone: user.phone,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
            token,
            message: 'Logowanie przebiegło pomyślnie',
        };
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('Użytkownik nie został znaleziony lub jest nieaktywny');
        }
        return user;
    }
    async getProfile(userId) {
        return this.validateUser(userId);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        security_logger_service_1.SecurityLoggerService])
], AuthService);
//# sourceMappingURL=auth.service.js.map