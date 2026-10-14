# MPLADS Monitoring REST API Reference

**Ministry of Statistics & Programme Implementation (MoSPI), Government of India**
**Base URL**: `http://localhost:8080`
**Interactive Swagger UI**: `http://localhost:8080/swagger-ui.html`
**OpenAPI Specification**: `http://localhost:8080/v3/api-docs`

---

## 🔐 1. Authentication Endpoints

### `POST /api/auth/login`
Authenticates an official user with email and password.
**Request Body**:
```json
{
  "email": "ministry.admin@gov.in",
  "password": "Admin@123456"
}
```
**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Authentication successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "tokenType": "Bearer",
    "expiresInMs": 86400000,
    "user": {
      "id": 1,
      "email": "ministry.admin@gov.in",
      "fullName": "Dr. Rajesh Verma, IAS",
      "role": "ROLE_MINISTRY_ADMIN",
      "organization": "Ministry of Statistics & Programme Implementation",
      "designation": "Joint Secretary (MPLADS)"
    }
  }
}
```

### `POST /api/auth/register`
Registers a new official stakeholder. Self-assignment of `MINISTRY_ADMIN` is prevented.
**Request Body**:
```json
{
  "fullName": "Dr. Ramesh Kumar, IAS",
  "email": "ramesh.kumar@gov.in",
  "mobileNumber": "9812345678",
  "password": "SecurePassword@123",
  "confirmPassword": "SecurePassword@123",
  "role": "DISTRICT_AUTHORITY",
  "stateId": 1,
  "districtId": 1,
  "organization": "District Collectorate Pune",
  "designation": "Additional District Magistrate"
}
```

### `GET /api/auth/me`
*Requires Bearer Token*
Returns currently authenticated user profile.

---

## 🌐 2. Public Insights Endpoints

### `GET /api/public/insights/summary`
Returns macro-level monitoring KPIs (sanctioned amounts, expenditure, project status breakdown, risk indicators).

### `GET /api/public/insights/states`
Returns state-wise financial allocation, expenditure, and active project counts.

### `GET /api/public/insights/categories`
Returns sector-wise distribution (Drinking Water, Education, Healthcare, Roads, Sanitation).

---

## 🗺 3. Location Endpoints

### `GET /api/locations/states`
List of all 15+ Indian States and Union Territories.

### `GET /api/locations/states/{stateId}/districts`
List of all districts in the specified state.

### `GET /api/locations/districts/{districtId}/constituencies`
List of parliamentary constituencies in the specified district.

---

## 📊 4. Role-Based Dashboard Endpoints

### `GET /api/dashboard/stats`
*Requires Bearer Token*
Returns scoped telemetry based on caller's role (National for Ministry Admin, State for SNA, District for DA, PC for MP).

### `GET /api/dashboard/audit-logs`
*Requires Bearer Token (`ROLE_MINISTRY_ADMIN`)*
Returns system-wide audit event logs with pagination.

---

## 🩺 5. Health & Diagnostic Endpoints

### `GET /api/health`
*Requires Bearer Token*
Validates system operational status and authenticated user identity.

---

## 🏛 6. MoSPI Official Telemetry & Background Cache (Feature 1)

### `GET /api/official-mplads/summary`
Returns cached official MoSPI aggregate metrics in < 100ms with data freshness timestamps and source availability indicators.

### `GET /api/official-mplads/states`
Returns cached state-wise sanctioned and completed works from official MoSPI portal.

### `POST /api/official-mplads/refresh`
*Requires `ROLE_MINISTRY_ADMIN`*
Triggers an immediate asynchronous background sync of official MoSPI telemetry.

---

## 📋 7. AI Collector Inspection Queue (Feature 5)

### `GET /api/collector/inspections/queue`
*Requires `ROLE_DISTRICT_AUTHORITY`, `ROLE_STATE_NODAL_AUTHORITY`, or `ROLE_MINISTRY_ADMIN`*
Returns AI-prioritized project queue for inspection, ranked by composite risk score, fund utilization mismatch, and delay days.
**Query Parameters**: `districtId`, `status`, `page`, `size`.

### `GET /api/collector/inspections/weekly-summary`
Returns weekly inspection compliance KPIs, completed inspections, turnaround days, and outcome distribution.
**Query Parameters**: `districtId`.

### `POST /api/collector/inspections/assign`
*Requires `ROLE_DISTRICT_AUTHORITY` or `ROLE_MINISTRY_ADMIN`*
Issues formal field inspection directive to designated technical officer.
**Request Body**:
```json
{
  "projectId": 42,
  "assignedOfficerName": "Shri V. S. Patil, Executive Engineer",
  "assignedOfficerDesignation": "Executive Engineer (PWD)",
  "deadline": "2026-11-15",
  "remarks": "Verify foundation depth and milestone physical completion against MB page 84"
}
```

### `POST /api/collector/inspections/outcome`
*Requires `ROLE_DISTRICT_AUTHORITY` or `ROLE_MINISTRY_ADMIN`*
Records certified measurement book verification outcome and compliance status.
**Request Body**:
```json
{
  "assignmentId": 12,
  "findingsOutcome": "SATISFACTORY",
  "findingsSummary": "Ground physical progress aligns with 60% disbursement voucher. Quality verified.",
  "recommendedAction": "Approve milestone installment disbursal"
}
```

---

## 📸 8. Geofenced Photo & Measurement Book Verification (Feature 6)

### `POST /api/projects/{id}/verify-photo`
*Requires `ROLE_DISTRICT_AUTHORITY`, `ROLE_STATE_NODAL_AUTHORITY`, or `ROLE_MINISTRY_ADMIN`*
*Consumes: `multipart/form-data`*
Extracts image EXIF coordinates, evaluates Haversine distance against sanctioned project footprint (500m geofence), checks SHA-256 for duplicate image reuse, and records audit trail.
**Form Parts**:
- `file`: Multipart photo file (JPEG, PNG, WebP &bull; max 10MB)
- `latitude`: Claimed latitude (optional)
- `longitude`: Claimed longitude (optional)

### `GET /api/projects/{id}/photo-verifications`
*Requires Authentication*
Lists all historical geofence verification audit outcomes for a project.

---

## 🏢 9. Implementing Agency Reliability Index (Feature 7)

### `GET /api/analytics/agencies`
*Requires Authentication*
Returns implementing agencies and contractors ranked by composite reliability score (0-100) and assigned performance bands (`A+`, `A`, `B`, `C`).

### `GET /api/analytics/agencies/{agencyName}`
*Requires Authentication*
Returns deep-dive indicator contributions (on-time rate, average delay days, budget variance, audit findings) for the designated agency.

---

## 🔔 10. Real-Time Risk Notifications via SSE (Feature 8)

### `GET /api/notifications/stream?token={jwt}`
*Requires Authentication (supports query parameter token for native EventSource)*
Opens persistent Server-Sent Events (SSE) stream for real-time anomaly alerts filtered strictly by caller's jurisdiction.

### `GET /api/notifications`
*Requires Authentication*
Lists unread/historical risk notifications for caller's jurisdiction.

### `PATCH /api/notifications/{id}/read`
*Requires Authentication*
Marks designated notification as read.

---

## 🎛 11. What-If Fund Allocation Simulator (Feature 9)

### `POST /api/simulations/evaluate`
*Requires Authentication*
Evaluates hypothetical budget reallocations across projects, validating mathematical constraints (no negative budgets, cannot drop below incurred expenditure), and projecting beneficiary and timeline delivery shifts.
**Request Body**:
```json
{
  "title": "Drinking Water Priority Shift",
  "scopeType": "DISTRICT",
  "scopeId": 1,
  "adjustments": [
    { "projectId": 1, "adjustmentDeltaLakhs": 25.0 },
    { "projectId": 2, "adjustmentDeltaLakhs": -25.0 }
  ]
}
```

### `POST /api/simulations/save`
*Requires Authentication*
Persists evaluated scenario for administrative discussion and statutory reporting.

### `GET /api/simulations`
*Requires Authentication*
Lists previously saved what-if policy scenarios accessible to the user.

