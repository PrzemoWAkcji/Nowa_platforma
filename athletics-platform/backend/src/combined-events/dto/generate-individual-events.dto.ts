import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class GenerateIndividualEventsDto {
  @IsString()
  competitionId: string;

  @IsArray()
  @IsString({ each: true })
  combinedEventIds: string[]; // IDs konkurencji wielobojowych (np. "Pięciobój kobiet", "Pięciobój mężczyzn")

  @IsOptional()
  @IsBoolean()
  createRegistrations?: boolean = true; // Czy utworzyć rejestracje na poszczególne konkurencje

  @IsOptional()
  @IsBoolean()
  overwriteExisting?: boolean = false; // Czy nadpisać istniejące konkurencje o tych samych nazwach
}
