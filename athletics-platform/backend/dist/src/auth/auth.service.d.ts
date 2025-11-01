import { JwtService } from '@nestjs/jwt';
import { SecurityLoggerService } from '../common/logger/security-logger.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private securityLogger;
    private readonly logger;
    constructor(prisma: PrismaService, jwtService: JwtService, securityLogger: SecurityLoggerService);
    register(registerDto: RegisterDto): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: boolean;
            createdAt: Date;
        };
        token: string;
        message: string;
    }>;
    login(loginDto: LoginDto, ip?: string, userAgent?: string): Promise<{
        user: {
            id: string;
            email: string;
            firstName: string;
            lastName: string;
            phone: string | null;
            role: import(".prisma/client").$Enums.UserRole;
            isActive: true;
            createdAt: Date;
        };
        token: string;
        message: string;
    }>;
    validateUser(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    getProfile(userId: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
}
