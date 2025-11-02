// User & Auth types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export enum UserRole {
  ATHLETE = "ATHLETE",
  COACH = "COACH",
  ORGANIZER = "ORGANIZER",
  ADMIN = "ADMIN",
  JUDGE = "JUDGE",
}

// Athlete types
export interface Athlete {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  club?: string;
  category: Category;
  nationality?: string;
  classification?: string;
  licenseNumber?: string;
  isParaAthlete: boolean;
  coachId?: string;
  createdAt: string;
  updatedAt: string;
  registrations?: Registration[];
  results?: Result[];
  coach?: User;
  _count?: {
    registrations: number;
    results: number;
  };
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  MIXED = "MIXED",
}

export enum Category {
  // Specjalne kategorie
  WIELE = "WIELE",

  // Kategorie dziecięce (0-22 lat)
  AGE_0_11 = "AGE_0_11",
  AGE_5 = "AGE_5",
  AGE_6 = "AGE_6",
  AGE_7 = "AGE_7",
  AGE_8 = "AGE_8",
  AGE_9 = "AGE_9",
  AGE_10 = "AGE_10",
  AGE_11 = "AGE_11",
  AGE_12 = "AGE_12",
  AGE_13 = "AGE_13",
  AGE_14 = "AGE_14",
  AGE_15 = "AGE_15",
  AGE_16 = "AGE_16",
  AGE_17 = "AGE_17",
  AGE_18 = "AGE_18",
  AGE_19 = "AGE_19",
  AGE_20 = "AGE_20",
  AGE_21 = "AGE_21",
  AGE_22 = "AGE_22",

  // Kategorie szkolne (klasy)
  CLASS_1_SZKOLA_SREDNIA = "CLASS_1_SZKOLA_SREDNIA",
  CLASS_2_SZKOLA_SREDNIA = "CLASS_2_SZKOLA_SREDNIA",
  CLASS_3_SZKOLA_SREDNIA = "CLASS_3_SZKOLA_SREDNIA",
  CLASS_4_SZKOLA_SREDNIA = "CLASS_4_SZKOLA_SREDNIA",
  CLASS_5_SZKOLA_SREDNIA = "CLASS_5_SZKOLA_SREDNIA",
  CLASS_6_SZKOLA_SREDNIA = "CLASS_6_SZKOLA_SREDNIA",
  CLASS_7 = "CLASS_7",
  CLASS_8 = "CLASS_8",

  // Kategorie młodzieżowe
  U8 = "U8",
  U9 = "U9",
  U10 = "U10",
  U11 = "U11",
  U12 = "U12",
  U13 = "U13",
  U14 = "U14",
  U15 = "U15",
  U16 = "U16",
  U18 = "U18",
  U20 = "U20",
  U23 = "U23",

  // Kategorie seniorskie
  SENIOR = "SENIOR",

  // Kategorie Masters
  M35 = "M35",
  M40 = "M40",
  M45 = "M45",
  M50 = "M50",
  M55 = "M55",
  M60 = "M60",
  M65 = "M65",
  M70 = "M70",
  M75 = "M75",
  M80 = "M80",
  M85 = "M85",
  M90 = "M90",
  M95 = "M95",
  M100 = "M100",
  M105 = "M105",
  M110 = "M110",
}

// Logo interface
export interface CompetitionLogo {
  id: string;
  filename: string;
  originalName: string;
  url: string;
  uploadedAt: string;
  size: number;
  mimetype: string;
  isVisible?: boolean; // Czy logo ma być wyświetlane
}

// Competition types
export interface Competition {
  id: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  type: CompetitionType;
  status: CompetitionStatus;
  registrationStartDate?: string;
  registrationEndDate?: string;
  maxParticipants?: number;
  registrationFee?: number;
  isPublic: boolean;
  allowLateRegistration: boolean;
  // Agent Integration
  agentId?: string;
  liveResultsEnabled: boolean;
  liveResultsToken?: string;
  logos?: CompetitionLogo[];
  createdAt: string;
  updatedAt: string;
  createdById: string;
  createdBy?: User;
  events?: Event[];
  registrations?: Registration[];
  _count?: {
    registrations: number;
  };
}

export enum CompetitionType {
  OUTDOOR = "OUTDOOR",
  INDOOR = "INDOOR",
  ROAD = "ROAD",
  CROSS_COUNTRY = "CROSS_COUNTRY",
  TRAIL = "TRAIL",
  DUATHLON = "DUATHLON",
  TRIATHLON = "TRIATHLON",
  MULTI_EVENT = "MULTI_EVENT",
}

export enum CompetitionStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  REGISTRATION_OPEN = "REGISTRATION_OPEN",
  REGISTRATION_CLOSED = "REGISTRATION_CLOSED",
  ONGOING = "ONGOING",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Event types
export interface Event {
  id: string;
  name: string;
  type: EventType;
  gender: Gender;
  category: Category;
  unit: Unit;
  maxParticipants?: number;
  seedTimeRequired: boolean;
  scheduledTime?: string;
  isCompleted?: boolean;
  distance?: string;
  discipline?: string;
  hurdleHeight?: string;
  implementWeight?: string;
  implementSpecs?: { [key: string]: unknown };
  competitionId: string;
  createdAt: string;
  updatedAt: string;
  competition?: Competition;
  results?: Result[];
  registrationEvents?: RegistrationEvent[];
  scheduleItems?: ScheduleItem[];
  _count?: {
    registrationEvents: number;
    results: number;
    relayTeamRegistrations?: number;
  };
}

export enum EventType {
  TRACK = "TRACK",
  FIELD = "FIELD",
  ROAD = "ROAD",
  COMBINED = "COMBINED",
  RELAY = "RELAY",
}

export enum Unit {
  TIME = "TIME",
  DISTANCE = "DISTANCE",
  HEIGHT = "HEIGHT",
  POINTS = "POINTS",
}

// Schedule types
export interface CompetitionSchedule {
  id: string;
  name: string;
  description?: string;
  competitionId: string;
  status: ScheduleStatus;
  createdAt: string;
  updatedAt: string;
  items?: ScheduleItem[];
}

export interface ScheduleItem {
  id: string;
  scheduleId: string;
  eventId: string;
  scheduledTime: string;
  actualTime?: string;
  duration?: number;
  round: EventRound;
  roundName?: string;
  seriesCount: number;
  finalistsCount?: number;
  status: ScheduleStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  schedule?: CompetitionSchedule;
  event?: Event;
}

export enum EventRound {
  QUALIFICATION = "QUALIFICATION",
  SEMIFINAL = "SEMIFINAL",
  FINAL = "FINAL",
}

export enum ScheduleStatus {
  DRAFT = "DRAFT",
  PUBLISHED = "PUBLISHED",
  SCHEDULED = "SCHEDULED",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

// Registration types
export interface Registration {
  id: string;
  athleteId: string;
  competitionId: string;
  userId: string;
  status: RegistrationStatus;
  paymentStatus: PaymentStatus;
  paymentAmount?: number;
  paymentDate?: string;
  seedTime?: string;
  notes?: string;
  bibNumber?: string;
  createdAt: string;
  updatedAt: string;
  athlete?: Athlete;
  competition?: Competition;
  user?: User;
  results?: Result[];
  events?: RegistrationEvent[];
  records?: {
    personalBest?: {
      result: string;
      date: string;
      competition: string;
    };
    seasonBest?: {
      result: string;
      date: string;
      competition: string;
    };
    seedTime?: string;
  };
}

export interface RegistrationEvent {
  id: string;
  registrationId: string;
  eventId: string;
  seedTime?: string;
  registration?: Registration;
  event?: Event;
}

export enum RegistrationStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  REJECTED = "REJECTED",
  WAITLIST = "WAITLIST",
}

export enum PaymentStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export enum DopingControlStatus {
  NOT_SELECTED = "NOT_SELECTED",
  SELECTED = "SELECTED",
  NOTIFIED = "NOTIFIED",
  COMPLETED = "COMPLETED",
  REFUSED = "REFUSED",
  MISSED = "MISSED",
}

export enum ProtestStatus {
  SUBMITTED = "SUBMITTED",
  UNDER_REVIEW = "UNDER_REVIEW",
  ACCEPTED = "ACCEPTED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export enum RecordType {
  WORLD = "WORLD",
  CONTINENTAL = "CONTINENTAL",
  NATIONAL = "NATIONAL",
  REGIONAL = "REGIONAL",
  CLUB = "CLUB",
  FACILITY = "FACILITY",
}

export enum RecordLevel {
  SENIOR = "SENIOR",
  JUNIOR = "JUNIOR",
  YOUTH = "YOUTH",
  CADETS = "CADETS",
  MASTERS = "MASTERS",
  PARA = "PARA",
}

// Result types
export interface Result {
  id: string;
  athleteId: string;
  eventId: string;
  registrationId: string;
  result: string;
  position?: number;
  points?: number;
  wind?: string;
  reaction?: string;
  splits?: { [key: string]: unknown };
  notes?: string;
  isValid: boolean;
  isDNF: boolean;
  isDNS: boolean;
  isDQ: boolean;
  isPersonalBest: boolean;
  isSeasonBest: boolean;
  isNationalRecord: boolean;
  isWorldRecord: boolean;
  selectedForDopingControl: boolean;
  dopingControlStatus: DopingControlStatus;
  createdAt: string;
  updatedAt: string;
  athlete?: Athlete;
  event?: Event;
  registration?: Registration;
  protests?: Protest[];
}

export interface Protest {
  id: string;
  competitionId: string;
  eventId?: string;
  resultId?: string;
  athleteId?: string;
  submittedBy: string;
  reason: string;
  description: string;
  evidence?: string;
  status: ProtestStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  decision?: string;
  feeAmount?: number;
  feePaid: boolean;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  competition?: Competition;
  event?: Event;
  result?: Result;
  athlete?: Athlete;
  submitter?: User;
  reviewer?: User;
}

export interface Record {
  id: string;
  type: RecordType;
  level: RecordLevel;
  eventName: string;
  discipline: string;
  gender: Gender;
  category: Category;
  result: string;
  resultValue: number;
  unit: Unit;
  wind?: string;
  altitude?: number;
  isIndoor: boolean;
  athleteName: string;
  nationality: string;
  dateOfBirth?: string;
  competitionName: string;
  location: string;
  venue?: string;
  date: string;
  isRatified: boolean;
  ratifiedBy?: string;
  ratifiedDate?: string;
  isActive: boolean;
  supersededBy?: string;
  supersededDate?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  creator?: User;
  supersededByRecord?: Record;
  supersededRecords?: Record[];
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface CreateCompetitionForm {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  location: string;
  venue?: string;
  type: CompetitionType;
  registrationStartDate?: string;
  registrationEndDate?: string;
  maxParticipants?: number;
  registrationFee?: number;
  isPublic?: boolean;
  allowLateRegistration?: boolean;
}

export interface CreateAthleteForm {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  club?: string;
  category: Category;
  nationality?: string;
  classification?: string;
  isParaAthlete?: boolean;
}

export interface CreateEventForm {
  name: string;
  type: EventType;
  gender: Gender;
  category: Category;
  unit: Unit;
  competitionId: string;
  maxParticipants?: number;
  seedTimeRequired?: boolean;
  scheduledTime?: string;
}

export interface CreateRegistrationForm {
  athleteId: string;
  competitionId: string;
  eventIds: string[];
  seedTime?: string;
  notes?: string;
  paymentAmount?: number;
  bibNumber?: string;
}

export interface CreateResultForm {
  athleteId: string;
  eventId: string;
  registrationId: string;
  result: string;
  position?: number;
  points?: number;
  wind?: string;
  reaction?: string;
  splits?: { [key: string]: unknown };
  isValid?: boolean;
  isDNF?: boolean;
  isDNS?: boolean;
  isDQ?: boolean;
  isPersonalBest?: boolean;
  isSeasonBest?: boolean;
  isNationalRecord?: boolean;
  isWorldRecord?: boolean;
}

export interface CreateRecordForm {
  type: RecordType;
  level: RecordLevel;
  eventName: string;
  discipline: string;
  gender: Gender;
  category: Category;
  result: string;
  unit: Unit;
  wind?: string;
  altitude?: number;
  isIndoor?: boolean;
  athleteName: string;
  nationality: string;
  dateOfBirth?: string;
  competitionName: string;
  location: string;
  venue?: string;
  date: string;
  isRatified?: boolean;
  ratifiedBy?: string;
  ratifiedDate?: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Statistics types
export interface AthleteStats {
  athlete: Athlete;
  stats: {
    totalCompetitions: number;
    totalResults: number;
    personalBests: number;
    seasonBests: number;
    nationalRecords: number;
    worldRecords: number;
  };
  recentResults: Result[];
}

export interface EventStatistics {
  event: Event;
  statistics: {
    totalRegistrations: number;
    totalResults: number;
    completionRate: number;
    genderDistribution: { [key: string]: number };
    categoryDistribution: { [key: string]: number };
    maxParticipants?: number;
    spotsRemaining?: number;
  };
}

export interface RegistrationStatistics {
  totalRegistrations: number;
  statusDistribution: { [key: string]: number };
  paymentDistribution: { [key: string]: number };
}

// Combined Events types
export interface CombinedEvent {
  id: string;
  eventType: CombinedEventType;
  athleteId: string;
  competitionId: string;
  gender: Gender;
  totalPoints: number;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  athlete?: Athlete;
  competition?: Competition;
  results: CombinedEventResult[];
}

export interface CombinedEventResult {
  id: string;
  combinedEventId: string;
  discipline: string;
  dayOrder: number;
  performance: string | null;
  points: number;
  wind?: string;
  isValid: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum CombinedEventType {
  DECATHLON = "DECATHLON",
  HEPTATHLON = "HEPTATHLON",
  PENTATHLON = "PENTATHLON",
  PENTATHLON_U16_MALE = "PENTATHLON_U16_MALE",
  PENTATHLON_U16_FEMALE = "PENTATHLON_U16_FEMALE",
}

export interface CreateCombinedEventForm {
  eventType: CombinedEventType;
  athleteId: string;
  competitionId: string;
  gender: Gender;
}

export interface UpdateCombinedEventResultForm {
  performance: string;
  wind?: string;
}

export interface CombinedEventStatistics {
  totalEvents: number;
  completedEvents: number;
  averagePoints: number;
  bestPerformance: CombinedEvent | null;
  eventTypeBreakdown: { [key: string]: number };
}

export interface CombinedEventRanking extends CombinedEvent {
  position: number;
}

// Records Statistics types
export interface RecordStatistics {
  totalRecords: number;
  worldRecords: number;
  nationalRecords: number;
  recordsByType: { [key: string]: number };
  recordsByGender: { [key: string]: number };
  recentRecords: Array<{
    id: string;
    eventName: string;
    result: string;
    athleteName: string;
    nationality: string;
    date: string;
    type: RecordType;
  }>;
}

export interface RecordCheckResult {
  world: boolean;
  national: boolean;
  regional: boolean;
}

// Relay Team types
export interface RelayTeam {
  id: string;
  name: string;
  club?: string;
  competitionId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  competition?: Competition;
  createdBy?: User;
  members?: RelayTeamMember[];
  registrations?: RelayTeamRegistration[];
  results?: RelayTeamResult[];
  _count?: {
    members: number;
    registrations: number;
    results: number;
  };
}

export interface RelayTeamMember {
  id: string;
  teamId: string;
  athleteId: string;
  position: number; // 1-4 for main runners, 5-6 for reserves
  isReserve: boolean;
  createdAt: string;
  updatedAt: string;
  team?: RelayTeam;
  athlete: Athlete;
}

export interface RelayTeamRegistration {
  id: string;
  teamId: string;
  eventId: string;
  seedTime?: string;
  createdAt: string;
  updatedAt: string;
  team?: RelayTeam;
  event: Event;
}

export interface RelayTeamResult {
  id: string;
  teamId: string;
  eventId: string;
  result: string;
  position?: number;
  points?: number;
  wind?: string;
  reaction?: string;
  splits?: { [key: string]: unknown }; // JSON with individual split times
  notes?: string;
  isValid: boolean;
  isDNF: boolean;
  isDNS: boolean;
  isDQ: boolean;
  isNationalRecord: boolean;
  isWorldRecord: boolean;
  selectedForDopingControl: boolean;
  dopingControlStatus: DopingControlStatus;
  createdAt: string;
  updatedAt: string;
  team: RelayTeam;
  event: Event;
  protests?: Protest[];
}

// Form types for relay teams
export interface CreateRelayTeamForm {
  name: string;
  club?: string;
  competitionId: string;
}

export interface AddRelayTeamMemberForm {
  athleteId: string;
  position: number;
  isReserve?: boolean;
}

export interface CreateRelayTeamRegistrationForm {
  teamId: string;
  eventId: string;
  seedTime?: string;
}

export interface CreateRelayTeamResultForm {
  teamId: string;
  eventId: string;
  result: string;
  position?: number;
  points?: number;
  wind?: string;
  reaction?: string;
  splits?: { [key: string]: unknown };
  isValid?: boolean;
  isDNF?: boolean;
  isDNS?: boolean;
  isDQ?: boolean;
  isNationalRecord?: boolean;
  isWorldRecord?: boolean;
}

// Additional types for API
export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export interface AthleteQueryParams {
  search?: string;
  category?: Category;
  gender?: Gender;
  club?: string;
  limit?: number;
  offset?: number;
}

export interface EventQueryParams {
  competitionId?: string;
  category?: Category;
  gender?: Gender;
  discipline?: string;
  limit?: number;
  offset?: number;
}

export interface EventStatistics {
  totalEvents: number;
  completedEvents: number;
  pendingEvents: number;
  participantsCount: number;
}

export interface RegistrationQueryParams {
  competitionId?: string;
  athleteId?: string;
  eventId?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export interface RegistrationStatistics {
  totalRegistrations: number;
  confirmedRegistrations: number;
  pendingRegistrations: number;
  cancelledRegistrations: number;
}

export interface ResultQueryParams {
  eventId?: string;
  athleteId?: string;
  competitionId?: string;
  limit?: number;
  offset?: number;
}

export interface HeatQueryParams {
  eventId?: string;
  competitionId?: string;
  limit?: number;
  offset?: number;
}

export interface Heat {
  id: string;
  eventId: string;
  heatNumber: number;
  round?: string;
  maxLanes?: number;
  scheduledTime?: string;
  isCompleted?: boolean;
  notes?: string;
  lanes: HeatLane[];
  assignments?: any[];
  event?: Event;
  createdAt: string;
  updatedAt: string;
}

export interface HeatLane {
  id: string;
  heatId: string;
  laneNumber: number;
  athleteId?: string;
  registrationId?: string;
  athlete?: Partial<Athlete>;
  registration?: Partial<Registration>;
  seedTime?: string;
}

export interface CreateHeatForm {
  eventId: string;
  heatNumber: number;
  scheduledTime?: string;
  lanes?: {
    laneNumber: number;
    athleteId?: string;
    registrationId?: string;
    seedTime?: string;
  }[];
}

export interface UpdateHeatForm {
  heatNumber?: number;
  scheduledTime?: string;
  lanes?: {
    laneNumber: number;
    athleteId?: string;
    registrationId?: string;
    seedTime?: string;
  }[];
}

export interface AutoAssignHeatsForm {
  eventId: string;
  numberOfHeats: number;
  lanesPerHeat: number;
  seedingMethod: "TIME" | "RANDOM" | "SERPENTINE";
}

export interface AdvancedAutoAssignHeatsForm {
  eventId: string;
  numberOfHeats: number;
  lanesPerHeat: number;
  seedingMethod: "TIME" | "RANDOM" | "SERPENTINE";
  reserveLanes?: number[];
  groupByCategory?: boolean;
  groupByGender?: boolean;
}
