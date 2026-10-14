# 🇮🇳 NIDHINETRA

### See the Risk. Track the Progress. Strengthen Accountability.

**An AI-powered public fund intelligence and project monitoring platform for MPLADS.**

NIDHINETRA aims to enhance transparency and accountability in public development projects through centralized monitoring, fund utilization analytics, role-based dashboards, geographic visualization, and AI-assisted risk intelligence.

## 🌐 Live Demo

**Explore NIDHINETRA:** [https://nidhinetra-platform.vercel.app/](https://nidhinetra-platform.vercel.app/)

## ✨ Key Features

- **Role-Based Dashboards** — Dedicated dashboards for Ministry Admin, State Nodal Officer, District Authority, and Member of Parliament.
- **Fund Utilization Analytics** — Monitor financial indicators, expenditure, and fund utilization.
- **Project Lifecycle Monitoring** — Track project progress, implementation status, and administrative approvals.
- **AI-Assisted Risk Intelligence** — Identify potentially unusual patterns and projects requiring further investigation.
- **Geographic Project Visualization** — Explore project locations and distribution through map-based interfaces.
- **Centralized Data Management** — Organize structured project and financial information using PostgreSQL.
- **Secure Authentication** — Support authenticated access and role-based authorization through the backend.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React / Vite | Frontend development |
| Python | AI service and analytical processing |
| PyTorch | Deep learning and AI model development |
| PostgreSQL | Relational database |
| Git & GitHub | Version control and collaboration |
| Vercel | Frontend deployment |

## 🏗️ System Architecture

```text
               ┌──────────────────────┐
               │        Users         │
               │   Four Access Roles  │
               └──────────┬───────────┘
                          │
               ┌──────────▼───────────┐
               │       Frontend       │
               │  Interactive Portal  │
               └──────────┬───────────┘
                          │
               ┌──────────▼───────────┐
               │       Backend        │
               │ Auth & Business Logic│
               └──────┬─────────┬─────┘
                      │         │
            ┌─────────▼───┐  ┌──▼───────────┐
            │ PostgreSQL  │  │  AI Service  │
            │  Database   │  │ PyTorch / AI │
            └─────────────┘  └──────────────┘
```

## 📂 Project Structure

```text
MPLAD/
├── frontend/          # Web application
├── backend/           # Backend APIs and business logic
├── ai-service/        # AI and analytical services
├── database/          # Database schema and scripts
├── docs/              # Project documentation
├── .env.example       # Environment variable template
├── README.md
├── run-all.bat        # Windows startup script
├── run-all.sh         # Shell startup script
└── start.ps1          # PowerShell startup script
```

## ☁️ Deployment

- **Frontend:** Vercel
- **Backend:** Compatible application hosting service
- **AI Service:** Python-compatible hosting service
- **Database:** PostgreSQL hosting provider

The frontend, backend, AI service, and database must be configured and connected correctly for all application features to function in production.

## 🔐 Security

- Server-side authorization for protected operations.
- Secure management of database credentials and API keys.
- Environment-based configuration for sensitive values.
- HTTPS for production communication.
- Input validation and controlled database access.
- Human review of AI-generated risk indicators.

## 🔮 Future Scope

- Predictive project delay analysis.
- Advanced financial anomaly detection.
- Automated project monitoring alerts.
- Enhanced geospatial analytics.
- Historical trend analysis and downloadable reports.
- Integration with verified official data sources.

## ⚖️ Disclaimer

NIDHINETRA is a software project intended to support public fund monitoring and development-project analysis. It is not an official Government of India or MoSPI application unless formally authorized.

---

**NIDHINETRA 🇮🇳 — Turning Project Data into Actionable Intelligence.**
