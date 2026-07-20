// Mirrors com.rescueai.os.domain.enums exactly

export type Role =
  | 'CITIZEN' | 'HOSPITAL' | 'NGO' | 'GOVERNMENT' | 'VOLUNTEER'
  | 'COMMAND_CENTER' | 'SYSTEM_ADMIN';

export type IncidentType =
  | 'EARTHQUAKE' | 'FLOOD' | 'FIRE' | 'BUILDING_COLLAPSE' | 'CYCLONE'
  | 'INDUSTRIAL_HAZARD' | 'MEDICAL_EMERGENCY' | 'ROAD_ACCIDENT' | 'OTHER' | 'UNVERIFIED';

export type IncidentStatus =
  | 'REPORTED' | 'VERIFYING' | 'VERIFIED' | 'REJECTED_DUPLICATE' | 'REJECTED_FALSE'
  | 'RESOURCES_ALLOCATED' | 'IN_PROGRESS' | 'CONTAINED' | 'RESOLVED' | 'CLOSED';

export type SeverityLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export type ResourceType =
  | 'AMBULANCE' | 'FIRE_TRUCK' | 'HELICOPTER' | 'RESCUE_BOAT' | 'MEDICAL_KIT'
  | 'BLOOD_UNIT' | 'RELIEF_TRUCK' | 'DRONE' | 'OTHER';

export type ResourceStatus = 'AVAILABLE' | 'DISPATCHED' | 'ON_SITE' | 'RETURNING' | 'OUT_OF_SERVICE';

export type AgentName =
  | 'EMERGENCY_DETECTION' | 'VERIFICATION' | 'SEVERITY_PREDICTION' | 'RESOURCE_PLANNER'
  | 'MEDICAL' | 'INFRASTRUCTURE' | 'LOGISTICS' | 'COMMUNICATION' | 'OUTCOME_LEARNING';

export type AlertChannel = 'SMS' | 'PUSH_NOTIFICATION' | 'APP_BANNER' | 'EMAIL' | 'PUBLIC_ANNOUNCEMENT';

// ---- DTOs ----

export interface IncidentReportRequest {
  rawText: string;
  latitude: number;
  longitude: number;
  mediaUrls?: string;
}

export interface IncidentResponse {
  id: string;
  type: IncidentType | null;
  severityLevel: SeverityLevel | null;
  severityScore: number | null;
  status: IncidentStatus;
  latitude: number;
  longitude: number;
  description: string | null;
  predictedSpreadRadiusM: number | null;
  verificationConfidence: number | null;
  reportedAt: string;
}

export interface AgentStepResult {
  agentName: AgentName | string;
  outputJson: string;
  confidence: number;
  latencyMs: number;
}

export interface AgentPipelineResponse {
  incident: IncidentResponse;
  steps: AgentStepResult[];
}

export interface AgentAction {
  id: string;
  agentName: AgentName;
  inputRef?: string;
  outputJson: string;
  confidence: number;
  timestamp: string;
  overridden?: boolean;
  overrideReason?: string;
}

export interface Hospital {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  specialties?: string;
  bloodBankLevels?: string;
  latitude?: number;
  longitude?: number;
}

export interface Volunteer {
  id: string;
  name: string;
  skills: string;
  available: boolean;
  location?: string;
  assignedTask?: string;
}

export interface ResourceItem {
  id: string;
  type: ResourceType;
  status: ResourceStatus;
  quantity: number;
  latitude?: number;
  longitude?: number;
}

export interface AlertBroadcast {
  id: string;
  channel: AlertChannel;
  language: string;
  audience: string;
  content: string;
  sentAt: string;
}

export interface AuthResponse {
  token: string;
  role: Role;
  tenantId: string;
  userId: string;
  name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export const AGENT_PIPELINE_ORDER: AgentName[] = [
  'EMERGENCY_DETECTION',
  'VERIFICATION',
  'SEVERITY_PREDICTION',
  'INFRASTRUCTURE',
  'RESOURCE_PLANNER',
  'MEDICAL',
  'LOGISTICS',
  'COMMUNICATION',
  'OUTCOME_LEARNING',
];

export const AGENT_LABELS: Record<string, string> = {
  EMERGENCY_DETECTION: 'Emergency Detection',
  VERIFICATION: 'Verification',
  SEVERITY_PREDICTION: 'Severity & Spread',
  INFRASTRUCTURE: 'Infrastructure',
  RESOURCE_PLANNER: 'Resource Planner',
  MEDICAL: 'Medical',
  LOGISTICS: 'Logistics',
  COMMUNICATION: 'Communication',
  OUTCOME_LEARNING: 'Outcome Learning',
};
