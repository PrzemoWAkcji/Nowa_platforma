import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import type {
  AdvancedAutoAssignHeatsForm,
  Athlete,
  AthleteQueryParams,
  AthleteStats,
  AutoAssignHeatsForm,
  Competition,
  CompetitionLogo,
  CreateAthleteForm,
  CreateCompetitionForm,
  CreateEventForm,
  CreateHeatForm,
  CreateRegistrationForm,
  CreateResultForm,
  Event,
  EventQueryParams,
  EventStatistics,
  Heat,
  HeatQueryParams,
  RegisterData,
  Registration,
  RegistrationQueryParams,
  RegistrationStatistics,
  Result,
  ResultQueryParams,
  UpdateHeatForm,
  User,
} from "../types";

// Konfiguracja axios z obsługą cookies
const getBaseURL = () => {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
};

const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true,
  timeout: 60000,
});

// Request interceptor - dodaj Authorization header w developmencie
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // W developmencie używaj Authorization header zamiast cookies
    if (process.env.NODE_ENV !== "production") {
      const token = localStorage.getItem("auth-token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data on unauthorized
      if (typeof window !== "undefined") {
        localStorage.removeItem("auth-token");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export { api };

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ token: string; user: User }>("/auth/login", { email, password }),
  register: (data: RegisterData) =>
    api.post<{ token: string; user: User }>("/auth/register", data),
  getProfile: () => api.get<User>("/auth/me"),
};

// Competitions API
export const competitionsApi = {
  getAll: () => api.get<Competition[]>("/competitions"),
  getPublic: () => api.get<Competition[]>("/competitions/public"),
  getById: (id: string) => api.get<Competition>(`/competitions/${id}`),
  create: (data: CreateCompetitionForm) =>
    api.post<Competition>("/competitions", data),
  update: (id: string, data: Partial<CreateCompetitionForm>) =>
    api.patch<Competition>(`/competitions/${id}`, data),
  delete: (id: string) => api.delete(`/competitions/${id}`),
  uploadLogos: (id: string, files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("logos", file));
    return api.post(`/competitions/${id}/logos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  deleteLogo: (id: string, logoId: string) =>
    api.delete(`/competitions/${id}/logos/${logoId}`),
  getLogos: (id: string) =>
    api.get<CompetitionLogo[]>(`/competitions/${id}/logos`),
  toggleLogoVisibility: (id: string, logoId: string, isVisible: boolean) =>
    api.patch(`/competitions/${id}/logos/${logoId}/visibility`, { isVisible }),
  importStartlist: (id: string, formData: FormData) =>
    api.post(`/competitions/${id}/import-startlist`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minuty dla importu startlist
    }),
};

// Athletes API
export const athletesApi = {
  getAll: (params?: AthleteQueryParams) =>
    api.get<Athlete[]>("/athletes", { params }),
  getById: (id: string) => api.get<Athlete>(`/athletes/${id}`),
  getStats: (id: string) => api.get<AthleteStats>(`/athletes/${id}/stats`),
  create: (data: CreateAthleteForm) => api.post<Athlete>("/athletes", data),
  update: (id: string, data: Partial<CreateAthleteForm>) =>
    api.patch<Athlete>(`/athletes/${id}`, data),
  delete: (id: string) => api.delete(`/athletes/${id}`),
  importCsv: (
    file: File,
    format: "pzla" | "international",
    updateExisting: boolean = false
  ) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("format", format);
    formData.append("updateExisting", updateExisting.toString());

    return api.post("/athletes/import-csv", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minuty dla importu CSV zawodników
    });
  },
};

// Events API
export const eventsApi = {
  getAll: (params?: EventQueryParams) =>
    api.get<Event[]>("/events", { params }),
  getById: (id: string) => api.get<Event>(`/events/${id}`),
  getStatistics: (id: string) =>
    api.get<EventStatistics>(`/events/${id}/statistics`),
  create: (data: CreateEventForm) => api.post<Event>("/events", data),
  update: (id: string, data: Partial<CreateEventForm>) =>
    api.patch<Event>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
};

// Registrations API
export const registrationsApi = {
  getAll: (params?: RegistrationQueryParams) =>
    api.get<Registration[]>("/registrations", { params }),
  getAllPublic: (params?: RegistrationQueryParams) =>
    api.get<Registration[]>("/registrations/public", { params }),
  getById: (id: string) => api.get<Registration>(`/registrations/${id}`),
  getMy: () => api.get<Registration[]>("/registrations/my-registrations"),
  getStatistics: (params?: RegistrationQueryParams) =>
    api.get<RegistrationStatistics>("/registrations/statistics", { params }),
  getStartListSortedByRecords: (
    competitionId: string,
    eventId: string,
    sortBy?: "PB" | "SB" | "SEED_TIME"
  ) =>
    api.get<Registration[]>(
      `/registrations/start-list/${competitionId}/${eventId}`,
      { params: { sortBy } }
    ),
  getAllStartListsForCompetition: (
    competitionId: string,
    sortBy?: "PB" | "SB" | "SEED_TIME"
  ) =>
    api.get<
      Array<{
        eventId: string;
        eventName: string;
        eventType: string;
        eventCategory: string;
        registrations: Registration[];
      }>
    >(`/registrations/start-lists/${competitionId}`, { params: { sortBy } }),
  create: (data: CreateRegistrationForm) =>
    api.post<Registration>("/registrations", data),
  update: (id: string, data: Partial<CreateRegistrationForm>) =>
    api.patch<Registration>(`/registrations/${id}`, data),
  confirm: (id: string) => api.patch(`/registrations/${id}/confirm`),
  cancel: (id: string) => api.patch(`/registrations/${id}/cancel`),
  reject: (id: string) => api.patch(`/registrations/${id}/reject`),
  assignBibNumbers: (competitionId: string, startingNumber?: number) =>
    api.post(`/registrations/assign-bib-numbers/${competitionId}`, {
      startingNumber,
    }),
  delete: (id: string) => api.delete(`/registrations/${id}`),
  deleteAllByCompetition: (competitionId: string) =>
    api.delete(`/registrations/competition/${competitionId}/all`),
  updateRecordsFromCsv: (competitionId: string, csvData: string) =>
    api.post(`/registrations/update-records-from-csv/${competitionId}`, {
      csvData,
    }),
};

// Results API
export const resultsApi = {
  getAll: (params?: ResultQueryParams) =>
    api.get<Result[]>("/results", { params }),
  getById: (id: string) => api.get<Result>(`/results/${id}`),
  getEventResults: (eventId: string) =>
    api.get<Result[]>(`/results/events/${eventId}/results`),
  getAthleteResults: (athleteId: string, eventName: string) =>
    api.get<Result[]>(`/results/athletes/${athleteId}/events/${eventName}`),
  create: (data: CreateResultForm) => api.post<Result>("/results", data),
  update: (id: string, data: Partial<CreateResultForm>) =>
    api.patch<Result>(`/results/${id}`, data),
  calculatePositions: (eventId: string) =>
    api.patch(`/results/events/${eventId}/calculate-positions`),
  delete: (id: string) => api.delete(`/results/${id}`),
};

// Heats API
export const heatsApi = {
  getAll: (params?: HeatQueryParams) =>
    api.get<Heat[]>("/organization/heats", { params }),
  getById: (id: string) => api.get<Heat>(`/organization/heats/${id}`),
  getEventHeats: (eventId: string) =>
    api.get<Heat[]>(`/organization/heats/event/${eventId}`),
  create: (data: CreateHeatForm) => api.post<Heat>("/organization/heats", data),
  update: (id: string, data: UpdateHeatForm) =>
    api.patch<Heat>(`/organization/heats/${id}`, data),
  delete: (id: string) => api.delete(`/organization/heats/${id}`),
  autoAssign: (data: AutoAssignHeatsForm) =>
    api.post("/organization/heats/auto-assign", data),
  advancedAutoAssign: (data: AdvancedAutoAssignHeatsForm) =>
    api.post("/organization/heats/advanced-auto-assign", data),
};
