# RescueAI OS — Frontend

Command-center UI for the RescueAI OS agentic disaster-response platform.
React + TypeScript + Vite + Tailwind CSS v4, in a red / black / white
command-center theme, wired to the Spring Boot backend from
`RescueAI-OS-Backend.zip`.

## Run it

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

## Connecting to the real backend

By default the app tries `http://localhost:8080` (the Spring Boot backend's
default port) on load. If it can't reach it, it automatically falls back to
**Demo Simulation mode** — realistic mock incidents, hospitals, volunteers,
resources and a simulated live agent pipeline — so the UI can be reviewed
end-to-end with no backend running.

To point at a different backend URL, create `.env.local`:

```
VITE_API_BASE_URL=https://your-backend-host
```

The top bar always shows which mode you're in (`Live Backend` vs `Demo
Simulation`) plus the WebSocket connection state.

## What's wired to the backend, exactly

| Frontend | Backend endpoint |
|---|---|
| Report form → pipeline visualizer | `POST /api/v1/incidents/report` |
| Incident feed / timeline | `GET /api/v1/incidents` |
| Agent audit trail | `GET /api/v1/agents/incidents/{id}/actions` |
| Hospitals panel | `GET /api/v1/hospitals`, `PATCH /api/v1/hospitals/{id}/load` |
| Volunteers panel | `GET /api/v1/volunteers/available` |
| Resources panel | `GET /api/v1/resources` |
| Live map / feed / alerts | STOMP over `/ws` → `/topic/incidents`, `/topic/agent-pipeline/{id}`, `/topic/alerts` |
| Login | `POST /api/v1/auth/login` |

All request/response shapes in `src/types/index.ts` mirror the backend's
DTOs and enums (`IncidentType`, `IncidentStatus`, `SeverityLevel`,
`ResourceType`, `AgentName`, etc.) field-for-field.

## Structure

```
src/
  types/          TS types mirroring backend DTOs/enums
  lib/
    api.ts        Axios client — one function per controller endpoint
    ws.ts         STOMP/SockJS client for /topic/** live updates
    mock.ts       Demo-mode data + simulated agent pipeline generator
  context/
    DataContext   Tries live API, falls back to demo automatically
  components/
    AppShell      Sidebar + top status bar
    TacticalMap   Custom SVG radar-grid map (no external tile dependency)
    AgentPipeline Live 9-agent orchestration DAG visualizer
    Panel, Badges Shared UI primitives
  pages/
    Dashboard, LiveMap, IncidentTimeline, Hospitals,
    Volunteers, Resources, Analytics, Alerts, Login
```

## Design system

- **Black** (`#0a0a0a` canvas → `#1a1a1d` cards) for 24/7 monitoring comfort.
- **Red** (`#e30613` primary → `#ff3b30` active/hover) used only for alerts,
  live state, and primary actions — never decoration.
- **Bone white** (`#f3f1ec`) for primary text/data, with a disciplined grey
  scale for secondary text. No second hue is introduced anywhere.
- Panels use a hairline border that grows red HUD corner-brackets on hover
  (`.hud-panel` in `src/index.css`) — a targeting-reticle motif that reflects
  the command-center brief.
- Type: **Rajdhani** (display/headers), **Inter** (body), **JetBrains Mono**
  (data, timestamps, coordinates, IDs) — a technical HUD register.
- The signature element is the live **Agent Orchestration DAG** on the
  Command Center page: the nine specialized agents light up in sequence as
  a report moves through Detection → Verification → Severity/Infrastructure
  → Resource Planner → Medical/Logistics → Communication → Outcome Learning.

## Build for production

```bash
npm run build   # outputs to dist/
npm run preview
```
