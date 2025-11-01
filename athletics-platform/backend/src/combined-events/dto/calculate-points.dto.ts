import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

export class CalculatePointsDto {
  @IsString()
  @IsNotEmpty()
  discipline: string;

  @IsString()
  @IsNotEmpty()
  performance: string;

  @IsOptional()
  @IsEnum(['MALE', 'FEMALE'])
  gender?: 'MALE' | 'FEMALE';
}