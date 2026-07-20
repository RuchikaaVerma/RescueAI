import type {
  IncidentResponse, IncidentType, SeverityLevel, IncidentStatus,
  Hospital, Volunteer, ResourceItem, AlertBroadcast, AgentStepResult, AgentName,
} from '../types';
import { AGENT_PIPELINE_ORDER } from '../types';

// Bounding box for the demo tenant — a coastal district (mirrors "Tenant" concept from the doc)
export const DEMO_BOUNDS = { minLat: 12.90, maxLat: 13.20, minLng: 80.10, maxLng: 80.35 };

let seq = 1000;
const uid = (p: string) => `${p}-${(seq++).toString(36)}`;

const TYPES: IncidentType[] = ['FLOOD', 'FIRE', 'BUILDING_COLLAPSE', 'ROAD_ACCIDENT', 'CYCLONE', 'MEDICAL_EMERGENCY'];
const STATUSES: IncidentStatus[] = ['VERIFIED', 'RESOURCES_ALLOCATED', 'IN_PROGRESS', 'CONTAINED', 'REPORTED'];
const SEV: SeverityLevel[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randLat() { return DEMO_BOUNDS.minLat + Math.random() * (DEMO_BOUNDS.maxLat - DEMO_BOUNDS.minLat); }
function randLng() { return DEMO_BOUNDS.minLng + Math.random() * (DEMO_BOUNDS.maxLng - DEMO_BOUNDS.minLng); }

const STREET_NAMES = ['Marina Rd', 'Harbor District', 'Sector 7', 'Old Mill Quarter', 'Riverside Ave', 'North Bridge', 'Industrial Belt', 'Lakeview Colony'];

export function makeIncident(overrides: Partial<IncidentResponse> = {}): IncidentResponse {
  const sev = rand(SEV);
  const score = sev === 'LOW' ? 2 : sev === 'MODERATE' ? 5 : sev === 'HIGH' ? 7 : 9;
  return {
    id: uid('inc'),
    type: rand(TYPES),
    severityLevel: sev,
    severityScore: score,
    status: rand(STATUSES),
    latitude: randLat(),
    longitude: randLng(),
    description: `Reported near ${rand(STREET_NAMES)}`,
    predictedSpreadRadiusM: sev === 'CRITICAL' ? 1200 : sev === 'HIGH' ? 650 : 200,
    verificationConfidence: 0.6 + Math.random() * 0.39,
    reportedAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 6).toISOString(),
    ...overrides,
  };
}

export function seedIncidents(n = 14): IncidentResponse[] {
  return Array.from({ length: n }, () => makeIncident());
}

export function seedHospitals(): Hospital[] {
  const names = ['St. Xavier General', 'Coastal Trauma Center', 'Sector 7 Community Hospital', 'North Bridge Medical', 'Riverside Clinic Network'];
  return names.map((name) => {
    const capacity = 60 + Math.floor(Math.random() * 180);
    return {
      id: uid('hosp'),
      name,
      capacity,
      currentLoad: Math.floor(capacity * (0.3 + Math.random() * 0.65)),
      specialties: rand([['Trauma', 'ICU'], ['Burns', 'Pediatric'], ['General', 'Cardiac'], ['ICU', 'Orthopedic']]).join(', '),
      bloodBankLevels: `O-: ${Math.floor(Math.random() * 40)}u · O+: ${Math.floor(Math.random() * 90)}u`,
      latitude: randLat(),
      longitude: randLng(),
    };
  });
}

export function seedVolunteers(n = 18): Volunteer[] {
  const skillSets = ['First Aid, Swim Rescue', 'Logistics, Driving', 'Medical Triage', 'Search & Rescue', 'Communications', 'Structural Assessment'];
  const first = ['Aarav', 'Meera', 'Rohan', 'Kavya', 'Ishaan', 'Diya', 'Vikram', 'Ananya', 'Karan', 'Priya', 'Dev', 'Sana'];
  const last = ['Sharma', 'Iyer', 'Nair', 'Reddy', 'Kapoor', 'Menon', 'Rao', 'Das'];
  return Array.from({ length: n }, () => ({
    id: uid('vol'),
    name: `${rand(first)} ${rand(last)}`,
    skills: rand(skillSets),
    available: Math.random() > 0.35,
    location: rand(STREET_NAMES),
    assignedTask: Math.random() > 0.6 ? 'Field deployment — Sector 7' : undefined,
  }));
}

export function seedResources(): ResourceItem[] {
  const types: ResourceItem['type'][] = ['AMBULANCE', 'FIRE_TRUCK', 'HELICOPTER', 'RESCUE_BOAT', 'MEDICAL_KIT', 'BLOOD_UNIT', 'RELIEF_TRUCK', 'DRONE'];
  const statuses: ResourceItem['status'][] = ['AVAILABLE', 'DISPATCHED', 'ON_SITE', 'RETURNING', 'OUT_OF_SERVICE'];
  return types.map((type) => ({
    id: uid('res'),
    type,
    status: rand(statuses),
    quantity: 2 + Math.floor(Math.random() * 24),
    latitude: randLat(),
    longitude: randLng(),
  }));
}

export function seedAlerts(n = 8): AlertBroadcast[] {
  const templates = [
    'Flash flood warning issued for low-lying sectors — move to higher ground immediately.',
    'Evacuation corridor opened via North Bridge — proceed to designated shelters.',
    'Hospital capacity update: Coastal Trauma Center now accepting critical admissions only.',
    'Road closure: Industrial Belt access restricted due to structural hazard assessment.',
    'All-clear issued for Riverside Ave — residents may return under advisory.',
    'Volunteer call-out: Search & Rescue skills needed at Sector 7.',
  ];
  const channels: AlertBroadcast['channel'][] = ['SMS', 'PUSH_NOTIFICATION', 'APP_BANNER', 'PUBLIC_ANNOUNCEMENT', 'EMAIL'];
  return Array.from({ length: n }, () => ({
    id: uid('alert'),
    channel: rand(channels),
    language: rand(['English', 'Hindi', 'Tamil']),
    audience: rand(['Citizens', 'Government', 'NGOs', 'Hospitals']),
    content: rand(templates),
    sentAt: new Date(Date.now() - Math.random() * 1000 * 60 * 60 * 4).toISOString(),
  }));
}

// ---- Simulated agent pipeline run, mirrors AgentOrchestrator's DAG ----
export function simulateAgentOutput(agent: AgentName, incident: IncidentResponse): string {
  switch (agent) {
    case 'EMERGENCY_DETECTION':
      return JSON.stringify({ type: incident.type, priorityTier: incident.severityLevel });
    case 'VERIFICATION':
      return JSON.stringify({ confidence: (incident.verificationConfidence ?? 0.8).toFixed(2), duplicates: Math.floor(Math.random() * 4) });
    case 'SEVERITY_PREDICTION':
      return JSON.stringify({ severityScore: incident.severityScore, spreadRadiusM: incident.predictedSpreadRadiusM });
    case 'INFRASTRUCTURE':
      return JSON.stringify({ roadsBlocked: Math.floor(Math.random() * 3), hazardZones: Math.floor(Math.random() * 2) + 1 });
    case 'RESOURCE_PLANNER':
      return JSON.stringify({ unitsAllocated: Math.floor(Math.random() * 6) + 2, gapAlert: Math.random() > 0.7 });
    case 'MEDICAL':
      return JSON.stringify({ triageLevel: rand(['P1', 'P2', 'P3']), bloodUnitsNeeded: Math.floor(Math.random() * 10) });
    case 'LOGISTICS':
      return JSON.stringify({ deployment: rand(['Ground convoy', 'Air + ground', 'Boat + ground']) });
    case 'COMMUNICATION':
      return JSON.stringify({ channelsUsed: ['SMS', 'APP_BANNER'], languagesSent: 3 });
    case 'OUTCOME_LEARNING':
      return JSON.stringify({ heuristicDelta: '+0.02 confidence weight' });
    default:
      return '{}';
  }
}

export async function* runPipelineDemo(incident: IncidentResponse): AsyncGenerator<AgentStepResult> {
  for (const agent of AGENT_PIPELINE_ORDER) {
    await new Promise((r) => setTimeout(r, 350 + Math.random() * 500));
    yield {
      agentName: agent,
      outputJson: simulateAgentOutput(agent, incident),
      confidence: 0.72 + Math.random() * 0.27,
      latencyMs: Math.floor(120 + Math.random() * 480),
    };
  }
}
