-- Demo tenant + users + hospitals + resources + SOP corpus so the platform
-- is immediately usable after `docker compose up` without manual setup.
-- Demo login for ALL seeded users: password = Password123!

INSERT INTO tenants (id, slug, display_name, tenant_type, config_json, active, created_at)
VALUES (
    'a0000000-0000-0000-0000-000000000001',
    'demo-district',
    'Demo District Disaster Authority',
    'DISTRICT_ADMIN',
    '{"enabledAgents":["EMERGENCY_DETECTION","VERIFICATION","SEVERITY_PREDICTION","INFRASTRUCTURE","RESOURCE_PLANNER","MEDICAL","LOGISTICS","COMMUNICATION"],"locale":"en-IN"}',
    TRUE,
    now()
);

-- password hash below corresponds to plaintext: Password123!
INSERT INTO users (id, tenant_id, full_name, email, password_hash, phone_number, role, active, created_at)
VALUES
('a0000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001',
 'Command Center Operator', 'command@demo.rescueai.os',
 '$2b$10$HhVtB9D.3C9waEecdeTQXuaI48gTKFfY9w.vPmKaABOvTE0yWSoDq',
 '+910000000001', 'COMMAND_CENTER', TRUE, now()),
('a0000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001',
 'Citizen Demo', 'citizen@demo.rescueai.os',
 '$2b$10$HhVtB9D.3C9waEecdeTQXuaI48gTKFfY9w.vPmKaABOvTE0yWSoDq',
 '+910000000002', 'CITIZEN', TRUE, now()),
('a0000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001',
 'Government Liaison', 'gov@demo.rescueai.os',
 '$2b$10$HhVtB9D.3C9waEecdeTQXuaI48gTKFfY9w.vPmKaABOvTE0yWSoDq',
 '+910000000003', 'GOVERNMENT', TRUE, now());

INSERT INTO hospitals (id, tenant_id, name, latitude, longitude, total_capacity, current_load, specialties, blood_bank_units_available, contact_number)
VALUES
('a0000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001',
 'City General Hospital', 28.6139, 77.2090, 500, 180, 'TRAUMA,ICU,ORTHOPEDIC', 120, '+911100000001'),
('a0000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001',
 'Metro Emergency Hospital', 28.6200, 77.2150, 350, 90, 'BURNS,ICU,PEDIATRIC', 60, '+911100000002');

INSERT INTO resources (id, tenant_id, type, identifier, quantity, status, latitude, longitude)
VALUES
('a0000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'AMBULANCE', 'AMB-101', 1, 'AVAILABLE', 28.6150, 77.2100),
('a0000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', 'AMBULANCE', 'AMB-102', 1, 'AVAILABLE', 28.6160, 77.2080),
('a0000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', 'FIRE_TRUCK', 'FT-201', 1, 'AVAILABLE', 28.6180, 77.2120),
('a0000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000001', 'RESCUE_BOAT', 'RB-301', 1, 'AVAILABLE', 28.6100, 77.2050),
('a0000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000001', 'HELICOPTER', 'HC-401', 1, 'AVAILABLE', 28.6250, 77.2200);

INSERT INTO sop_documents (id, tenant_id, title, category, content)
VALUES
('a0000000-0000-0000-0000-000000000040', NULL, 'Mass Casualty Triage Protocol', 'MEDICAL',
 'START triage protocol: categorize casualties into Immediate (red), Delayed (yellow), Minor (green), and Deceased/Expectant (black) based on respiration, perfusion, and mental status. Immediate category requires airway management and hemorrhage control within minutes. Blood product allocation should prioritize Immediate category with active hemorrhage.'),
('a0000000-0000-0000-0000-000000000041', NULL, 'Building Collapse Search & Rescue SOP', 'INFRASTRUCTURE',
 'On report of structural collapse: assume secondary collapse risk for first 2 hours. Establish a 50m exclusion perimeter. Cut electricity and gas supply to the affected structure before entry. Prioritize void-space search using acoustic/thermal detection before heavy machinery clearance.'),
('a0000000-0000-0000-0000-000000000042', NULL, 'Flood Evacuation Communication Guidelines', 'COMMUNICATION',
 'Public flood alerts must state: affected zones by name, evacuation routes, nearest relief shelters, and a helpline number. Avoid technical jargon. Issue in all locally spoken languages. Repeat critical safety instructions at the start and end of every message.');
