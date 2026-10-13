# NIDHINETRA — MPLADS AI-Powered Monitoring & Decision Support Portal

**Ministry of Statistics & Programme Implementation (MoSPI), Government of India**

---

## 🏛 Executive Overview

The **MPLADS AI-Powered Monitoring and Decision Support Portal** is a production-grade digital oversight and decision-support platform built for the **Ministry of Statistics & Programme Implementation (MoSPI)** to govern the **Member of Parliament Local Area Development Scheme (MPLADS)**.

Under MPLADS, each Hon'ble Member of Parliament has the statutory entitlement to recommend developmental works of **₹5.00 Crore per annum** focused on creating durable community assets (drinking water, smart classrooms, public health centers, rural roads, community halls, and renewable solar lighting).

This platform combines real-time financial telemetry, geo-spatial progress tracking, and **explainable AI/ML risk anomaly identification** to detect:
- **Progress vs Expenditure Mismatches** (disproportionate disbursements preceding certified physical execution milestones)
- **Potential Cost Anomalies** (deviations against sectoral regional unit cost benchmarks)
- **Milestone Delays & Overdue Trajectories** (`ON_TRACK`, `AT_RISK`, `DELAYED`, `SEVERELY_DELAYED`)
- **Potential Payment Anomalies** (high-value lump-sum advances or payment clustering)
- **Potential Duplicate Works** (TF-IDF semantic vector similarity across candidate projects)

> **Important Statutory Notice**: An AI anomaly is a decision-support indicator requiring human review, NOT proof of fraud. The system uses strict statutory terminology (*"Potential Anomaly"*, *"Risk Indicator"*, *"Requires Review"*, *"Potential Duplicate"*, *"Potential Cost Anomaly"*).

---

## 🏗 Full System Architecture

```
                      ┌───────────────────────────────────────────┐
                      │    Public Website & Transparency Portal   │
                      │       (/, /about, /insights, /map)        │
                      └─────────────────────┬─────────────────────┘
                                            │
                      ┌─────────────────────▼─────────────────────┐
                      │    Next.js 14 Web Portal (Gov Identity)   │
                      │  • /alerts & /alerts/[id] Investigation   │
                      │  • /ai-monitoring Decision Support        │
                      │  • /projects/[id] (Tab 6 AI Analysis)     │
                      │  • Role 1 (Ministry) & Role 2 (State)     │
                      │  • Role 3 (District) & Role 4 (MP)        │
                      └─────────────────────┬─────────────────────┘
                                            │ HTTP / REST (JWT 256-Bit)
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │  Spring Boot Backend & Resilience Layer   │
                      │  • AlertController & AiMonitoringController│
                      │  • AiClientService (FastAPI HTTP Client)  │
                      │  • Dual-Mode Embedded Fallback Engine     │
                      │  • PostgreSQL / H2 (RiskAlert, AuditLog)  │
                      └─────────────────────┬─────────────────────┘
                                            │ REST API (:8000)
                                            ▼
                      ┌───────────────────────────────────────────┐
                      │    Python FastAPI AI Microservice         │
                      │  • Isolation Forest Unsupervised Model    │
                      │  • Sectoral Benchmark Cost Comparator     │
                      │  • Progress vs Expenditure Gap Analyzer   │
                      │  • Milestone Delay Classifier             │
                      │  • Payment Concentration Detector         │
                      │  • TF-IDF & Cosine Text Duplicate Engine   │
                      └───────────────────────────────────────────┘
```

---

## 📁 Repository Structure

```
mplads-monitoring/
├── frontend/                # Next.js 14 App Router, React 18, TypeScript, Tailwind CSS, Recharts, Leaflet
│   ├── src/app/             # 29 Dynamic & Static Routes (Dashboards, Alerts, AI Monitoring, Reports, GIS Map)
│   ├── src/components/      # UI Design System (Gov Topbar, Sidebar, Emblem, KPI Cards, Modal, Badges, Charts)
│   ├── src/services/        # Typed API Clients (project, alert, aiMonitoring, admin, report, location)
│   └── .env.example         # Frontend Environment Variables
├── backend/                 # Java 21, Spring Boot 3.3.4, Spring Security 6 (JWT + BCrypt), Spring Data JPA
│   ├── src/main/java/       # Controllers, Entities, Repositories, Services, DTOs, Security, DataInitializer
│   ├── src/main/resources/  # application.yml, application-prod.yml, application-dev.yml
│   └── .env.example         # Backend Environment Variables
├── ai-service/              # Python 3.11+, FastAPI, Scikit-Learn, Pandas, NumPy
│   ├── pipeline/            # Isolation Forest & Diagnostic Anomaly Detection Pipeline
│   ├── schemas/             # Pydantic Request/Response Models
│   ├── main.py              # FastAPI Microservice Entrypoint
│   └── requirements.txt     # Python Dependencies
├── database/                # PostgreSQL 16 DDL Schema, Seed SQL & Docker Compose
└── README.md                # Master Documentation & Operation Manual
```

---

## 🛡️ Role-Based Access Control (RBAC) Matrix

| User Role | Jurisdiction / Scope | Primary Responsibilities |
| :--- | :--- | :--- |
| **`ROLE_MINISTRY_ADMIN`** | Central Ministry (National - All States & UTs) | National fund envelope oversight, policy compliance, nationwide AI anomaly queue review, user management, and system audit trail inspection. |
| **`ROLE_STATE_NODAL_AUTHORITY`** | State Planning Department (e.g. Maharashtra) | State-wide district performance leaderboard, inter-district fund allocation, delayed works escalation, and district oversight. |
| **`ROLE_DISTRICT_AUTHORITY`** | District Collectorate (e.g. Pune) | MP recommendation scrutiny, Administrative Sanctions (AS), work order tenders, site milestone certifications, bill approvals, and alert investigations. |
| **`ROLE_MP`** | Parliamentary Constituency (Lok Sabha / Rajya Sabha) | Recommending developmental works, tracking ₹5 Cr annual entitlement utilization, reviewing community asset delivery, and examining AI monitoring insights. |

---

## 🔑 Development Seed User Credentials

| Role | Email Address | Password | Jurisdiction Scope |
| :--- | :--- | :--- | :--- |
| **Ministry Admin** | `ministry.admin@gov.in` | `Admin@123456` | National Central MoSPI |
| **State Nodal Authority** | `state.mh@gov.in` | `State@123456` | Maharashtra State Nodal |
| **District Authority** | `district.pune@gov.in` | `District@123456` | Pune District Collectorate |
| **Member of Parliament** | `mp.pune@sansad.nic.in` | `Mp@123456` | Pune Parliamentary Constituency (Lok Sabha) |

> 💡 *Tip: The web login page includes a **"Quick Evaluation Logins" (1-Click)** widget to instantly log into each of the 4 roles.*

---

## 💻 Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Architecture**: React 18, TypeScript, Tailwind CSS
- **Visual Design**: Official Government of India Institutional Design System (Navy primary `#0A2540`, tricolor accents, GIGW 3.0 accessibility standards, font resizing, high-contrast mode)
- **Visualizations**: Recharts (Bar, Donut/Pie, Multi-year Area trends, Sectoral distribution)
- **GIS Engine**: Leaflet & React-Leaflet with OpenStreetMap tiles
- **Icons**: Lucide React

### Backend
- **Language & Runtime**: Java 21 LTS
- **Framework**: Spring Boot 3.3.4
- **Security**: Spring Security 6, Stateless JWT (`io.jsonwebtoken 0.12.6`), BCrypt Hashing
- **Data Persistence**: Spring Data JPA / Hibernate 6, PostgreSQL 16 Driver (+ H2 zero-setup dev fallback)
- **Validation**: Jakarta Bean Validation (Hibernate Validator)
- **Documentation**: SpringDoc OpenAPI 3 / Swagger UI

### AI Microservice
- **Framework**: Python 3.11+, FastAPI, Uvicorn
- **ML & Analytics**: Scikit-Learn (`IsolationForest`, `TfidfVectorizer`, `cosine_similarity`), Pandas, NumPy

---

## 🐳 1-Command Docker Deployment (Recommended)

Run the entire platform (PostgreSQL, Python AI Service, Spring Boot Backend, and Next.js Frontend) in **one command**:

```bash
docker compose up --build
```
*(or run `docker-start.bat` on Windows or `./docker-start.sh` on Linux/macOS)*

Once started, open:
- **Frontend Portal**: [http://localhost:3000](http://localhost:3000)
- **Backend Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **AI Microservice Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **PostgreSQL Database**: `localhost:5432` (`db: mplads_db`)

See [DOCKER.md](DOCKER.md) for full commands, logs, volume resets, and container management.

---

## 🚀 Manual Step-by-Step Quickstart Guide (Without Docker)

### 1. AI Service Startup (Python FastAPI)

Open a terminal and navigate to `ai-service/`:
```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*Health Check*: Open `http://localhost:8000/health` in your browser.

### 2. Backend Startup (Spring Boot)

Open a second terminal and navigate to `backend/`:
```bash
cd backend
mvn spring-boot:run
```
*Swagger UI*: Open `http://localhost:8080/swagger-ui.html` in your browser.

### 3. Frontend Startup (Next.js)

Open a third terminal and navigate to `frontend/`:
```bash
cd frontend
npm install
npm run dev
```
*Portal Access*: Open `http://localhost:3000` in your browser.

---

## 🎯 Complete End-to-End Evaluation Flow

To evaluate the complete end-to-end monitoring and AI investigation lifecycle:

1. **Public Homepage (`/`)**: Browse national impact metrics, category allotments, and GFR statutory guidelines.
2. **Public Insights (`/insights`)**: Examine transparent fund utilization trends and state performance heatmaps.
3. **Login (`/login`)**: Click **"Ministry Administrator"** in the 1-Click Evaluation box.
4. **National Command Center (`/ministry/dashboard`)**: Inspect national KPIs, state distributions, and the live AI Anomaly Telemetry panel.
5. **AI Risk Monitoring Center (`/ai-monitoring`)**:
   - Inspect the Risk Distribution donut (Low / Medium / High / Critical).
   - Review the **"Why Was This Project Flagged?"** explainability diagnostic panel.
6. **Project Master Dossier (`/projects/[id]`)**:
   - Navigate to Tab 6 (**AI Analysis**).
   - Review Progress vs Expenditure mismatch variance and sectoral cost benchmarks.
   - Click **"Run Analysis Again"** to trigger a real-time re-scoring request.
7. **Risk Alerts & Investigation (`/alerts`)**:
   - Filter by severity (`HIGH`/`CRITICAL`) and status (`NEW`).
   - Click **"Investigate Dossier"** to open `/alerts/[id]`.
8. **Statutory Investigation Dossier (`/alerts/[id]`)**:
   - Review answers to the 6 statutory questions (*What happened? Why was it flagged? How severe is it? What data supports it? Who reviews it? Current status?*).
   - Assign an investigator, add an official investigation note, and update status (`UNDER_REVIEW` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED`).
9. **Role Switch - State Nodal Authority (`/state/dashboard`)**:
   - Log in as `state.mh@gov.in`.
   - Verify state-only jurisdiction badge (*"State Scope: Maharashtra"*), state overview charts, and district monitoring table.
10. **Role Switch - District Authority (`/district/dashboard`)**:
    - Log in as `district.pune@gov.in`.
    - Verify district-scoped project queue, physical vs financial progress comparisons, and milestone certifications.
11. **Role Switch - Member of Parliament (`/mp/dashboard`)**:
    - Log in as `mp.pune@sansad.nic.in`.
    - Review constituency-focused metrics, "Projects Requiring Attention" AI insights panel, and statutory report downloads.
12. **GIS Spatial Map (`/map`)**:
    - Filter by state, district, status, or risk severity.
    - Click on any geotagged asset marker to inspect project telemetry.
13. **Statutory Reports (`/reports`)**:
    - Generate report previews for Project Summary, Fund Utilization, Expenditure, Progress, Delayed Works, or Risk Alerts.
    - Click **"Export CSV Spreadsheet"** or **"Print Report"** to download official statements.
14. **User Governance (`/admin/users`) & Audit Trail (`/admin/audit-logs`)**:
    - Inspect personnel directory, clearance controls, and timestamped security audit logs.

---

## 📡 Key REST API Endpoints

### Authentication & User Management
- `POST /api/auth/login`: Authenticate and receive JWT token.
- `POST /api/auth/register`: Register new authorized official.
- `GET /api/auth/me`: Retrieve authenticated user profile and jurisdiction.
- `GET /api/admin/users`: Paginated personnel directory (*Ministry Admin only*).
- `PUT /api/admin/users/{id}/approve`: Toggle clearance approval status.

### Projects & GIS Telemetry
- `GET /api/projects`: Paginated and role-filtered project registry.
- `GET /api/projects/{id}`: Detailed project master dossier.
- `GET /api/map/projects`: Geotagged project spatial coordinates.
- `GET /api/locations/states`: All states and UTs.
- `GET /api/locations/states/{id}/districts`: Districts within a state.

### AI Risk & Anomaly Detection
- `GET /api/ai/summary`: Aggregated multivariate anomaly telemetry.
- `POST /api/ai/analyze-project/{id}`: On-demand AI risk scoring and explainability factors.
- `POST /api/ai/detect-duplicates`: TF-IDF duplicate screening across candidate works.
- `GET /api/ai/health`: Microservice connectivity status.

### Risk Alerts & Investigation Workflow
- `GET /api/alerts`: Paginated risk alerts with severity, status, and jurisdiction filters.
- `GET /api/alerts/{id}`: Single risk alert dossier with 6-question investigation breakdown.
- `PUT /api/alerts/{id}/status`: Transition alert status (`NEW` $\rightarrow$ `UNDER_REVIEW` $\rightarrow$ `INVESTIGATING` $\rightarrow$ `RESOLVED` / `DISMISSED`).
- `PUT /api/alerts/{id}/assign`: Assign alert case to designated authority.
- `POST /api/alerts/{id}/notes`: Add timestamped investigation note.
- `POST /api/alerts/{id}/escalate`: Escalate alert with priority and rationale.

### Reports & Audit Logs
- `GET /api/reports/preview`: Generate standardized report matrix and summary aggregates.
- `GET /api/dashboard/audit-logs`: Immutable system activity ledger.

---

## 🛠 Troubleshooting & FAQ

- **Backend fails to connect to AI Service**: The Spring Boot backend includes an embedded fallback engine. If the FastAPI microservice on port `8000` is offline, the backend seamlessly calculates deterministic risk scores matching the feature weights.
- **H2 vs PostgreSQL**: By default, `SPRING_PROFILES_ACTIVE=dev` boots with in-memory H2. To connect to PostgreSQL, set `SPRING_PROFILES_ACTIVE=prod` and configure `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`.
- **CORS or JWT Errors**: Verify that `NEXT_PUBLIC_API_URL` in `frontend/.env.local` points to `http://localhost:8080`.

