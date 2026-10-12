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
