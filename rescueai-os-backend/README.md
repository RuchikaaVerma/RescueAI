# RescueAI OS — Backend

**An Agentic AI Operating System for Disaster Intelligence, Coordination & Autonomous Decision Support.**

This is the Phase 1 MVP backend: Spring Boot + a real multi-agent orchestrator (not a single LLM call) + PostgreSQL, built to the architecture described in the project overview. It is designed so Phase 2 (research instrumentation) and Phase 3 (multi-tenant platform) are config/data changes, not rewrites.

---

## What's actually implemented

- **Full REST API**: auth (JWT), incident reporting, incident listing, hospitals, resources, volunteers, and an agent-audit endpoint.
- **8-agent orchestration pipeline** (`AgentOrchestrator`) wired end-to-end: Emergency Detection → Verification → Severity/Spread Prediction → Infrastructure → Resource Planner → Medical → Logistics → Communication.
- **Every agent decision is persisted** (`AgentAction` table) — this is your audit trail for research metrics (override rate, latency, confidence) and for government-customer compliance later.
- **Provider-agnostic LLM layer** (`LlmClient` interface + `AiConfig`): flip `rescueai.ai.provider` between `openai` (points at OpenAI or Gemini's OpenAI-compatible endpoint) and `ollama` (local Llama/Mistral/Gemma/Phi/DeepSeek) via one env var. No agent code changes.
- **Multi-tenant schema from day one** (`Tenant` entity + `tenant_id` on every table) — Phase 3 verticals are new tenant rows + config JSON, not forks.
- **Live updates via WebSocket/STOMP** (`/ws`, topics `/topic/incidents`, `/topic/agent-pipeline/{incidentId}`, `/topic/alerts`) for the React command-center frontend.
- **RAG-ready SOP corpus table** (`SopDocument`) with a seeded medical/infrastructure/communication SOP so the Medical Agent's grounding is demonstrable out of the box (MVP stores raw text; wire in pgvector similarity search when you're ready to embed properly).
- **Flyway-managed schema** with a demo tenant, hospitals, ambulances/trucks/helicopter/boat, and SOPs pre-seeded — runnable immediately.
- **Dockerized**: `docker compose up` gets you Postgres + Redis + the API running.

## What's intentionally left as your next increment

- Parallel agent execution (Severity/Infrastructure and Medical/Logistics are independent — the orchestrator comments show exactly where to swap sequential calls for `CompletableFuture` on the provided `agentTaskExecutor` bean).
- Real pgvector-based embedding search for SOPs (currently plain-text retrieval by category).
- Outcome Learning Agent (Phase 2) — the `AgentAction` audit table already has everything it needs to be built against.
- Rate limiting / API gateway concerns for public citizen-facing endpoints.

---

## Architecture

```
React Frontend (WebSocket + REST)
        │
Spring Boot API (Auth, Incident, Hospital, Resource, Volunteer, Agent controllers)
        │
AgentOrchestrator ── Detection → Verification → Severity/Spread → Infrastructure
                     → Resource Planner → Medical → Logistics → Communication
        │                                │
        │                          LlmClient (provider-agnostic)
        │                                │
        │                    OpenAI/Gemini  ⇄  local Ollama (Llama/Mistral/Gemma/Phi/DeepSeek)
        │
PostgreSQL (Tenant, User, Incident, Hospital, Resource, Volunteer, AgentAction, SopDocument, AlertBroadcast)
Redis (cache / pub-sub ready)
```

---

## Running it

### 1. Fastest path — Docker Compose

```bash
cp .env.example .env
# edit .env: set AI_API_KEY (a Gemini or OpenAI key)
docker compose up --build
```

The API comes up on **http://localhost:8080**, schema + demo data are applied automatically by Flyway on first boot.

### 2. Local dev (Postgres/Redis via Docker, app via Maven)

```bash
docker compose up postgres redis -d
export AI_API_KEY=your-key-here
mvn spring-boot:run
```

### 3. Swagger / API docs

Once running: **http://localhost:8080/swagger-ui.html**

---

## Demo credentials (seeded by `V2__seed_demo_data.sql`)

| Email | Role | Password |
|---|---|---|
| `command@demo.rescueai.os` | COMMAND_CENTER | `Password123!` |
| `citizen@demo.rescueai.os` | CITIZEN | `Password123!` |
| `gov@demo.rescueai.os` | GOVERNMENT | `Password123!` |

Tenant slug for registering additional users: `demo-district`

---

## Try the core flow with curl

```bash
# 1. Log in
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"citizen@demo.rescueai.os","password":"Password123!"}' | jq -r .token)

# 2. Report an incident — this fires the FULL 8-agent pipeline synchronously
curl -s -X POST http://localhost:8080/api/v1/incidents/report \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
        "rawText": "Building collapsed near Metro Station, many people trapped, screaming heard from rubble.",
        "latitude": 28.6139,
        "longitude": 77.2090
      }' | jq

# 3. List incidents for your tenant
curl -s http://localhost:8080/api/v1/incidents -H "Authorization: Bearer $TOKEN" | jq

# 4. See every agent's logged decision for an incident (replace INCIDENT_ID)
curl -s http://localhost:8080/api/v1/agents/incidents/INCIDENT_ID/actions \
  -H "Authorization: Bearer $TOKEN" | jq
```

Step 2's response contains the aggregated output of all 8 agents; each step is also pushed live to `/topic/agent-pipeline/{incidentId}` over WebSocket as it completes, which is what the React "AI Command Center" pipeline visualizer should subscribe to.

---

## Switching AI providers (the whole point of the architecture)

**Phase 1 — Gemini via OpenAI-compatible endpoint (default):**
```
AI_PROVIDER=openai
AI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai
AI_API_KEY=<gemini-api-key>
AI_MODEL=gemini-1.5-flash
```

**Phase 2 — local open-weight model via Ollama:**
```bash
ollama pull llama3   # or mistral, gemma, phi, deepseek-r1 etc.
ollama serve
```
```
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3
```
No agent class, controller, or orchestrator code changes for either switch — see `AiConfig.java`.

---

## Running tests

```bash
mvn test
```
Uses an in-memory H2 database (`application-test.yml`) so no external services are required for the test suite.

---

## Project layout

```
src/main/java/com/rescueai/os/
├── agent/            Agent interface, AgentContext/AgentResult, AgentOrchestrator
│   └── impl/         The 8 specialized agents
├── ai/               LlmClient abstraction + provider config (AiConfig)
│   └── impl/         SpringAiLlmClient
├── config/           Security, WebSocket, Async config
├── controller/       REST endpoints
├── domain/
│   ├── entity/       JPA entities (Tenant, User, Incident, Hospital, Resource, ...)
│   └── enums/        Role, IncidentType, SeverityLevel, ResourceType, AgentName, ...
├── dto/              Request/response payloads
├── exception/        Global error handling
├── repository/       Spring Data JPA repositories
├── security/         JWT filter/service, UserDetails
├── service/          AuthService, IncidentService
└── websocket/        AlertBroadcaster (STOMP publisher)

src/main/resources/db/migration/   Flyway schema + demo seed data
```

---

## Next steps toward the full vision

1. **Frontend**: React + TS + Tailwind + shadcn/ui red/black/white command center, consuming this API + WebSocket topics (Live Map, AI Command Center pipeline view, Hospital panel, Resource inventory, Analytics, Incident timeline, Alerts).
2. **Parallelize** the independent agent branches using the provided `agentTaskExecutor`.
3. **pgvector** for real SOP embedding search inside the Medical/Infrastructure/Communication agents.
4. **Outcome Learning Agent**: compare `AgentAction` predictions against actual incident outcomes once `Incident.resolvedAt`/status history is populated — this is Paper 3/4 material.
5. **Multi-tenant onboarding UI**: a Tenant config editor so District Admin vs. Smart City vs. Industrial Plant vs. Campus is a form, not a deploy.
