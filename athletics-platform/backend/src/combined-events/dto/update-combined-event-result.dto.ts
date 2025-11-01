import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

export class UpdateCombinedEventResultDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\d+\.?\d*|\d{1,2}:\d{1,2}\.?\d*)$/, {
    message:
      'Performance must be in format: "10.50" for time/distance or "1:15.30" for longer times',
  })
  performance: string;

  @IsOptional()
  @IsString()
  @Matches(/^[+-]?\d+\.?\d*$/, {
    message: 'Wind must be a number (e.g., "+1.5", "-0.8")',
  })
  wind?: string;
}
