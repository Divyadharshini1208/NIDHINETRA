"""
Test Suite for Dual-Model Comparison and API Endpoints.
Validates comparative evaluation between Isolation Forest and PyTorch Autoencoder,
model status endpoint, and PyTorch inference endpoint.
"""

import pytest
from fastapi.testclient import TestClient
from main import app
from pipeline.model_evaluator import run_dual_model_comparison

client = TestClient(app)

def test_dual_model_comparison_benchmark():
    report = run_dual_model_comparison()
    assert report["totalBenchmarkCases"] >= 6
    assert 0.0 <= report["agreementRatePercent"] <= 100.0
    assert "scikitLearnMetrics" in report
    assert "pytorchAutoencoderMetrics" in report
    assert "comparativeAnalysis" in report
    assert len(report["comparativeAnalysis"]) == report["totalBenchmarkCases"]
    assert len(report["documentedLimitations"]) > 0

def test_api_models_status_endpoint():
    response = client.get("/models/status")
    assert response.status_code == 200
    data = response.json()
    assert data["serviceStatus"] == "UP"
    assert data["isolationForest"]["framework"] == "Scikit-Learn"
    assert data["isolationForest"]["status"] == "PRODUCTION_READY"
    assert data["pytorchAutoencoder"]["framework"] == "PyTorch"
    assert data["pytorchAutoencoder"]["status"] in ["EXPERIMENTAL", "VALIDATED"]
    assert len(data["featureSchema"]) == 10

def test_api_models_compare_endpoint():
    response = client.post("/models/compare")
    assert response.status_code == 200
    data = response.json()
    assert "agreementRatePercent" in data
    assert "scikitLearnMetrics" in data
    assert "pytorchAutoencoderMetrics" in data
    assert "comparativeAnalysis" in data

def test_api_analyze_pytorch_endpoint():
    payload = {
        "projectId": "TEST-PT-01",
        "projectName": "PyTorch Endpoint Test Project",
        "categoryName": "Drinking Water",
        "sanctionedAmount": 30.0,
        "releasedAmount": 25.0,
        "expenditureAmount": 20.0,
        "physicalProgress": 70,
        "financialProgress": 80.0
    }
    response = client.post("/analyze/pytorch", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["modelName"] == "PyTorch Tabular Autoencoder"
    assert "reconstructionMse" in data
    assert "isAnomalous" in data
    assert "thresholdMse" in data
