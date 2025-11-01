export declare enum UserRole {
    ATHLETE = "ATHLETE",
    COACH = "COACH",
    ORGANIZER = "ORGANIZER",
    ADMIN = "ADMIN",
    JUDGE = "JUDGE"
}
export declare class CreateUserDto {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    password: string;
    isActive?: boolean;
}
