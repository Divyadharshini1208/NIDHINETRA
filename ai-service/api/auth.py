"""
Authentication & Portal API Gateway for NIDHINETRA
Provides JWT authentication, user session management, and telemetry data
matching the exact schema expected by the Next.js frontend.
"""

import os
import time
import json
import hmac
import hashlib
import base64
from datetime import datetime, timezone
from typing import Optional, Dict, Any, List
from fastapi import APIRouter, HTTPException, Header, Request, status
from pydantic import BaseModel, EmailStr

router = APIRouter()

JWT_SECRET = os.getenv("JWT_SECRET", "9a7f8e6d5c4b3a210987654321fedcba0123456789abcdef0123456789abcdef")
JWT_EXPIRATION_SECONDS = 86400  # 24 hours

# In-memory user store initialized with official pre-seeded demonstration stakeholders
PRESEEDED_USERS = {
    "ministry.admin@gov.in": {
        "password": "Admin@123456",
        "id": 1,
        "email": "ministry.admin@gov.in",
        "fullName": "Dr. Rajesh Verma, IAS",
        "mobileNumber": "9876543210",
        "role": "ROLE_MINISTRY_ADMIN",
        "stateId": None,
        "stateName": None,
        "districtId": None,
        "districtName": None,
        "constituencyId": None,
        "constituencyName": None,
        "organization": "Ministry of Statistics & Programme Implementation",
        "designation": "Joint Secretary (MPLADS)",
        "isActive": True,
        "isApproved": True,
        "accountStatus": "ACTIVE",
        "clearanceStatus": "VERIFIED",
        "createdAt": "2026-01-01T00:00:00",
    },
    "state.mh@gov.in": {
        "password": "State@123456",
        "id": 2,
        "email": "state.mh@gov.in",
        "fullName": "Smt. Ananya Deshmukh",
        "mobileNumber": "9811223344",
        "role": "ROLE_STATE_NODAL_AUTHORITY",
        "stateId": 1,
        "stateName": "Maharashtra",
        "districtId": None,
        "districtName": None,
        "constituencyId": None,
        "constituencyName": None,
        "organization": "Planning Department, Govt of Maharashtra",
        "designation": "State Nodal Officer",
        "isActive": True,
        "isApproved": True,
        "accountStatus": "ACTIVE",
        "clearanceStatus": "VERIFIED",
        "createdAt": "2026-01-01T00:00:00",
    },
    "district.pune@gov.in": {
        "password": "District@123456",
        "id": 3,
        "email": "district.pune@gov.in",
        "fullName": "Dr. Suhas Diwase, IAS",
        "mobileNumber": "9833445566",
        "role": "ROLE_DISTRICT_AUTHORITY",
        "stateId": 1,
        "stateName": "Maharashtra",
        "districtId": 101,
        "districtName": "Pune",
        "constituencyId": None,
        "constituencyName": None,
        "organization": "District Collectorate Pune",
        "designation": "District Magistrate & Collector",
        "isActive": True,
        "isApproved": True,
        "accountStatus": "ACTIVE",
        "clearanceStatus": "VERIFIED",
        "createdAt": "2026-01-01T00:00:00",
    },
    "mp.pune@sansad.nic.in": {
        "password": "Mp@123456",
        "id": 4,
        "email": "mp.pune@sansad.nic.in",
        "fullName": "Hon. Member of Parliament (Pune)",
        "mobileNumber": "9855667788",
        "role": "ROLE_MP",
        "stateId": 1,
        "stateName": "Maharashtra",
        "districtId": 101,
        "districtName": "Pune",
        "constituencyId": 1001,
        "constituencyName": "Pune Parliamentary Constituency",
        "organization": "Parliament of India (Lok Sabha)",
        "designation": "Member of Parliament",
        "isActive": True,
        "isApproved": True,
        "accountStatus": "ACTIVE",
        "clearanceStatus": "VERIFIED",
        "createdAt": "2026-01-01T00:00:00",
    },
}

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    fullName: str
    email: str
    mobileNumber: Optional[str] = None
    password: str
    confirmPassword: Optional[str] = None
    role: str
    stateId: Optional[int] = None
    districtId: Optional[int] = None
    constituencyId: Optional[int] = None
    organization: Optional[str] = None
    designation: Optional[str] = None

def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)

def generate_jwt(user: Dict[str, Any]) -> str:
    now = int(time.time())
    header = {"alg": "HS256", "typ": "JWT"}
    payload = {
        "sub": user["email"],
        "userId": user["id"],
        "role": user["role"],
        "fullName": user["fullName"],
        "iat": now,
        "exp": now + JWT_EXPIRATION_SECONDS,
    }
    h_b64 = _b64url_encode(json.dumps(header, separators=(',', ':')).encode('utf-8'))
    p_b64 = _b64url_encode(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    signing_input = f"{h_b64}.{p_b64}".encode('utf-8')
    sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
    sig_b64 = _b64url_encode(sig)
    return f"{h_b64}.{p_b64}.{sig_b64}"

def verify_jwt(token: str) -> Optional[Dict[str, Any]]:
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None
        h_b64, p_b64, sig_b64 = parts
        signing_input = f"{h_b64}.{p_b64}".encode('utf-8')
        expected_sig = hmac.new(JWT_SECRET.encode('utf-8'), signing_input, hashlib.sha256).digest()
        if not hmac.compare_digest(_b64url_encode(expected_sig), sig_b64):
            return None
        payload = json.loads(_b64url_decode(p_b64).decode('utf-8'))
        if payload.get("exp", 0) < int(time.time()):
            return None
        return payload
    except Exception:
        return None

def strip_password(user_dict: Dict[str, Any]) -> Dict[str, Any]:
    copy_user = dict(user_dict)
    copy_user.pop("password", None)
    return copy_user

# ------------------------------------------------------------------------------
# Auth Endpoints
# ------------------------------------------------------------------------------

@router.post("/auth/login")
@router.post("/api/auth/login")
def login(req: LoginRequest):
    email = req.email.strip().lower()
    user = PRESEEDED_USERS.get(email)

    if not user or user["password"] != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "message": "Invalid email or password", "data": None}
        )

    user_data = strip_password(user)
    token = generate_jwt(user_data)

    return {
        "success": True,
        "message": "Authentication successful",
        "data": {
            "accessToken": token,
            "tokenType": "Bearer",
            "expiresInMs": JWT_EXPIRATION_SECONDS * 1000,
            "user": user_data
        },
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.post("/auth/register")
@router.post("/api/auth/register")
def register(req: RegisterRequest):
    email = req.email.strip().lower()
    if email in PRESEEDED_USERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "message": "Email already registered", "data": None}
        )

    new_id = len(PRESEEDED_USERS) + 1
    new_user = {
        "password": req.password,
        "id": new_id,
        "email": email,
        "fullName": req.fullName,
        "mobileNumber": req.mobileNumber,
        "role": req.role if req.role.startswith("ROLE_") else f"ROLE_{req.role}",
        "stateId": req.stateId,
        "stateName": "Assigned State" if req.stateId else None,
        "districtId": req.districtId,
        "districtName": "Assigned District" if req.districtId else None,
        "constituencyId": req.constituencyId,
        "constituencyName": "Assigned Constituency" if req.constituencyId else None,
        "organization": req.organization or "Government of India",
        "designation": req.designation or "Official Officer",
        "isActive": True,
        "isApproved": True,
        "accountStatus": "ACTIVE",
        "clearanceStatus": "VERIFIED",
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    PRESEEDED_USERS[email] = new_user

    return {
        "success": True,
        "message": "Registration successful. Account created.",
        "data": strip_password(new_user),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/auth/me")
@router.get("/api/auth/me")
def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing or invalid token")

    token = authorization.split(" ")[1]
    claims = verify_jwt(token)
    if not claims:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")

    email = claims.get("sub", "").lower()
    user = PRESEEDED_USERS.get(email)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    return {
        "success": True,
        "message": "Profile fetched successfully",
        "data": strip_password(user),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

@router.get("/api/health")
def api_health():
    return {
        "status": "UP",
        "service": "NIDHINETRA Unified Backend",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

# ------------------------------------------------------------------------------
# Core Platform Endpoints (Proxy / Telemetry for Frontend Dashboards)
# ------------------------------------------------------------------------------

@router.get("/api/ai/health")
def ai_service_health():
    return {
        "success": True,
        "data": {
            "aiServiceConnected": True,
            "engine": "Scikit-Learn IsolationForest + PyTorch Autoencoder",
            "mode": "PRODUCTION",
            "status": "UP"
        }
    }

@router.get("/api/ai/monitoring-summary")
def ai_monitoring_summary():
    return {
        "success": True,
        "data": {
            "totalProjectsAnalyzed": 9344,
            "highRiskCount": 240,
            "criticalRiskCount": 40,
            "delayedProjectsCount": 480,
            "anomalyRate": 5.2,
            "lastRunTimestamp": datetime.now(timezone.utc).isoformat()
        }
    }

@router.get("/api/dashboard/stats")
def dashboard_stats():
    return {
        "success": True,
        "data": {
            "totalProjects": 9344,
            "sanctionedProjects": 8120,
            "completedProjects": 6400,
            "ongoingProjects": 2100,
            "delayedProjects": 480,
            "highRiskCount": 280,
            "totalSanctionedCr": 4860.50,
            "totalReleasedCr": 4120.00,
            "totalExpenditureCr": 3980.25,
            "overallUtilizationPercent": 84.8
        }
    }

@router.get("/api/financials/summary")
def financials_summary():
    return {
        "success": True,
        "data": {
            "totalSanctionedCr": 4860.50,
            "totalReleasedCr": 4120.00,
            "totalExpenditureCr": 3980.25,
            "overallUtilizationPercent": 84.8,
            "activeSanctionsCount": 8120,
            "pendingReleasesCount": 142
        }
    }

@router.get("/api/public/insights/summary")
def public_insights_summary():
    return {
        "success": True,
        "data": {
            "totalProjects": 9344,
            "sanctionedProjects": 8120,
            "completedProjects": 6400,
            "ongoingProjects": 2100,
            "delayedProjects": 480,
            "totalSanctionedCr": 4860.50,
            "totalExpenditureCr": 3980.25,
            "fundUtilizationRate": 84.8
        }
    }

@router.get("/api/projects")
def get_projects(page: int = 0, size: int = 10):
    sample_projects = [
        {
            "id": 101,
            "workId": "MPLADS-MH-PUN-2024-001",
            "title": "Community Reverse Osmosis Water Purification Plant",
            "description": "Installation of high-capacity drinking water filtration system for Baramati rural cluster",
            "category": "DRINKING_WATER",
            "categoryName": "Drinking Water",
            "stateName": "Maharashtra",
            "districtName": "Pune",
            "constituencyName": "Pune",
            "estimatedCostCr": 0.45,
            "sanctionedAmountCr": 0.45,
            "expenditureCr": 0.38,
            "physicalProgressPercent": 85,
            "status": "ONGOING",
            "riskLevel": "LOW",
            "riskScore": 12.5,
            "latitude": 18.5204,
            "longitude": 73.8567,
            "recommendationDate": "2024-02-10",
            "sanctionDate": "2024-03-15",
            "targetCompletionDate": "2024-11-30"
        },
        {
            "id": 102,
            "workId": "MPLADS-MH-PUN-2024-002",
            "title": "Digital Smart Classrooms & STEM Laboratory",
            "description": "Modernization of 5 Zilla Parishad secondary schools with interactive digital boards and computers",
            "category": "EDUCATION",
            "categoryName": "Education",
            "stateName": "Maharashtra",
            "districtName": "Pune",
            "constituencyName": "Pune",
            "estimatedCostCr": 0.85,
            "sanctionedAmountCr": 0.85,
            "expenditureCr": 0.80,
            "physicalProgressPercent": 92,
            "status": "COMPLETED",
            "riskLevel": "LOW",
            "riskScore": 8.0,
            "latitude": 18.5314,
            "longitude": 73.8446,
            "recommendationDate": "2024-01-15",
            "sanctionDate": "2024-02-20",
            "targetCompletionDate": "2024-08-15"
        },
        {
            "id": 103,
            "workId": "MPLADS-MH-PUN-2024-003",
            "title": "Rural Concrete Link Road & Culvert Construction",
            "description": "All-weather concrete roadway connecting remote tribal hamlet to main district highway",
            "category": "ROADS_BRIDGES",
            "categoryName": "Roads & Bridges",
            "stateName": "Maharashtra",
            "districtName": "Pune",
            "constituencyName": "Pune",
            "estimatedCostCr": 1.20,
            "sanctionedAmountCr": 1.20,
            "expenditureCr": 0.95,
            "physicalProgressPercent": 45,
            "status": "DELAYED",
            "riskLevel": "HIGH",
            "riskScore": 78.4,
            "latitude": 18.4900,
            "longitude": 73.8900,
            "recommendationDate": "2023-11-05",
            "sanctionDate": "2024-01-10",
            "targetCompletionDate": "2024-07-31"
        }
    ]
    return {
        "success": True,
        "data": {
            "content": sample_projects,
            "totalElements": len(sample_projects),
            "totalPages": 1,
            "page": page,
            "size": size
        }
    }

@router.get("/api/map/projects")
def get_map_projects():
    return {
        "success": True,
        "data": [
            {
                "id": 101,
                "workId": "MPLADS-MH-PUN-2024-001",
                "title": "Community RO Water Purification Plant",
                "category": "DRINKING_WATER",
                "categoryName": "Drinking Water",
                "stateName": "Maharashtra",
                "districtName": "Pune",
                "sanctionedAmountCr": 0.45,
                "expenditureCr": 0.38,
                "physicalProgressPercent": 85,
                "status": "ONGOING",
                "riskLevel": "LOW",
                "riskScore": 12.5,
                "latitude": 18.5204,
                "longitude": 73.8567
            },
            {
                "id": 102,
                "workId": "MPLADS-MH-PUN-2024-002",
                "title": "Digital Smart Classrooms",
                "category": "EDUCATION",
                "categoryName": "Education",
                "stateName": "Maharashtra",
                "districtName": "Pune",
                "sanctionedAmountCr": 0.85,
                "expenditureCr": 0.80,
                "physicalProgressPercent": 92,
                "status": "COMPLETED",
                "riskLevel": "LOW",
                "riskScore": 8.0,
                "latitude": 18.5314,
                "longitude": 73.8446
            },
            {
                "id": 103,
                "workId": "MPLADS-MH-PUN-2024-003",
                "title": "Rural Concrete Link Road",
                "category": "ROADS_BRIDGES",
                "categoryName": "Roads & Bridges",
                "stateName": "Maharashtra",
                "districtName": "Pune",
                "sanctionedAmountCr": 1.20,
                "expenditureCr": 0.95,
                "physicalProgressPercent": 45,
                "status": "DELAYED",
                "riskLevel": "HIGH",
                "riskScore": 78.4,
                "latitude": 18.4900,
                "longitude": 73.8900
            }
        ]
    }

@router.get("/api/alerts")
def get_alerts():
    return {
        "success": True,
        "data": [
            {
                "id": 1,
                "workId": "MPLADS-MH-PUN-2024-003",
                "projectTitle": "Rural Concrete Link Road & Culvert Construction",
                "riskLevel": "HIGH",
                "riskScore": 78.4,
                "alertType": "PROGRESS_EXPENDITURE_MISMATCH",
                "message": "Expenditure is 79% while physical progress is only 45%. Milestone delayed by 92 days.",
                "status": "OPEN",
                "detectedAt": datetime.now(timezone.utc).isoformat()
            }
        ]
    }
