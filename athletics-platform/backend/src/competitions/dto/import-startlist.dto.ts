import { IsString, IsOptional, IsEnum } from 'class-validator';

export enum StartListFormat {
  PZLA = 'PZLA',
  ROSTER = 'ROSTER',
  AUTO = 'AUTO',
}

export class ImportStartListDto {
  @IsString()
  competitionId: string;

  @IsString()
  csvData: string;

  @IsOptional()
  @IsEnum(StartListFormat)
  format?: StartListFormat = StartListFormat.AUTO;
}

// Interfejsy dla różnych formatów CSV
export interface PZLAStartListRow {
  Impreza: string;
  NrKonkur: string;
  NazwaPZLA: string;
  'Pełna nazwa': string;
  Runda: string;
  Seria: string;
  Tor: string;
  Miejsce: string;
  NrStart: string;
  Nazwisko: string;
  Imię: string;
  DataUr: string;
  Klub: string;
  Woj: string;
  'NrLicencji Klub': string;
  'AktLic Klub': string;
  Wynik: string;
  Wiatr: string;
  PK: string;
  SB: string;
  PB: string;
  Uczelnia: string;
  'Licencja OZLA': string;
  'Licencja OZLA ważność': string;
  'Licencja PZLA': string;
  'Licencja ważność': string;
  NrZawodnika: string;
  'Weryf..': string;
  'Weryfikacja elektr.': string;
  TOKEN: string;
  skład: string;
  Sztafeta: string;
  OOM: string;
  'Kadra 2025': string;
  'LDK!': string;
  DataAktualizacji: string;
  Trener: string;
}

export interface RosterStartListRow {
  MeetingId: string;
  EntryId: string;
  StartListId: string;
  Title: string;
  RelayTeamName: string;
  FullName: string;
  FirstName: string;
  MiddleName: string;
  LastName: string;
  Gender: string;
  ParaClassRunJump: string;
  ParaClassThrow: string;
  NotesPublic: string;
  NotesInternal: string;
  CountryCode: string;
  DateOfBirth: string;
  YearOfBirth: string;
  SchoolGrade: string;
  TilastopajaId: string;
  RelayId: string;
  EventStart: string;
  EventCode: string;
  PZLAEventCode: string;
  PZLAEventCodeNum: string;
  UKAEventCode: string;
  EventStage: string;
  AgeGroup: string;
  MultipleAgeGroups: string;
  OldestAgeGroup: string;
  CombinedEventRelation: string;
  ShortClubName: string;
  ClubName: string;
  TeamName: string;
  TeamGender: string;
  BibNumber: string;
  Lane: string;
  EventGroup: string;
  PersonalBest: string;
  SeasonBest: string;
  SeedingResult: string;
}

export interface ParsedStartListEntry {
  // Dane zawodnika
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'MALE' | 'FEMALE';
  club?: string;
  licenseNumber?: string;
  nationality?: string;

  // Dane konkurencji
  eventName: string;
  eventCode?: string;
  category?: string;

  // Dane startowe
  bibNumber?: string;
  lane?: string;
  heat?: string;
  seedTime?: string;
  personalBest?: string;
  seasonBest?: string;

  // Dane sztafety
  relayTeam?: string; // Nazwa sztafety (np. "K4x100")
  relayPosition?: number; // Pozycja w sztafecie (1-6)
  isRelay?: boolean; // Czy to jest sztafeta

  // Dodatkowe dane
  coach?: string;
  notes?: string;
}

export interface ImportStartListResult {
  success: boolean;
  message: string;
  importedCount: number;
  errors: string[];
  warnings: string[];
  detectedFormat: StartListFormat;
  entries: ParsedStartListEntry[];
}
