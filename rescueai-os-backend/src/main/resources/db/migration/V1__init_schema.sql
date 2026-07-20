-- RescueAI OS — initial schema
-- Enable pgcrypto/uuid generation helpers used by gen_random_uuid() if you seed via raw SQL.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE tenants (
    id             UUID PRIMARY KEY,
    slug           VARCHAR(120) NOT NULL UNIQUE,
    display_name   VARCHAR(200) NOT NULL,
    tenant_type    VARCHAR(60)  NOT NULL,
    config_json    TEXT,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE users (
    id             UUID PRIMARY KEY,
    tenant_id      UUID NOT NULL REFERENCES tenants(id),
    full_name      VARCHAR(200) NOT NULL,
    email          VARCHAR(200) NOT NULL UNIQUE,
    password_hash  VARCHAR(255) NOT NULL,
    phone_number   VARCHAR(30)  NOT NULL,
    role           VARCHAR(30)  NOT NULL,
    last_known_lat DOUBLE PRECISION,
    last_known_lng DOUBLE PRECISION,
    active         BOOLEAN NOT NULL DEFAULT TRUE,
    created_at     TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_users_tenant ON users(tenant_id);

CREATE TABLE incidents (
    id                          UUID PRIMARY KEY,
    tenant_id                   UUID NOT NULL REFERENCES tenants(id),
    type                        VARCHAR(30) NOT NULL DEFAULT 'UNVERIFIED',
    severity_level              VARCHAR(20),
    severity_score              INTEGER,
    status                      VARCHAR(30) NOT NULL DEFAULT 'REPORTED',
    latitude                    DOUBLE PRECISION NOT NULL,
    longitude                   DOUBLE PRECISION NOT NULL,
    description                 TEXT,
    predicted_spread_radius_m   DOUBLE PRECISION,
    dedup_group_id              UUID,
    verification_confidence     DOUBLE PRECISION,
    reported_at                 TIMESTAMP NOT NULL DEFAULT now(),
    resolved_at                 TIMESTAMP
);
CREATE INDEX idx_incidents_tenant ON incidents(tenant_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_geo ON incidents(latitude, longitude);

CREATE TABLE incident_reports (
    id                    UUID PRIMARY KEY,
    incident_id           UUID REFERENCES incidents(id),
    reported_by_user_id   UUID REFERENCES users(id),
    raw_text              TEXT NOT NULL,
    latitude              DOUBLE PRECISION,
    longitude             DOUBLE PRECISION,
    media_urls            TEXT,
    submitted_at          TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_incident_reports_incident ON incident_reports(incident_id);

CREATE TABLE hospitals (
    id                          UUID PRIMARY KEY,
    tenant_id                   UUID NOT NULL REFERENCES tenants(id),
    name                        VARCHAR(200) NOT NULL,
    latitude                    DOUBLE PRECISION,
    longitude                   DOUBLE PRECISION,
    total_capacity              INTEGER NOT NULL,
    current_load                INTEGER NOT NULL DEFAULT 0,
    specialties                 VARCHAR(500),
    blood_bank_units_available  INTEGER NOT NULL DEFAULT 0,
    contact_number              VARCHAR(30) NOT NULL
);
CREATE INDEX idx_hospitals_tenant ON hospitals(tenant_id);

CREATE TABLE resources (
    id                     UUID PRIMARY KEY,
    tenant_id              UUID NOT NULL REFERENCES tenants(id),
    type                   VARCHAR(30) NOT NULL,
    identifier             VARCHAR(120) NOT NULL,
    quantity               INTEGER NOT NULL DEFAULT 1,
    status                 VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    latitude               DOUBLE PRECISION,
    longitude              DOUBLE PRECISION,
    assigned_incident_id   UUID REFERENCES incidents(id)
);
CREATE INDEX idx_resources_tenant ON resources(tenant_id);
CREATE INDEX idx_resources_status ON resources(status);

CREATE TABLE volunteers (
    id                     UUID PRIMARY KEY,
    user_id                UUID NOT NULL UNIQUE REFERENCES users(id),
    skills                 VARCHAR(500),
    available              BOOLEAN NOT NULL DEFAULT TRUE,
    assigned_incident_id   UUID REFERENCES incidents(id),
    current_task           VARCHAR(300)
);

CREATE TABLE agent_actions (
    id               UUID PRIMARY KEY,
    incident_id      UUID NOT NULL REFERENCES incidents(id),
    agent_name       VARCHAR(40) NOT NULL,
    input_summary    TEXT,
    output_json      TEXT NOT NULL,
    confidence       DOUBLE PRECISION,
    overridden       BOOLEAN NOT NULL DEFAULT FALSE,
    override_reason  TEXT,
    latency_ms       BIGINT,
    timestamp        TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_agent_actions_incident ON agent_actions(incident_id);
CREATE INDEX idx_agent_actions_name ON agent_actions(agent_name);

CREATE TABLE sop_documents (
    id              UUID PRIMARY KEY,
    tenant_id       UUID REFERENCES tenants(id),
    title           VARCHAR(300) NOT NULL,
    category        VARCHAR(60),
    content         TEXT NOT NULL,
    embedding_json  TEXT
);
CREATE INDEX idx_sop_documents_category ON sop_documents(category);

CREATE TABLE alert_broadcasts (
    id            UUID PRIMARY KEY,
    incident_id   UUID REFERENCES incidents(id),
    channel       VARCHAR(30) NOT NULL,
    language      VARCHAR(10) NOT NULL,
    audience      VARCHAR(30) NOT NULL,
    content       TEXT NOT NULL,
    sent_at       TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_alert_broadcasts_incident ON alert_broadcasts(incident_id);
