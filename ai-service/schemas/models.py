from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class PaymentRecord(BaseModel):
    paymentId: Optional[str] = None
    amount: float = 0.0
    paymentDate: Optional[str] = None
    payeeName: Optional[str] = None
    stageDescription: Optional[str] = None

class ProjectAnalysisRequest(BaseModel):
    projectId: Optional[str] = None
    id: Optional[int] = None
    projectName: str
    description: Optional[str] = ""
    categoryName: Optional[str] = "General Infrastructure"
    stateName: Optional[str] = "Maharashtra"
    stateCode: Optional[str] = "MH"
    districtName: Optional[str] = "Pune"
    districtCode: Optional[str] = "MH-PUN"
    constituencyName: Optional[str] = "Pune"
    mpName: Optional[str] = None
    implementingAgency: Optional[str] = "Public Works Dept"
    sanctionedAmount: float = Field(default=0.0, description="In Lakhs (INR)")
    releasedAmount: float = Field(default=0.0, description="In Lakhs (INR)")
    expenditureAmount: float = Field(default=0.0, description="In Lakhs (INR)")
    physicalProgress: int = Field(default=0, description="Percentage 0-100")
    financialProgress: float = Field(default=0.0, description="Percentage 0-100")
    startDate: Optional[str] = None
    expectedCompletionDate: Optional[str] = None
    actualCompletionDate: Optional[str] = None
    status: Optional[str] = "ONGOING"
    payments: Optional[List[PaymentRecord]] = []
    historicalCategoryAverage: Optional[float] = None

class CostAnomalyIndicator(BaseModel):
    isAnomaly: bool = False
    deviationPercent: float = 0.0
    benchmarkSanctionedLakhs: float = 0.0
    explanation: str

class DelayIndicator(BaseModel):
    status: str = "ON_TRACK" # ON_TRACK, AT_RISK, DELAYED, SEVERELY_DELAYED
    delayDays: int = 0
    explanation: str

class ProgressMismatchIndicator(BaseModel):
    isMismatch: bool = False
    physicalProgressPercent: int = 0
    financialProgressPercent: float = 0.0
    differencePercentagePoints: float = 0.0
    explanation: str

class PaymentAnomalyIndicator(BaseModel):
    isAnomaly: bool = False
    concentrationIndex: float = 0.0
    unusualLargePaymentCount: int = 0
    explanation: str

class DuplicateRiskIndicator(BaseModel):
    isPossibleDuplicate: bool = False
    similarityScore: float = 0.0
    matchingProjectId: Optional[str] = None
    matchingProjectName: Optional[str] = None
    explanation: str

class IndicatorsContainer(BaseModel):
    costAnomaly: CostAnomalyIndicator
    delayStatus: DelayIndicator
    progressMismatch: ProgressMismatchIndicator
    paymentAnomaly: PaymentAnomalyIndicator
    duplicateRisk: DuplicateRiskIndicator

class ContributingFeature(BaseModel):
    featureKey: str
    featureName: str
    observedValue: float
    baselineMedian: float
    standardizedDeviance: float
    impactSeverity: str # HIGH, MEDIUM, LOW
    description: str

class ProjectAnalysisResponse(BaseModel):
    projectId: Optional[str] = None
    riskScore: int = Field(description="Normalized integer 0-100")
    riskLevel: str = Field(description="LOW, MEDIUM, HIGH, CRITICAL")
    overallHealth: str = Field(description="HEALTHY, MODERATE, ELEVATED_RISK, CRITICAL_ATTENTION")
    reasons: List[str] = []
    indicators: IndicatorsContainer
    isolationForestRawScore: float = 0.0
    contributingFeatures: List[ContributingFeature] = []
    recommendations: List[str] = []
    analyzedAt: str
    modelMetadata: Optional[Dict[str, Any]] = None
    statutoryNotice: str = "Statutory Decision Support: Flagged indicators represent statistical variations requiring human review; NOT proof of fraud."

class DuplicateCandidate(BaseModel):
    projectId: str
    projectName: str
    description: Optional[str] = ""
    stateName: Optional[str] = ""
    districtName: Optional[str] = ""
    categoryName: Optional[str] = ""
    sanctionedAmount: float = 0.0

class DuplicateDetectionRequest(BaseModel):
    targetProject: ProjectAnalysisRequest
    candidates: List[DuplicateCandidate]

class DuplicateDetectionResponse(BaseModel):
    targetProjectId: Optional[str] = None
    possibleDuplicate: bool = False
    similarityScore: float = 0.0
    matchingProjectId: Optional[str] = None
    matchingProjectName: Optional[str] = None
    reasons: List[str] = []
    comparisonDetails: Dict[str, Any] = {}

class BatchAnalysisRequest(BaseModel):
    projects: List[ProjectAnalysisRequest]

class BatchAnalysisResponse(BaseModel):
    totalProcessed: int
    highRiskCount: int
    mediumRiskCount: int
    lowRiskCount: int
    criticalRiskCount: int
    results: List[ProjectAnalysisResponse]

class NlQueryRequest(BaseModel):
    query: str
    scopeRole: Optional[str] = "ROLE_MINISTRY_ADMIN"
    projects: Optional[List[ProjectAnalysisRequest]] = []

class NlQueryResponse(BaseModel):
    query: str
    answer: str
    keyFindings: List[str] = []
    citedProjects: List[str] = []
    evidenceSources: List[str] = []
    suggestedActions: List[str] = []
    statutoryNotice: str = "Deterministic Grounded Analytics: Output generated strictly from verified database records without speculative generation."
