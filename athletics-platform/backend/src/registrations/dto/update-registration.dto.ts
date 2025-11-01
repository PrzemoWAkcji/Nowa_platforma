import { PartialType } from '@nestjs/mapped-types';
import { CreateRegistrationDto } from './create-registration.dto';
import { IsOptional, IsEnum, IsString } from 'class-validator';

export enum RegistrationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  REJECTED = 'REJECTED',
  WAITLIST = 'WAITLIST',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class UpdateRegistrationDto extends PartialType(CreateRegistrationDto) {
  @IsOptional()
  @IsEnum(RegistrationStatus)
  status?: RegistrationStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsString()
  bibNumber?: string;
}
