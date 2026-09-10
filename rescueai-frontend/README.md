<div align="center">

# 🚨 RescueAI OS

### *Agentic AI Operating System for Disaster Intelligence, Coordination & Autonomous Decision Support*

[![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

> **RescueAI** is a full-stack, production-grade emergency response platform powered by a **multi-agent AI pipeline**. Eight autonomous AI agents work in concert to detect, verify, triage, and coordinate disaster response — all in real-time.

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [AI Agent Pipeline](#-ai-agent-pipeline)
- [Tech Stack](#-tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Infrastructure](#infrastructure)
- [Design System and Theme](#-design-system-and-theme)
- [Project Structure](#-project-structure)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Quick Start with Docker](#quick-start-with-docker)
  - [Local Development](#local-development)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Key Features](#-key-features)

---

## 🌐 Overview

RescueAI OS is designed to serve **disaster response command centers**, giving operators a unified, real-time view of ongoing emergencies, resource allocation, hospital capacity, and volunteer deployment.

The core innovation is the **Agentic Pipeline** — when an incident is reported, eight specialized AI agents automatically:

1. Detect and classify the emergency
2. Verify and de-duplicate reports
3. Predict severity and spread radius
4. Plan resource allocation
5. Coordinate medical triage
6. Assess infrastructure impact
7. Manage logistics routing
8. Broadcast multi-channel alerts

All agent decisions are **auditable**, with full input/output logs, confidence scores, latencies, and human-override support.

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        RescueAI Monorepo                         │
│                                                                  │
│   ┌─────────────────────────┐   ┌──────────────────────────────┐ │
│   │    rescueai-frontend    │   │    rescueai-os-backend       │ │
│   │  React 19 + TypeScript  │◄─►│  Spring Boot 3.3 + Java 21  │ │
│   │  Vite + Tailwind CSS v4 │   │  Spring AI + WebSocket       │ │
│   └─────────────────────────┘   └──────────┬─────────────────┘  │
│                                            │                     │
│                              ┌─────────────▼──────────────┐      │
│                              │     PostgreSQL 16           │      │
│                              │     Redis 7 (cache/pubsub)  │      │
│                              │     Flyway Migrations        │      │
│                              └────────────────────────────┘      │
└──────────────────────────────────────────────────────────────────┘
```

The system uses a **multi-tenant** architecture — each organisation (e.g., state disaster authority, municipal fire department) is an isolated `Tenant`, with its own users, incidents, resources, and hospitals.

---

## 🤖 AI Agent Pipeline

When an incident is reported, the **AgentOrchestrator** runs the following pipeline:

| # | Agent | Responsibility |
|---|-------|---------------|
| 1 | **EmergencyDetectionAgent** | Classify incident type (flood, fire, earthquake, etc.) from raw text |
| 2 | **VerificationAgent** | Cross-validate reports, detect duplicates, assign confidence score |
| 3 | **SeverityPredictionAgent** | Score severity (1–10) and predict spread radius in metres |
| 4 | **ResourcePlannerAgent** | Select optimal ambulances, fire trucks, helicopters from available fleet |
| 5 | **MedicalAgent** | Match nearest hospitals by specialty and capacity, recommend triage protocol |
| 6 | **InfrastructureAgent** | Assess road blockages, utility failures, evacuation route viability |
| 7 | **LogisticsAgent** | Coordinate supply chains, fuel, relief material routing |
| 8 | **CommunicationAgent** | Draft multilingual public alerts for SMS, push, and broadcast channels |

Each agent:
- Calls the configured **LLM** (OpenAI-compatible or Ollama local model)
- Returns a structured `AgentResult` with `summary`, `confidence`, `latencyMs`
- Is persisted to `agent_actions` table for full audit trail
- Can be **human-overridden** with a reason log

---

## 🛠️ Tech Stack

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 19 | Core UI framework |
| **TypeScript** | ~6.0 | Type-safe development |
| **Vite** | 8.x | Lightning-fast build tool and dev server |
| **Tailwind CSS** | v4 | Utility-first styling (PostCSS plugin) |
| **Framer Motion** | 12.x | Fluid animations and micro-interactions |
| **React Router DOM** | v7 | Client-side routing |
| **Recharts** | 3.x | Responsive charts and data visualisation |
| **Leaflet.js** | 1.x | Interactive OpenStreetMap tile-based map |
| **Axios** | 1.x | HTTP client for REST API calls |
| **@stomp/stompjs** | 7.x | STOMP protocol over WebSocket |
| **SockJS Client** | 1.x | WebSocket fallback transport |
| **Lucide React** | 1.x | Clean, consistent icon set |
| **clsx** | 2.x | Conditional class name composition |
| **vite-plugin-pwa** | 1.x | Service worker + offline PWA support |
| **oxlint** | 1.x | Fast Rust-based linter |

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 21 (LTS) | Core language |
| **Spring Boot** | 3.3.4 | Application framework |
| **Spring AI** | 1.0.0-M6 | LLM integration and abstractions |
| **Spring Security** | 6.x | JWT-based authentication |
| **Spring Data JPA** | 3.x | ORM / repository layer |
| **Spring WebSocket** | 3.x | Real-time alert broadcasting (STOMP) |
| **Spring Cache** | 3.x | Application-level caching |
| **Spring Actuator** | 3.x | Health checks and metrics endpoints |
| **Spring Validation** | 3.x | Bean Validation (JSR-380) |
| **PostgreSQL Driver** | 16 | Primary relational database |
| **Flyway** | latest | Database schema version control |
| **Redis** | 7 | Caching and pub/sub layer |
| **JJWT** | 0.12.6 | JWT creation and validation |
| **Lombok** | 1.18.46 | Boilerplate reduction (builders, getters) |
| **SpringDoc OpenAPI** | 2.6.0 | Swagger UI at `/swagger-ui.html` |
| **OpenAI Spring AI Starter** | M6 | OpenAI / Gemini compatible LLM calls |
| **Ollama Spring AI Starter** | M6 | Local LLM (Llama3, Gemma, Mistral, DeepSeek) |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerisation |
| **Docker Compose** | Multi-service orchestration (Postgres + Redis + App) |
| **PostgreSQL 16** | Primary database (Alpine image) |
| **Redis 7** | Cache and real-time pub/sub (Alpine image) |
| **Maven** | Java build system |
| **Google Fonts** | Rajdhani · Inter · JetBrains Mono |

---

## 🎨 Design System and Theme

The frontend uses a custom **Emergency Command Centre** aesthetic — clean, clinical whites with high-contrast signal red accents that evoke urgency without fatigue.

### Colour Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--color-void` | `#ffffff` | Base background |
| `--color-charcoal` | `#fafafa` | Secondary background |
| `--color-steel` | `#f5f5f5` | Card surfaces |
| `--color-line` | `#e8e8e8` | Borders / dividers |
| `--color-signal` | `#dc2626` | Primary accent — alerts, CTAs |
| `--color-signal-bright` | `#ef4444` | Hover / active states |
| `--color-signal-dim` | `#fca5a5` | Muted accent |
| `--color-signal-glow` | `#ff6b6b` | Gradient terminus |
| `--color-rose-light` | `#fff1f2` | Subtle tinted backgrounds |
| `--color-rose-border` | `#fecdd3` | Accent border on hover |
| `--color-bone` | `#1a1a1a` | Primary text |
| `--color-ash` | `#6b7280` | Secondary text |

### Typography

| Font | Weight | Role |
|------|--------|------|
| **Rajdhani** | 500 · 600 · 700 | Display headings, HUD labels |
| **Inter** | 400 · 500 · 600 · 700 | Body copy, UI text |
| **JetBrains Mono** | 400 · 500 · 600 | Code, IDs, mono tags |

### UI / Animation Patterns

| Pattern | Description |
|---------|-------------|
| **HUD Panels** | Cards with animated corner brackets that expand on hover (tactical-display feel) |
| **Animated Background Orbs** | Three soft red radial blobs drift behind content via `orb-drift` keyframe (18s loop) |
| **Pulse Dot** | Live status indicators with a radiating ring animation (`pulse-ring`) |
| **Shimmer Loader** | Rose-tinted shimmer skeleton for loading states |
| **Grid Texture** | Subtle 32 × 32 px red grid lines as background texture |
| **Stat Accent Bar** | 3 px gradient bar slides in from the top of stat cards on hover |
| **Nav Active Glow** | Inset left-border glow for the active sidebar item |
| **Animated Underline** | Width-expanding underline on nav link hover |
| **Ping Live** | Pulsing box-shadow on live status badges |
| **Float Up** | Cards animate upward on mount (`float-up` keyframe) |
| **Badge Pop** | Elastic spring scale animation on badge render |

---

## 📁 Project Structure

```
RescueAI/
├── rescueai-frontend/                  # React + TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentPipeline.tsx       # Live agent step visualiser
│   │   │   ├── AppShell.tsx            # Sidebar + layout shell + weather + notifications
│   │   │   ├── Badges.tsx              # Status / severity badge components
│   │   │   ├── EmergencyCallPanel.tsx  # One-tap emergency call buttons
│   │   │   ├── EmergencyToast.tsx      # Toast notification overlay
│   │   │   ├── NotificationCenter.tsx  # Bell icon + notification dropdown
│   │   │   ├── Panel.tsx               # Reusable HUD panel wrapper
│   │   │   ├── TacticalMap.tsx         # Leaflet OpenStreetMap with incident overlays
│   │   │   ├── VolunteerTracker.tsx    # Live GPS tracking via Geolocation API
│   │   │   └── WeatherWidget.tsx       # Live weather + disaster risk badge
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx           # Main command centre + AI pipeline + media upload
│   │   │   ├── Alerts.tsx              # Alert broadcast + emergency contacts
│   │   │   ├── Analytics.tsx           # 6 real-data charts and visualisations
│   │   │   ├── Hospitals.tsx           # Hospital capacity and routing
│   │   │   ├── IncidentTimeline.tsx    # Per-incident audit timeline
│   │   │   ├── LiveMap.tsx             # Full-screen map + GPS + emergency dial
│   │   │   ├── Login.tsx               # JWT authentication flow
│   │   │   ├── Resources.tsx           # Fleet and resource management
│   │   │   └── Volunteers.tsx          # Volunteer dispatch console
│   │   ├── context/
│   │   │   └── DataContext.tsx         # Global state: incidents, notifications, GPS
│   │   ├── lib/
│   │   │   ├── api.ts                  # Axios REST client
│   │   │   ├── gemini.ts               # Gemini 2.0 Flash AI integration
│   │   │   ├── mock.ts                 # Demo-mode data generator
│   │   │   ├── notifications.ts        # Web Notifications API wrapper
│   │   │   ├── weather.ts              # OpenWeatherMap API client
│   │   │   └── ws.ts                   # STOMP/SockJS WebSocket client
│   │   ├── types/                      # Shared TypeScript interfaces
│   │   ├── App.tsx                     # Router and app entry
│   │   └── index.css                   # Global design system and theme
│   ├── vite.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── rescueai-os-backend/                # Spring Boot API
│   ├── src/main/java/com/rescueai/os/
│   │   ├── agent/
│   │   │   ├── Agent.java              # Agent interface contract
│   │   │   ├── AgentContext.java       # Shared context passed through pipeline
│   │   │   ├── AgentOrchestrator.java  # Runs the 8-agent sequential pipeline
│   │   │   ├── AgentResult.java        # Agent output wrapper
│   │   │   └── impl/                   # 8 concrete agent implementations
│   │   ├── ai/
│   │   │   ├── LlmClient.java          # LLM abstraction interface
│   │   │   └── impl/SpringAiLlmClient  # Spring AI implementation
│   │   ├── controller/                 # REST controllers
│   │   ├── domain/
│   │   │   ├── entity/                 # JPA entities
│   │   │   └── enums/                  # Type-safe enumerations
│   │   ├── dto/                        # Request / Response DTOs
│   │   ├── repository/                 # Spring Data JPA repositories
│   │   ├── security/                   # JWT filter, UserDetails, SecurityConfig
│   │   ├── service/                    # Business logic
│   │   ├── config/                     # Async, WebSocket, Security config beans
│   │   └── websocket/                  # STOMP alert broadcaster
│   ├── src/main/resources/
│   │   ├── application.yml             # App config (env-var driven)
│   │   └── db/migration/
│   │       ├── V1__init_schema.sql     # Full schema definition
│   │       └── V2__seed_demo_data.sql  # Demo tenant + seeded data
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── pom.xml
│
└── README.md
```

---

## 🗄️ Database Schema

The schema is managed by **Flyway** and lives in `V1__init_schema.sql`.

```
tenants ──┬── users ──────────── volunteers
          │
          ├── incidents ─────────┬── incident_reports
          │                      ├── agent_actions
          │                      ├── alert_broadcasts
          │                      └── resources (assigned_to)
          │
          ├── hospitals
          ├── resources
          └── sop_documents
```

Key design decisions:
- **UUID primary keys** everywhere — safe for distributed generation
- **Multi-tenant isolation** via `tenant_id` FK on every business table
- **Geospatial fields** (`latitude`, `longitude`) on incidents, hospitals, resources, and users for map rendering
- **Agent audit trail** in `agent_actions` — every LLM call stored with `confidence`, `latency_ms`, `overridden` flag
- `pgcrypto` extension enabled for UUID generation in raw SQL seeds

---

## 🚀 Getting Started

### Prerequisites

- **Docker and Docker Compose** (recommended for quick start)
- Or: **Java 21**, **Node.js 20+**, **PostgreSQL 16**, **Redis 7** for local dev

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/RuchikaaVerma/RescueAI.git
cd RescueAI

# Configure backend environment
cp rescueai-os-backend/.env.example rescueai-os-backend/.env
# Edit .env — set AI_API_KEY, AI_BASE_URL, AI_MODEL, JWT_SECRET

# Start Postgres + Redis + Spring Boot API
cd rescueai-os-backend
docker compose up --build -d

# Start the React frontend (new terminal)
cd ../rescueai-frontend
cp .env.example .env.local
npm install
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8081 |
| Swagger UI | http://localhost:8081/swagger-ui.html |

### Local Development

#### Backend

```bash
cd rescueai-os-backend

# Start only infrastructure
docker compose up postgres redis -d

# Run Spring Boot
./mvnw spring-boot:run
# Windows:
mvnw.cmd spring-boot:run
```

#### Frontend

```bash
cd rescueai-frontend
npm install
npm run dev       # Vite dev server with HMR
npm run build     # Production build
npm run lint      # oxlint fast linting
npm run preview   # Preview production build
```

---

## 🔑 Environment Variables

### Backend (`rescueai-os-backend/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `rescueai_os` | Database name |
| `DB_USER` | `rescueai` | DB username |
| `DB_PASSWORD` | `rescueai` | DB password |
| `REDIS_HOST` | `localhost` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `AI_PROVIDER` | `openai` | `openai` or `ollama` |
| `AI_API_KEY` | *(required)* | OpenAI / Gemini API key |
| `AI_BASE_URL` | `https://api.openai.com` | LLM base URL |
| `AI_MODEL` | `gpt-4o-mini` | Model identifier |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama endpoint for local LLMs |
| `OLLAMA_MODEL` | `llama3` | Local model name |
| `JWT_SECRET` | *(change in prod)* | HS256 signing secret |
| `JWT_EXPIRATION_MS` | `86400000` | Token TTL (24 hours) |

### Frontend (`rescueai-frontend/.env.local`)

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8081` | Backend REST base URL |
| `VITE_WS_URL` | `http://localhost:8081/ws` | WebSocket endpoint |
| `VITE_GEMINI_API_KEY` | *(optional)* | Google Gemini AI key — enables real AI pipeline |
| `VITE_WEATHER_API_KEY` | *(optional)* | OpenWeatherMap key — enables live weather widget |

> **Tip:** Both frontend AI keys are optional. Without them the app runs in demo/mock mode with realistic simulated data.

> **Tip:** The backend is **LLM-agnostic**. Point `AI_BASE_URL` at Google Gemini's OpenAI-compatible endpoint to use Gemini models without any code changes. Switch `AI_PROVIDER=ollama` to run fully offline with Llama 3, Gemma, Mistral, Phi, or DeepSeek.

---

## 📖 API Documentation

Interactive Swagger UI → `http://localhost:8081/swagger-ui.html`

OpenAPI JSON spec → `http://localhost:8081/v3/api-docs`

### Core Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Obtain JWT token |
| `POST` | `/api/incidents/report` | Submit incident → triggers AI pipeline |
| `GET` | `/api/incidents` | List all incidents (paginated) |
| `GET` | `/api/incidents/{id}` | Get incident + agent action log |
| `GET` | `/api/hospitals` | List hospitals with capacity |
| `GET` | `/api/resources` | List available resources by type |
| `GET` | `/api/volunteers` | List available volunteers |
| `GET` | `/api/agents/{incidentId}/pipeline` | Full AI pipeline output for incident |
| `WS` | `/ws` (STOMP) | Subscribe to `/topic/alerts` for live updates |

---

## ✨ Key Features

- 🔴 **Real-Time Dashboard** — Live incident map, active emergency counts, resource utilisation
- 🤖 **8-Agent AI Pipeline** — Fully autonomous incident analysis from detection to communication
- ✨ **Gemini AI Integration** — Real Gemini 2.0 Flash powers the agent pipeline; gracefully falls back to simulation
- 🌤️ **Live Weather Widget** — OpenWeatherMap data with disaster risk assessment (LOW → CRITICAL) in the header
- 🔔 **Browser Push Notifications** — Critical incident alerts fire even when the tab is minimised
- 🔔 **In-App Notification Center** — Bell icon with unread count badge, full notification history
- 📍 **Volunteer GPS Tracking** — Real GPS position shared as a pulsing blue dot on the live map
- 📸 **Incident Media Upload** — Attach photos and videos to incident reports with live preview
- 🌐 **PWA + Offline Mode** — Installable on mobile, OpenStreetMap tiles cached for offline use
- 🏥 **Hospital Routing** — Capacity-aware nearest-hospital recommendation with specialty matching
- 🚑 **Resource Management** — Fleet tracking for ambulances, fire engines, helicopters, water tankers
- 🧑‍🤝‍🧑 **Volunteer Dispatch** — Skill-based volunteer assignment with real-time location
- 📡 **Emergency Calling** — One-tap direct dial to National Disaster Response Force, Coast Guard, and district HQs
- 📡 **WebSocket Alerts** — STOMP-over-SockJS push notifications to all connected operators
- 📊 **Enhanced Analytics** — 6 real-data charts: hourly heatmap, resource status, AI confidence, alert radar
- 🗺️ **Interactive Tactical Map** — Leaflet OpenStreetMap with incident/hospital/resource overlays and navigation
- 🔐 **JWT Auth** — Stateless authentication with role-based access (Admin, Operator, Responder, Volunteer)
- 🏢 **Multi-Tenant** — Full tenant isolation for multiple organisations on a single deployment
- 🐳 **Docker Ready** — Single `docker compose up` spins the entire stack
- 📝 **Audit Trail** — Every agent decision stored with confidence score, latency, and override log
- 🌐 **LLM Agnostic** — Works with OpenAI, Google Gemini, or any local Ollama model

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by **Ruchikaa Verma**

*RescueAI OS — Because every second in a disaster counts.*

</div>
