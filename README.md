# NIDHINETRA — AI-Powered MPLADS Monitoring & Decision Support System

**Ministry of Statistics and Programme Implementation (MoSPI), Government of India**

---

## 🏛 Overview

**NIDHINETRA** (निधिनेत्र) is an intelligent, full-stack monitoring and decision support portal designed for transparent governance, real-time tracking, anomaly detection, and statutory compliance for the Member of Parliament Local Area Development Scheme (MPLADS).

The platform operates without containerization or Docker dependencies, using native runtimes for high performance, simplified maintenance, and seamless native cloud or on-premise deployments.

---

## 🏗 Architecture & Technology Stack

The platform consists of three core microservices working collaboratively:

```
                            ┌─────────────────────────────────────────┐
                            │    Web Browser (Citizens & Officials)   │
                            └────────────────────┬────────────────────┘
                                                 │ HTTP / HTTPS
                                                 ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. Frontend Web Portal (Port 3000)                                                               │
│    Framework: Next.js 14 (App Router) • React 18 • TypeScript • Tailwind CSS                    │
│    Features: Institutional GoI Design, Role Dashboards, Leaflet GIS, Recharts Data Viz           │
└────────────────────────────┬─────────────────────────────────────────────────────────────────────┘
                             │ REST API (Bearer JWT)
                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 2. Core Government Backend API (Port 8080)                                                       │
│    Framework: Java 21 LTS • Spring Boot 3.3.4 • Spring Security 6 • Spring Data JPA             │
│    Database: H2 (embedded, zero-config default) / PostgreSQL 16 (production)                    │
│    Documentation: Springdoc OpenAPI / Swagger UI (http://localhost:8080/swagger-ui.html)        │
└────────────────────────────┬─────────────────────────────────────────────────────────────────────┘
                             │ REST / JSON (HTTP)
                             ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ 3. AI / ML Risk & Anomaly Detection Microservice (Port 8000)                                     │
│    Framework: Python 3.11+ • FastAPI • Uvicorn • Pydantic v2 • Scikit-Learn • PyTorch            │
│    Capabilities: Progress vs Expenditure Anomaly Scoring, Isolation Forest, PyTorch Autoencoder, │
│                  Geospatial Duplicate Work Detection, Natural Language Analytics                 │
│    Documentation: OpenAPI Interactive Docs (http://localhost:8000/docs)                          │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 System Prerequisites

Ensure the following runtimes and tools are installed and present in your system `PATH`:

| Technology | Minimum Version | Verified Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Java JDK** | 21 LTS | 21.0.9+ | Spring Boot Backend |
| **Apache Maven** | 3.9+ | 3.9.11+ | Backend Build & Dependency Management |
| **Python** | 3.11+ | 3.13+ | AI Anomaly Detection Service |
| **Node.js** | 18+ or 20+ LTS | 20.x / 24.x | Next.js Frontend Web Application |
| **npm** | 9+ | 10+ / 11+ | Node Package Manager |
| **PostgreSQL** *(Optional)* | 15+ | 16+ | Production Database (H2 used by default in dev) |

---

## ⚡ Quick Start: 1-Command Native Launch

All three services can be launched concurrently using the provided native launch scripts:

### Windows (PowerShell)
```powershell
.\start.ps1
```

### Windows (Command Prompt)
```cmd
run-all.bat
```

### Linux / macOS / WSL
```bash
chmod +x run-all.sh
./run-all.sh
```

These scripts launch each service natively in its respective runtime and automatically open the web portal at `http://localhost:3000`.

---

## 🚀 Running Services Individually (Native Development)

### 1. Python AI Microservice (Port 8000)

```bash
cd ai-service

# Create and activate a Python virtual environment (recommended)
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server with auto-reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

- **API Endpoint**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

---

### 2. Spring Boot Backend (Port 8080)

```bash
cd backend

# Option A: Run directly with Maven Spring Boot plugin (Development mode with H2 database)
mvn spring-boot:run

# Option B: Build executable JAR and run natively
mvn clean package -DskipTests
java -jar target/monitoring-1.0.0.jar
```

- **API Base URL**: `http://localhost:8080`
- **Swagger UI**: `http://localhost:8080/swagger-ui.html`
- **OpenAPI Schema**: `http://localhost:8080/v3/api-docs`
- **H2 Console** *(dev profile)*: `http://localhost:8080/h2-console`
  - JDBC URL: `jdbc:h2:mem:mpladsdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE;MODE=PostgreSQL`
  - User: `sa`
  - Password: *(blank)*

---

### 3. Next.js Frontend Portal (Port 3000)

```bash
cd frontend

# Install package dependencies
npm install

# Start development server with hot-reload
npm run dev

# Or build and run production server
npm run build
npm start
```

- **Web Portal**: `http://localhost:3000`
- **Login Page**: `http://localhost:3000/login`
- **Public Insights**: `http://localhost:3000/insights`
- **GIS Map**: `http://localhost:3000/map`

---

## 🗄 Database Configuration

### Development Profile (`dev` - Default)
The backend defaults to the `dev` Spring profile. In this mode:
- An in-memory **H2 database** runs in PostgreSQL compatibility mode.
- Schema tables are created automatically.
- Sample production-grade seed data (users, Indian states, districts, constituencies, projects, inspection milestones, and risk alerts) is loaded via `DataInitializer.java`.
- **Zero database installation or setup is required** to run and evaluate the application.

### Production Profile (`prod` - PostgreSQL)
To connect to an external PostgreSQL database:
1. Ensure PostgreSQL is running on your server or local machine.
2. Initialize the schema and seed data using native `psql`:
   ```bash
   psql -U postgres -d mplads_db -f database/schema.sql
   psql -U postgres -d mplads_db -f database/seed.sql
   ```
3. Set the environment variables before starting the backend:
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   export DATABASE_URL=jdbc:postgresql://localhost:5432/mplads_db
   export DATABASE_USERNAME=postgres
   export DATABASE_PASSWORD=your_password
   ```

---

## 🔐 Role-Based Access Control (RBAC) & Test Accounts

The platform pre-seeds test credentials across all 6 statutory stakeholder roles:

| Role Identifier | Description | Email | Password |
| :--- | :--- | :--- | :--- |
| `ROLE_MINISTRY_ADMIN` | MoSPI Ministry Administrator | `ministry.admin@gov.in` | `Admin@123456` |
| `ROLE_STATE_NODAL_AUTHORITY` | State Planning Department Official | `sna.maharashtra@gov.in` | `State@123456` |
| `ROLE_DISTRICT_AUTHORITY` | District Collector / Magistrate | `collector.pune@gov.in` | `District@123456` |
| `ROLE_MEMBER_OF_PARLIAMENT` | Lok Sabha / Rajya Sabha MP | `mp.pune@sansad.nic.in` | `Member@123456` |
| `ROLE_IMPLEMENTING_AGENCY` | PWD / CPWD / Municipal Engineer | `agency.pwd@gov.in` | `Agency@123456` |
| `ROLE_CITIZEN` | Public Citizen / Auditor | `citizen.audit@gmail.com` | `Citizen@123456` |

---

## 🌐 Production Deployment Guide (Without Docker)

### Frontend Deployment (Vercel, Netlify, or PM2)

#### Deploy to Vercel
1. Set the root directory to `frontend` or use the repository root with `.vercelignore`.
2. Configure the environment variable:
   - `NEXT_PUBLIC_API_URL`: URL of your deployed Spring Boot backend (e.g. `https://api.nidhinetra.gov.in`).
3. Deploy directly via Vercel CLI or Git integration:
   ```bash
   cd frontend
   vercel --prod
   ```

#### Deploy to Linux VPS using PM2
```bash
cd frontend
npm install --production=false
npm run build
npm install -g pm2
pm2 start npm --name "nidhinetra-frontend" -- start -- -p 3000
pm2 save
```

---

### Backend Deployment (Linux Systemd / Executable JAR)

1. Build the production executable JAR:
   ```bash
   cd backend
   mvn clean package -DskipTests
   ```
2. Copy `target/monitoring-1.0.0.jar` to your production server (e.g., `/opt/nidhinetra/backend/monitoring.jar`).
3. Create a systemd service file `/etc/systemd/system/nidhinetra-backend.service`:
   ```ini
   [Unit]
   Description=NIDHINETRA Spring Boot Backend Service
   After=network.target postgresql.service

   [Service]
   User=nidhinetra
   WorkingDirectory=/opt/nidhinetra/backend
   Environment="PORT=8080"
   Environment="SPRING_PROFILES_ACTIVE=prod"
   Environment="DATABASE_URL=jdbc:postgresql://localhost:5432/mplads_db"
   Environment="DATABASE_USERNAME=postgres"
   Environment="DATABASE_PASSWORD=your_secure_password"
   Environment="AI_SERVICE_URL=http://localhost:8000"
   Environment="JWT_SECRET=your_256_bit_secret_key"
   ExecStart=/usr/bin/java -Xms512m -Xmx2048m -jar /opt/nidhinetra/backend/monitoring.jar
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
4. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable nidhinetra-backend
   sudo systemctl start nidhinetra-backend
   ```

---

### AI Microservice Deployment (Systemd + Uvicorn / Gunicorn)

1. Set up the Python virtual environment on the production server:
   ```bash
   cd /opt/nidhinetra/ai-service
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   pip install gunicorn
   ```
2. Create a systemd service file `/etc/systemd/system/nidhinetra-ai.service`:
   ```ini
   [Unit]
   Description=NIDHINETRA AI Risk Telemetry Microservice
   After=network.target

   [Service]
   User=nidhinetra
   WorkingDirectory=/opt/nidhinetra/ai-service
   Environment="PATH=/opt/nidhinetra/ai-service/venv/bin"
   Environment="PORT=8000"
   ExecStart=/opt/nidhinetra/ai-service/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   ```
3. Enable and start the service:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable nidhinetra-ai
   sudo systemctl start nidhinetra-ai
   ```

---

## ⚙️ Environment Variables Reference

| Variable | Service | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend | `8080` | Port for Spring Boot REST API |
| `SPRING_PROFILES_ACTIVE` | Backend | `dev` | Active Spring profile (`dev` or `prod`) |
| `DATABASE_URL` | Backend (`prod`) | `jdbc:postgresql://localhost:5432/mplads_db` | PostgreSQL JDBC connection URL |
| `DATABASE_USERNAME` | Backend (`prod`) | `postgres` | PostgreSQL username |
| `DATABASE_PASSWORD` | Backend (`prod`) | `postgres` | PostgreSQL password |
| `JWT_SECRET` | Backend | `9a7f8e6d5c4b3a210987654...` | HMAC-SHA256 signing key (min 256 bits) |
| `JWT_EXPIRATION_MS` | Backend | `86400000` | JWT expiration duration in milliseconds (24 hrs) |
| `AI_SERVICE_URL` | Backend | `http://localhost:8000` | Base URL of Python AI microservice |
| `PORT` | AI Service | `8000` | Port for FastAPI / Uvicorn server |
| `HOST` | AI Service | `0.0.0.0` | Bind host for FastAPI server |
| `NEXT_PUBLIC_API_URL` | Frontend | `http://localhost:8080` | Backend API base URL accessible from browser |

---

## 🧪 Testing & Validation

### Run Frontend Verification
```bash
cd frontend
npm run lint
npm run build
```

### Run Backend Verification
```bash
cd backend
mvn test
```

### Run AI Microservice Test Suite
```bash
cd ai-service
pytest tests/ -v
```

---

## 📜 License & Attribution

Developed under the guidance and specifications of the Ministry of Statistics and Programme Implementation (MoSPI), Government of India.
Designed for national public transparency and administrative efficiency.
