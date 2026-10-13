# 🐳 NIDHINETRA — 1-Command Docker Deployment Guide

Run the entire **NIDHINETRA** platform (Database, AI Service, Spring Boot Backend, and Next.js Frontend) using **a single command**.

---

## ⚡ Quick Start (1 Command)

From the project root directory, run:

```bash
docker compose up --build
```

*(or `docker-compose up --build` on older Docker versions)*

To run in the background (detached mode):
```bash
docker compose up --build -d
```

### 1-Click Launchers
- **Windows**: Double-click [`docker-start.bat`](file:///c:/Users/divya/OneDrive/Desktop/Projects/MPLAD/docker-start.bat)
- **Linux / macOS / WSL**: Run [`./docker-start.sh`](file:///c:/Users/divya/OneDrive/Desktop/Projects/MPLAD/docker-start.sh)

---

## 🌐 Deployed Services & Ports

Once running, all four services are automatically networked and reachable at:

| Service | Container Name | Port | Description & Health Check | URL / Access Point |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Portal** | `nidhinetra-frontend` | `3000` | Next.js 14 App Router, responsive dashboard & UI | [http://localhost:3000](http://localhost:3000) |
| **Core Backend** | `nidhinetra-backend` | `8080` | Spring Boot 3.3.4, Java 21 LTS REST API & Swagger UI | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) |
| **AI / ML Service** | `nidhinetra-ai-service` | `8000` | FastAPI, IsolationForest ML pipeline & Swagger docs | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **PostgreSQL Database** | `nidhinetra-postgres` | `5432` | PostgreSQL 16 with preloaded schema & seed data | `localhost:5432` (`db: mplads_db`) |

---

## 🏗 Architecture & Container Startup Flow

```
[ docker compose up --build ]
         │
         ├── 1. nidhinetra-postgres (PostgreSQL 16)
         │      └─ Runs schema.sql and seed.sql
         │      └─ Healthcheck: pg_isready
         │
         ├── 2. nidhinetra-ai-service (Python 3.11 / FastAPI)
         │      └─ Loads IsolationForest model & TF-IDF
         │      └─ Healthcheck: curl http://localhost:8000/health
         │
         ├── 3. nidhinetra-backend (Java 21 / Spring Boot 3.3.4)
         │      └─ Waits for postgres & ai-service to become healthy
         │      └─ Connects to PostgreSQL & AI microservice
         │      └─ Healthcheck: curl http://localhost:8080/v3/api-docs
         │
         └── 4. nidhinetra-frontend (Next.js 14 / Node 20)
                └─ Waits for backend to become healthy
                └─ Serves responsive monitoring application
```

---

## 🔑 Demo Stakeholder Accounts (Pre-seeded)

You can immediately test any role with 1 click on the login screen or using these credentials:

| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Ministry Admin** | `admin.mospi@nic.in` | `Admin@123` | National Scope / Full Administrative Control |
| **State Nodal Authority** | `nodal.maharashtra@gov.in` | `State@123` | State-level (Maharashtra) Scoped Monitoring |
| **District Authority** | `collector.pune@gov.in` | `District@123` | District-level (Pune) Work Verification & Approval |
| **Hon'ble MP** | `mp.pune@sansad.nic.in` | `Mp@123` | MP Constituency Work Recommendations |

---

## 🛠 Useful Docker Commands

### View Live Logs
```bash
# All containers:
docker compose logs -f

# Specific container:
docker compose logs -f backend
docker compose logs -f ai-service
docker compose logs -f frontend
docker compose logs -f postgres
```

### Check Container Status & Health
```bash
docker compose ps
```

### Stop All Containers
```bash
docker compose down
```

### Reset Database Volume & Restart Fresh
```bash
docker compose down -v
docker compose up --build -d
```

### Execute a Shell Inside a Running Container
```bash
# PostgreSQL CLI:
docker exec -it nidhinetra-postgres psql -U postgres -d mplads_db

# Backend container:
docker exec -it nidhinetra-backend sh

# AI service container:
docker exec -it nidhinetra-ai-service sh
```

---

## ⚙️ Environment Overrides

If you want to customize ports or passwords, create a `.env` file in the root directory (or edit `.env.example`):

```bash
POSTGRES_PORT=5432
POSTGRES_DB=mplads_db
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

BACKEND_PORT=8080
AI_SERVICE_PORT=8000
FRONTEND_PORT=3000

NEXT_PUBLIC_API_URL=http://localhost:8080
```
