-- ==============================================================================
-- MPLADS Monitoring & Decision Support Portal - Initial Development Seed SQL
-- ==============================================================================

-- 1. Roles
INSERT INTO roles (id, name, description) VALUES
(1, 'ROLE_MINISTRY_ADMIN', 'Ministry of Statistics & Programme Implementation Administrator'),
(2, 'ROLE_STATE_NODAL_AUTHORITY', 'State Nodal Department Authority'),
(3, 'ROLE_DISTRICT_AUTHORITY', 'District Magistrate / Deputy Commissioner Authority'),
(4, 'ROLE_MP', 'Member of Parliament (Lok Sabha / Rajya Sabha)')
ON CONFLICT (name) DO NOTHING;

-- 2. States
INSERT INTO states (id, code, name, total_sanctioned_cr, total_expenditure_cr, active_projects_count) VALUES
(1, 'MH', 'Maharashtra', 480.0, 412.5, 920),
(2, 'UP', 'Uttar Pradesh', 640.0, 528.0, 1280),
(3, 'KA', 'Karnataka', 320.0, 275.4, 640),
(4, 'TN', 'Tamil Nadu', 390.0, 345.0, 780),
(5, 'GJ', 'Gujarat', 260.0, 228.0, 520),
(6, 'RJ', 'Rajasthan', 250.0, 210.0, 500),
(7, 'BR', 'Bihar', 400.0, 310.0, 800),
(8, 'WB', 'West Bengal', 420.0, 350.0, 840),
(9, 'MP', 'Madhya Pradesh', 290.0, 235.0, 580),
(10, 'KL', 'Kerala', 200.0, 182.0, 400),
(11, 'DL', 'NCT of Delhi', 70.0, 62.5, 140),
(12, 'TS', 'Telangana', 170.0, 148.0, 340),
(13, 'AP', 'Andhra Pradesh', 250.0, 218.0, 500),
(14, 'OD', 'Odisha', 210.0, 178.0, 420),
(15, 'AS', 'Assam', 140.0, 115.0, 280)
ON CONFLICT (code) DO NOTHING;

-- 3. Districts
INSERT INTO districts (id, code, name, state_id, headquarters) VALUES
(1, 'MH-PUN', 'Pune', 1, 'Pune City'),
(2, 'MH-NAG', 'Nagpur', 1, 'Nagpur'),
(3, 'UP-VAR', 'Varanasi', 2, 'Varanasi'),
(4, 'UP-LKO', 'Lucknow', 2, 'Lucknow'),
(5, 'KA-BLR', 'Bengaluru Urban', 3, 'Bengaluru')
ON CONFLICT DO NOTHING;

-- 4. Constituencies
INSERT INTO constituencies (id, code, name, district_id, house_type, mp_name) VALUES
(1, 'PC-MH-34', 'Pune', 1, 'Lok Sabha', 'Shri M. Patil'),
(2, 'PC-MH-35', 'Baramati', 1, 'Lok Sabha', 'Smt. S. Sule'),
(3, 'PC-UP-77', 'Varanasi', 3, 'Lok Sabha', 'Shri Narendra Modi'),
(4, 'PC-UP-35', 'Lucknow', 4, 'Lok Sabha', 'Shri Rajnath Singh'),
(5, 'PC-KA-26', 'Bangalore South', 5, 'Lok Sabha', 'Shri Tejasvi Surya')
ON CONFLICT DO NOTHING;

-- 5. Users (BCrypt hashes for default passwords like Admin@123456, State@123456, District@123456, Mp@123456)
-- Note: Handled automatically by Spring Boot DataInitializer at startup.
