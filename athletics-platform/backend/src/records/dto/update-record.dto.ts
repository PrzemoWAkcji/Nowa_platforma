import { PartialType } from '@nestjs/mapped-types';
import { CreateRecordDto } from './create-record.dto';
import { IsOptional, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateRecordDto extends PartialType(CreateRecordDto) {
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;
}