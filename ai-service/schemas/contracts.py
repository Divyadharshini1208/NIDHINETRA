from pydantic import BaseModel, Field
from typing import List, Optional

class ProjectMonitoringInput(BaseModel):
    project_code: str
    category: str
    state_code: str
    district_code: str
    sanctioned_amount_lakhs: float
    expenditure_amount_lakhs: float
    physical_progress_percent: int
    duration_months_elapsed: int
    expected_duration_months: int

class AnomalyPredictionResult(BaseModel):
    project_code: str
    is_anomaly_flagged: bool
    risk_score: float = Field(ge=0.0, le=1.0)
    risk_tier: str # LOW, MODERATE, HIGH, CRITICAL
    anomaly_categories: List[str]
    confidence_score: float
    recommendation: str
    explanation: str

class DuplicateWorkCandidate(BaseModel):
    project_code_a: str
    project_code_b: str
    similarity_score: float
    reason: str
