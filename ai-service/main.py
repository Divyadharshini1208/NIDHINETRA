"""
MPLADS AI Decision Support & Risk Detection Service
Ministry of Statistics & Programme Implementation (MoSPI), Government of India
"""

import logging
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any

from schemas.models import (
    ProjectAnalysisRequest,
    ProjectAnalysisResponse,
    BatchAnalysisRequest,
    BatchAnalysisResponse,
    DuplicateDetectionRequest,
    DuplicateDetectionResponse
)
from pipeline.anomaly_detector import engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mplads-ai-service")

app = FastAPI(
    title="MPLADS AI Monitoring & Risk Telemetry Service",
    description="Explainable anomaly detection, cost anomaly screening, milestone delay classification, and duplicate detection microservice.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "UP",
        "service": "MPLADS AI Microservice",
        "version": "2.0.0",
        "ml_engine": "Scikit-Learn IsolationForest & TF-IDF Vectorizer",
        "capabilities": [
            "Explainable Anomaly Detection",
            "Potential Cost Anomaly Screening",
            "Progress vs Expenditure Mismatch",
            "Milestone Delay Analytics",
            "Payment Concentration Anomalies",
            "Duplicate Civil Work Detection"
        ]
    }

@app.post("/analyze/project", response_model=ProjectAnalysisResponse)
def analyze_single_project(project: ProjectAnalysisRequest):
    """
    Comprehensive AI evaluation of a single civil project.
    Combines Isolation Forest anomaly scoring with rule-weighted explainable factors.
    """
    try:
        result = engine.analyze_project(project)
        return result
    except Exception as e:
        logger.error(f"Error during project analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"AI inference error: {str(e)}")

@app.post("/analyze/batch", response_model=BatchAnalysisResponse)
def analyze_batch(batch: BatchAnalysisRequest):
    """
    Evaluate multiple projects in batch and compute aggregate risk distribution.
    """
    try:
        results: List[ProjectAnalysisResponse] = []
        high_count = 0
        med_count = 0
        low_count = 0
        crit_count = 0

        for p in batch.projects:
            res = engine.analyze_project(p)
            results.append(res)
            if res.riskLevel == "CRITICAL":
                crit_count += 1
            elif res.riskLevel == "HIGH":
                high_count += 1
            elif res.riskLevel == "MEDIUM":
                med_count += 1
            else:
                low_count += 1

        return BatchAnalysisResponse(
            totalProcessed=len(batch.projects),
            highRiskCount=high_count,
            mediumRiskCount=med_count,
            lowRiskCount=low_count,
            criticalRiskCount=crit_count,
            results=results
        )
    except Exception as e:
        logger.error(f"Error during batch analysis: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Batch AI processing error: {str(e)}")

@app.post("/risk-score")
def calculate_risk_score_only(project: ProjectAnalysisRequest):
    """
    Lightweight endpoint returning risk score, tier, and key explainable factors.
    """
    try:
        res = engine.analyze_project(project)
        return {
            "projectId": res.projectId,
            "riskScore": res.riskScore,
            "riskLevel": res.riskLevel,
            "overallHealth": res.overallHealth,
            "reasons": res.reasons,
            "analyzedAt": res.analyzedAt
        }
    except Exception as e:
        logger.error(f"Error calculating risk score: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Risk calculation error: {str(e)}")

@app.post("/detect-duplicates", response_model=DuplicateDetectionResponse)
def detect_duplicates_endpoint(request: DuplicateDetectionRequest):
    """
    Scan project against candidate pool to identify potential duplicate civil works.
    Flags works for human review; never modifies or merges records automatically.
    """
    try:
        return engine.detect_duplicates(request.targetProject, request.candidates)
    except Exception as e:
        logger.error(f"Error during duplicate detection: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Duplicate detection error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
