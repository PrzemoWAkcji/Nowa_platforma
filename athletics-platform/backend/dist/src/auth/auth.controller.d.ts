import { Request as ExpressRequest, Response as ExpressResponse } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto, res: ExpressResponse): Promise<{
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
        message: string;
    }>;
    login(loginDto: LoginDto, req: ExpressRequest, res: ExpressResponse): Promise<{
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
    logout(res: ExpressResponse): {
        message: string;
    };
    getProfile(req: {
        user: {
            sub: string;
        };
    }): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    getCurrentUser(req: {
        user: {
            sub: string;
            email: string;
            role: string;
        };
    }): Promise<{
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
