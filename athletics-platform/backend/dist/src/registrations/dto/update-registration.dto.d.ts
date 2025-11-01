import { CreateRegistrationDto } from './create-registration.dto';
export declare enum RegistrationStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    CANCELLED = "CANCELLED",
    REJECTED = "REJECTED",
    WAITLIST = "WAITLIST"
}
export declare enum PaymentStatus {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETED = "COMPLETED",
    FAILED = "FAILED",
    REFUNDED = "REFUNDED"
}
declare const UpdateRegistrationDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateRegistrationDto>>;
export declare class UpdateRegistrationDto extends UpdateRegistrationDto_base {
    status?: RegistrationStatus;
    paymentStatus?: PaymentStatus;
    bibNumber?: string;
}
export {};
