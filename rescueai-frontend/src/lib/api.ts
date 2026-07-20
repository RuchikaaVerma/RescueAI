import axios from 'axios';
import type {
  IncidentReportRequest, IncidentResponse, AgentPipelineResponse, AgentAction,
  Hospital, Volunteer, ResourceItem, LoginRequest, RegisterRequest, AuthResponse,
} from '../types';

// Points at the Spring Boot backend from RescueAI-OS-Backend.zip.
// Override with VITE_API_BASE_URL at build time for a real deployment.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 8000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rescueai_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ---- Auth ----
export const AuthApi = {
  login: (body: LoginRequest) => api.post<AuthResponse>('/auth/login', body).then((r) => r.data),
  register: (body: RegisterRequest) => api.post<AuthResponse>('/auth/register', body).then((r) => r.data),
};

// ---- Incidents ----
export const IncidentApi = {
  report: (body: IncidentReportRequest) =>
    api.post<AgentPipelineResponse>('/incidents/report', body).then((r) => r.data),
  list: () => api.get<IncidentResponse[]>('/incidents').then((r) => r.data),
  get: (id: string) => api.get<IncidentResponse>(`/incidents/${id}`).then((r) => r.data),
};

// ---- Agents / audit trail ----
export const AgentApi = {
  actionsForIncident: (incidentId: string) =>
    api.get<AgentAction[]>(`/agents/incidents/${incidentId}/actions`).then((r) => r.data),
  override: (actionId: string, reason: string) =>
    api.patch<AgentAction>(`/agents/actions/${actionId}/override`, null, { params: { reason } }).then((r) => r.data),
};

// ---- Hospitals ----
export const HospitalApi = {
  list: () => api.get<Hospital[]>('/hospitals').then((r) => r.data),
  updateLoad: (id: string, currentLoad: number) =>
    api.patch<Hospital>(`/hospitals/${id}/load`, null, { params: { currentLoad } }).then((r) => r.data),
};

// ---- Resources ----
export const ResourceApi = {
  list: () => api.get<ResourceItem[]>('/resources').then((r) => r.data),
};

// ---- Volunteers ----
export const VolunteerApi = {
  available: () => api.get<Volunteer[]>('/volunteers/available').then((r) => r.data),
};
