-- ==============================================================================
-- MPLADS Monitoring & Decision Support Portal - Complete PostgreSQL DDL Schema
-- Ministry of Statistics & Programme Implementation, Government of India
-- ==============================================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255)
);

-- 2. States Table
CREATE TABLE IF NOT EXISTS states (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    total_sanctioned_cr DOUBLE PRECISION DEFAULT 0.0,
    total_expenditure_cr DOUBLE PRECISION DEFAULT 0.0,
    active_projects_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);

-- 3. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    state_id BIGINT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    headquarters VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_districts_state_id ON districts(state_id);

-- 4. Constituencies Table
CREATE TABLE IF NOT EXISTS constituencies (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL,
    name VARCHAR(100) NOT NULL,
    district_id BIGINT NOT NULL REFERENCES districts(id) ON DELETE CASCADE,
    house_type VARCHAR(30) DEFAULT 'Lok Sabha',
    mp_name VARCHAR(150),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_constituencies_district_id ON constituencies(district_id);

-- 5. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    mobile_number VARCHAR(20),
    role_id BIGINT NOT NULL REFERENCES roles(id),
    state_id BIGINT REFERENCES states(id) ON DELETE SET NULL,
    district_id BIGINT REFERENCES districts(id) ON DELETE SET NULL,
    constituency_id BIGINT REFERENCES constituencies(id) ON DELETE SET NULL,
    organization VARCHAR(200),
    designation VARCHAR(150),
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    is_approved BOOLEAN NOT NULL DEFAULT FALSE,
    account_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    clearance_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_role ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_user_state ON users(state_id);
CREATE INDEX IF NOT EXISTS idx_user_district ON users(district_id);

-- 6. Project Categories Table
CREATE TABLE IF NOT EXISTS project_categories (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255)
);

-- 7. Projects Table (Master Project Registry)
CREATE TABLE IF NOT EXISTS projects (
    id BIGSERIAL PRIMARY KEY,
    project_id VARCHAR(60) UNIQUE NOT NULL,
    project_name VARCHAR(300) NOT NULL,
    description TEXT,
    state_id BIGINT NOT NULL REFERENCES states(id),
    district_id BIGINT NOT NULL REFERENCES districts(id),
    constituency_id BIGINT REFERENCES constituencies(id),
    mp_user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    mp_name VARCHAR(150),
    implementing_agency VARCHAR(200),
    category_id BIGINT REFERENCES project_categories(id),
    category_name VARCHAR(100),
    sanctioned_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    released_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    expenditure_amount DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    start_date DATE,
    expected_completion_date DATE,
    actual_completion_date DATE,
    physical_progress INTEGER NOT NULL DEFAULT 0,
    financial_progress DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    status VARCHAR(50) NOT NULL DEFAULT 'ONGOING',
    risk_level VARCHAR(50) DEFAULT 'LOW',
    risk_score DOUBLE PRECISION DEFAULT 0.0,
    risk_reason VARCHAR(1000),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    delay_days INTEGER DEFAULT 0,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE
);
CREATE INDEX IF NOT EXISTS idx_projects_project_id ON projects(project_id);
CREATE INDEX IF NOT EXISTS idx_projects_state_id ON projects(state_id);
CREATE INDEX IF NOT EXISTS idx_projects_district_id ON projects(district_id);
CREATE INDEX IF NOT EXISTS idx_projects_constituency_id ON projects(constituency_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_risk_level ON projects(risk_level);

-- 8. Sanctions Table
CREATE TABLE IF NOT EXISTS sanctions (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    sanction_order_number VARCHAR(100) NOT NULL,
    sanction_date DATE NOT NULL,
    sanctioned_amount DOUBLE PRECISION NOT NULL,
    sanctioning_authority VARCHAR(150),
    work_order_number VARCHAR(100),
    remarks VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_sanctions_project_id ON sanctions(project_id);

-- 9. Fund Releases Table
CREATE TABLE IF NOT EXISTS fund_releases (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    installment_number INTEGER NOT NULL,
    release_order_number VARCHAR(100) NOT NULL,
    release_date DATE NOT NULL,
    released_amount DOUBLE PRECISION NOT NULL,
    disbursed_by VARCHAR(150),
    pfms_reference VARCHAR(100),
    remarks VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_fund_releases_project_id ON fund_releases(project_id);

-- 10. Expenditures Table
CREATE TABLE IF NOT EXISTS expenditures (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    voucher_number VARCHAR(100) NOT NULL,
    expenditure_date DATE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    component_name VARCHAR(150),
    vendor_name VARCHAR(150),
    utilization_certificate_number VARCHAR(100),
    remarks VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_expenditures_project_id ON expenditures(project_id);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    payment_reference VARCHAR(100) UNIQUE NOT NULL,
    payment_date DATE NOT NULL,
    amount DOUBLE PRECISION NOT NULL,
    payee_name VARCHAR(150) NOT NULL,
    payment_mode VARCHAR(50) DEFAULT 'PFMS',
    payment_status VARCHAR(50) NOT NULL DEFAULT 'SUCCESS',
    beneficiary_account VARCHAR(50),
    remarks VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_ref ON payments(payment_reference);

-- 12. Project Progress Logs Table
CREATE TABLE IF NOT EXISTS project_progress_logs (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    reporting_date DATE NOT NULL,
    physical_progress_percent INTEGER NOT NULL,
    financial_progress_percent DOUBLE PRECISION NOT NULL,
    stage_description VARCHAR(300),
    inspection_notes TEXT,
    reported_by VARCHAR(150),
    delay_days INTEGER DEFAULT 0,
    is_delayed BOOLEAN DEFAULT FALSE,
    delay_reason VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_progress_project_id ON project_progress_logs(project_id);

-- 13. Documents Table
CREATE TABLE IF NOT EXISTS documents (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    uploaded_by VARCHAR(150),
    uploaded_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);

-- 14. Risk Alerts Table
CREATE TABLE IF NOT EXISTS risk_alerts (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    alert_type VARCHAR(100) NOT NULL,
    severity VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_rule VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'OPEN',
    detected_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITHOUT TIME ZONE,
    resolved_by VARCHAR(150)
);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_project_id ON risk_alerts(project_id);
CREATE INDEX IF NOT EXISTS idx_risk_alerts_status ON risk_alerts(status);

-- 15. Investigations Table
CREATE TABLE IF NOT EXISTS investigations (
    id BIGSERIAL PRIMARY KEY,
    project_id BIGINT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    risk_alert_id BIGINT REFERENCES risk_alerts(id) ON DELETE SET NULL,
    case_number VARCHAR(100) UNIQUE NOT NULL,
    investigator_name VARCHAR(150),
    status VARCHAR(50) NOT NULL DEFAULT 'ASSIGNED',
    priority VARCHAR(50) DEFAULT 'HIGH',
    assigned_date DATE,
    completion_date DATE,
    findings_summary TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_investigations_project_id ON investigations(project_id);

-- 16. Investigation Notes Table
CREATE TABLE IF NOT EXISTS investigation_notes (
    id BIGSERIAL PRIMARY KEY,
    investigation_id BIGINT NOT NULL REFERENCES investigations(id) ON DELETE CASCADE,
    author_name VARCHAR(150) NOT NULL,
    author_role VARCHAR(50),
    note_text TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notes_investigation_id ON investigation_notes(investigation_id);

-- 17. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    performed_by VARCHAR(150) NOT NULL,
    user_role VARCHAR(50),
    details VARCHAR(1000),
    ip_address VARCHAR(50),
    status VARCHAR(30) DEFAULT 'SUCCESS',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON audit_logs(performed_by);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created_at ON audit_logs(created_at);

-- 18. Data Import Records Table
CREATE TABLE IF NOT EXISTS data_import_records (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    uploaded_by VARCHAR(150),
    total_records INTEGER,
    valid_records INTEGER,
    invalid_records INTEGER,
    duplicate_records INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
