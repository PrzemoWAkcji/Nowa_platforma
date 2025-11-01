import { IsString, IsNotEmpty } from 'class-validator';

export class ValidatePerformanceDto {
  @IsString()
  @IsNotEmpty()
  discipline: string;

  @IsString()
  @IsNotEmpty()
  performance: string;
}