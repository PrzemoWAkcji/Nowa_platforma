import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
    findAll(): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
        createdCompetitions: {
            name: string;
            startDate: Date;
            id: string;
            status: import(".prisma/client").$Enums.CompetitionStatus;
        }[];
        coachedAthletes: {
            id: string;
            firstName: string;
            lastName: string;
        }[];
    } | null>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        lastLogin: Date | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    }>;
}
