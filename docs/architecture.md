# MPLADS Monitoring & Decision Support System Architecture

**Ministry of Statistics & Programme Implementation (MoSPI), Government of India**

---

## 🏛 1. High-Level Architectural Overview

```
                          ┌────────────────────────────────────────────────────────┐
                          │         Citizen & Official Web Browser (Clients)        │
                          └──────────────────────────┬─────────────────────────────┘
                                                     │ HTTP/HTTPS (Next.js SSR/CSR)
                                                     ▼
                          ┌────────────────────────────────────────────────────────┐
                          │             Frontend Layer (Next.js 14 / TS)            │
                          │   • GoI Institutional Design System (Tailwind CSS)     │
                          │   • Public Portal (Home, About MPLADS, Insights)       │
                          │   • Role-Based Dashboards (Ministry, State, District,  │
                          │     MP)                                                │
                          │   • Leaflet GIS / Recharts Visualizations              │
                          └──────────────────────────┬─────────────────────────────┘
                                                     │ JSON REST API / Bearer JWT
                                                     ▼
                          ┌────────────────────────────────────────────────────────┐
                          │        Backend API Gateway & Core Service Layer        │
                          │        (Java 21 / Spring Boot 3 / Spring Security 6)   │
                          │   • JWT Auth Filter & BCrypt Password Hashing          │
                          │   • Role-Based Access Control (@PreAuthorize / URL)    │
                          │   • Administrative Boundary Enforcement                │
                          │   • Audit Logging Engine                               │
                          │   • Spring Data JPA ORM & Liquibase/DDL                │
                          └─────────────┬───────────────────────────┬──────────────┘
                                        │                           │
                   JPA / JDBC SQL       │                           │ HTTP/gRPC (Phase 2)
                                        ▼                           ▼
        ┌───────────────────────────────────────┐   ┌───────────────────────────────────────┐
        │       PostgreSQL 16 Database          │   │      AI & Analytics Engine            │
        │   • Users, Roles, Audit Logs          │   │      (FastAPI / Scikit-learn / Pandas)│
        │   • States, Districts, Constituencies │   │   • Expenditure vs Progress Anomaly   │
        │   • MPLADS Project & Milestone Records│   │   • Spatial Duplicate Work Detection  │
        └───────────────────────────────────────┘   │   • Cost Overrun & Delay Forecast     │
                                                    └───────────────────────────────────────┘
```

---

## 🔒 2. Security & Administrative Boundaries
1. **Stateless JWT Tokens**: Issued upon authentication, verified on every request using HMAC-SHA256 signature verification.
2. **Strict RBAC Enforcement**: Backend queries filter records by the authenticated user's state, district, or constituency.
3. **No Privilege Self-Assignment**: Registration API strictly prevents self-assigning `ROLE_MINISTRY_ADMIN`.
4. **Audit Trail**: Every authentication event, registration, and administrative inspection is logged with timestamp, user role, and IP address.
