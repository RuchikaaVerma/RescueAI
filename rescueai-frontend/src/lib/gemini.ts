/**
 * Gemini AI integration for RescueAI agent pipeline.
 * Uses Google Gemini 2.0 Flash to analyze incident reports.
 * Falls back to mock simulation when no API key is configured.
 */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_MODEL = 'gemini-2.0-flash';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

export const isGeminiEnabled = Boolean(GEMINI_API_KEY);

interface GeminiIncidentAnalysis {
  incidentType: string;
  severityLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  severityScore: number;
  spreadRadiusM: number;
  recommendations: string[];
  affectedPopulation: string;
  priorityActions: string[];
  confidence: number;
  summary: string;
}

const SYSTEM_PROMPT = `You are RescueAI's emergency analysis engine for disaster management in coastal India.
Analyze the incident report and return a JSON object with EXACTLY these fields:
{
  "incidentType": one of FLOOD|FIRE|BUILDING_COLLAPSE|ROAD_ACCIDENT|CYCLONE|MEDICAL_EMERGENCY|INDUSTRIAL_HAZARD|EARTHQUAKE,
  "severityLevel": one of LOW|MODERATE|HIGH|CRITICAL,
  "severityScore": integer 1-10,
  "spreadRadiusM": estimated affected radius in meters (integer),
  "recommendations": array of 3 short actionable strings,
  "affectedPopulation": estimated affected count as string (e.g. "200-500 residents"),
  "priorityActions": array of 2 immediate action strings,
  "confidence": float 0-1 representing analysis confidence,
  "summary": one sentence summary of the situation
}
Return ONLY the JSON, no markdown fences, no explanation.`;

export async function analyzeIncidentWithGemini(
  rawText: string,
  latitude: number,
  longitude: number,
): Promise<GeminiIncidentAnalysis | null> {
  if (!GEMINI_API_KEY) return null;

  const prompt = `Location: ${latitude.toFixed(4)}N, ${longitude.toFixed(4)}E (Coastal Tamil Nadu, India)
Time: ${new Date().toLocaleTimeString()}
Report: ${rawText}`;

  try {
    const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 512,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      console.warn('[Gemini] API error:', response.status, await response.text());
      return null;
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) return null;

    const parsed = JSON.parse(text) as GeminiIncidentAnalysis;
    return parsed;
  } catch (err) {
    console.warn('[Gemini] Failed to analyze incident:', err);
    return null;
  }
}

/** Format Gemini analysis as agent step output JSON strings */
export function geminiToAgentSteps(analysis: GeminiIncidentAnalysis): Record<string, string> {
  return {
    EMERGENCY_DETECTION: JSON.stringify({
      type: analysis.incidentType,
      priorityTier: analysis.severityLevel,
      aiPowered: true,
    }),
    VERIFICATION: JSON.stringify({
      confidence: analysis.confidence.toFixed(2),
      summary: analysis.summary,
      aiPowered: true,
    }),
    SEVERITY_PREDICTION: JSON.stringify({
      severityScore: analysis.severityScore,
      spreadRadiusM: analysis.spreadRadiusM,
      affectedPopulation: analysis.affectedPopulation,
      aiPowered: true,
    }),
    INFRASTRUCTURE: JSON.stringify({
      recommendations: analysis.recommendations.slice(0, 2),
      aiPowered: true,
    }),
    RESOURCE_PLANNER: JSON.stringify({
      priorityActions: analysis.priorityActions,
      aiPowered: true,
    }),
    MEDICAL: JSON.stringify({
      triageLevel: analysis.severityScore >= 8 ? 'P1' : analysis.severityScore >= 5 ? 'P2' : 'P3',
      aiPowered: true,
    }),
    LOGISTICS: JSON.stringify({
      deployment: analysis.recommendations[2] ?? 'Ground convoy',
      aiPowered: true,
    }),
    COMMUNICATION: JSON.stringify({
      channelsUsed: ['SMS', 'APP_BANNER'],
      summary: analysis.summary,
      aiPowered: true,
    }),
    OUTCOME_LEARNING: JSON.stringify({
      heuristicDelta: `+${(analysis.confidence * 0.05).toFixed(3)} confidence weight`,
      aiPowered: true,
    }),
  };
}
