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
    DuplicateDetectionResponse,
    NlQueryRequest,
    NlQueryResponse,
    PyTorchInferenceResult,
    ModelStatusResponse,
    ModelComparisonBenchmark
)
from pipeline.anomaly_detector import engine
from pipeline.data_processor import FEATURE_COLUMNS
from pipeline.pytorch_autoencoder import pytorch_engine
from pipeline.model_evaluator import run_pipeline_evaluation, run_dual_model_comparison
from pipeline.nl_analytics import nl_engine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("mplads-ai-service")

app = FastAPI(
    title="MPLADS AI Monitoring & Risk Telemetry Service",
    description="Explainable anomaly detection, Scikit-Learn IsolationForest baseline, PyTorch Tabular Autoencoder, milestone delay classification, duplicate detection, and grounded natural-language analytics.",
    version="2.1.0"
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
        "version": "2.1.0",
        "models": {
            "isolation_forest": {
                "engine": "Scikit-Learn IsolationForest (150 Estimators, RobustScaler)",
                "status": "PRODUCTION_READY",
                "features": len(FEATURE_COLUMNS)
            },
            "pytorch_autoencoder": {
                "engine": "PyTorch Tabular Autoencoder (10-32-16-4-16-32-10)",
                "status": pytorch_engine.status,
                "device": str(pytorch_engine.device),
                "thresholdMse": pytorch_engine.threshold
            }
        },
        "pipeline_metadata": engine.metadata,
        "capabilities": [
            "Explainable Anomaly Detection (Scikit-Learn IsolationForest)",
            "Deep Tabular Reconstruction Network (PyTorch Autoencoder)",
            "Multi-Feature Diagnostic Attribution",
            "Potential Cost Anomaly Screening",
            "Progress vs Expenditure Divergence Analysis",
            "Milestone Delay Trajectory Classification",
            "Payment Concentration Anomalies",
            "Duplicate Civil Work Detection",
            "Grounded Scheme Telemetry Natural-Language Analytics"
        ]
    }

@app.post("/analyze/project", response_model=ProjectAnalysisResponse)
def analyze_single_project(project: ProjectAnalysisRequest):
    """
    Comprehensive ML evaluation of a single civil project.
    Combines Isolation Forest continuous anomaly inference with feature attribution.
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
            "topContributingFeatures": [
                {"name": f.featureName, "deviance": f.standardizedDeviance, "impact": f.impactSeverity}
                for f in res.contributingFeatures[:3]
            ],
            "analyzedAt": res.analyzedAt,
            "statutoryNotice": res.statutoryNotice
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

@app.post("/invalidate-duplicate-cache")
def invalidate_duplicate_cache_endpoint():
    """
    Invalidates the cached TF-IDF vectorizer and document-term matrix.
    Called when projects are created, updated, or re-indexed.
    """
    try:
        return engine.invalidate_duplicate_cache()
    except Exception as e:
        logger.error(f"Error invalidating duplicate cache: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Cache invalidation error: {str(e)}")

@app.post("/evaluate/pipeline")
def evaluate_pipeline_endpoint():
    """
    Run empirical model evaluation suite over normal and anomalous benchmark records.
    Returns sensitivity, specificity, false positive rate, and documented limitations.
    """
    try:
        return run_pipeline_evaluation()
    except Exception as e:
        logger.error(f"Error during model evaluation: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Evaluation error: {str(e)}")

@app.post("/retrain")
def retrain_model_endpoint(n_samples: int = 800):
    """
    Trigger reproducible model refitting and persistence to disk.
    """
    try:
        meta = engine.train_and_persist(n_samples=n_samples)
        return {
            "status": "SUCCESS",
            "message": f"Isolation Forest retrained on {n_samples} baseline records and persisted.",
            "metadata": meta
        }
    except Exception as e:
        logger.error(f"Error during model retraining: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Retraining error: {str(e)}")

@app.post("/analytics/query", response_model=NlQueryResponse)
def grounded_analytics_query(request: NlQueryRequest):
    """
    Natural Language Query assistant grounded in verified scheme records.
    Produces factual analysis without hallucination.
    """
    try:
        return nl_engine.answer_query(request)
    except Exception as e:
        logger.error(f"Error during NL analytics query: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Query error: {str(e)}")

@app.get("/models/status", response_model=ModelStatusResponse)
def get_models_status_endpoint():
    """
    Expose readiness, framework, threshold, and parameter metadata for both
    Scikit-Learn IsolationForest baseline and PyTorch Tabular Autoencoder.
    """
    try:
        return ModelStatusResponse(
            serviceStatus="UP",
            isolationForest={
                "modelName": "Scikit-Learn IsolationForest",
                "framework": "Scikit-Learn",
                "status": "PRODUCTION_READY",
                "contamination": 0.12,
                "nEstimators": 150,
                "scaler": "RobustScaler",
                "role": "Primary statutory risk classification and continuous scoring baseline."
            },
            pytorchAutoencoder={
                "modelName": "PyTorch Tabular Autoencoder",
                "framework": "PyTorch",
                "status": pytorch_engine.status,
                "architecture": pytorch_engine.metadata.get("model_architecture", "10-32-16-4-16-32-10"),
                "device": str(pytorch_engine.device),
                "reconstructionThresholdMse": pytorch_engine.threshold,
                "validationMeanMse": pytorch_engine.metadata.get("validation_mean_mse", 0.098),
                "role": "Experimental deep-learning reconstruction benchmark evaluated against baseline."
            },
            featureSchema=FEATURE_COLUMNS,
            statutoryNotice="Dual-Model Architecture: Scikit-Learn baseline deployed for statutory scoring; PyTorch autoencoder operated as deep reconstruction benchmark."
        )
    except Exception as e:
        logger.error(f"Error retrieving model status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Model status error: {str(e)}")

@app.post("/analyze/pytorch", response_model=PyTorchInferenceResult)
def analyze_pytorch_endpoint(project: ProjectAnalysisRequest):
    """
    Standalone PyTorch Tabular Autoencoder inference endpoint.
    Converts inputs into PyTorch tensors and returns reconstruction MSE and anomaly indicator.
    """
    try:
        vec, _ = engine.extract_feature_vector(project)
        res = pytorch_engine.infer(vec[0])
        return PyTorchInferenceResult(**res)
    except Exception as e:
        logger.error(f"PyTorch inference error: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"PyTorch inference error: {str(e)}")

@app.post("/models/compare", response_model=ModelComparisonBenchmark)
def compare_models_endpoint():
    """
    Runs dual-model comparative benchmark on identical reference cases.
    Computes concordance/agreement rate, per-case breakdown, and unsupervised metrics.
    """
    try:
        return run_dual_model_comparison()
    except Exception as e:
        logger.error(f"Error during model comparison: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Model comparison error: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
