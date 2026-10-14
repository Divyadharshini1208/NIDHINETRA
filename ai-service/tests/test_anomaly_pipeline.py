"""
Test Suite for MPLADS AI/ML Anomaly Detection Pipeline.
Validates Isolation Forest inference, feature attribution, edge case safety,
duplicate detection, model evaluation, and grounded analytics.
"""

import pytest
import datetime
from schemas.models import (
    ProjectAnalysisRequest,
    DuplicateCandidate,
    NlQueryRequest
)
from pipeline.anomaly_detector import engine
from pipeline.model_evaluator import run_pipeline_evaluation
from pipeline.nl_analytics import nl_engine

def test_normal_project_scoring():
    project = ProjectAnalysisRequest(
        projectId="TEST-NORM-01",
        projectName="Construction of Community RO Drinking Water Plant",
        categoryName="Drinking Water",
        sanctionedAmount=25.0,
        releasedAmount=22.0,
        expenditureAmount=18.0,
        physicalProgress=80,
        financialProgress=81.8,
        expectedCompletionDate="2026-12-31"
    )
    result = engine.analyze_project(project)
    assert result.projectId == "TEST-NORM-01"
    assert result.riskScore < 60, f"Expected normal project to have risk score < 60, got {result.riskScore}"
    assert result.riskLevel in ["LOW", "MEDIUM"]
    assert len(result.contributingFeatures) > 0
    assert not result.indicators.progressMismatch.isMismatch

def test_severe_progress_mismatch_flagged():
    project = ProjectAnalysisRequest(
        projectId="TEST-MISMATCH-01",
        projectName="Rural Concrete Road Linking Velhe Gram",
        categoryName="Roads & Bridges",
        sanctionedAmount=85.0,
        releasedAmount=80.0,
        expenditureAmount=75.0,
        physicalProgress=15, # Severe progress gap: 93% spent, 15% physical
        financialProgress=93.75,
        expectedCompletionDate="2025-06-01"
    )
    result = engine.analyze_project(project)
    assert result.riskScore >= 60, f"Expected severe mismatch to have risk score >= 60, got {result.riskScore}"
    assert result.riskLevel in ["HIGH", "CRITICAL"]
    assert result.indicators.progressMismatch.isMismatch
    # Verify top contributing factor relates to progress gap
    top_keys = [f.featureKey for f in result.contributingFeatures[:3]]
    assert "progress_mismatch_gap" in top_keys or "expenditure_velocity" in top_keys

def test_cost_anomaly_flagged():
    project = ProjectAnalysisRequest(
        projectId="TEST-COST-01",
        projectName="Single Room Primary School Extension",
        categoryName="Education & Schools",
        sanctionedAmount=190.0, # Benchmark ~35L, 190L is an extreme outlier
        releasedAmount=100.0,
        expenditureAmount=50.0,
        physicalProgress=50,
        financialProgress=50.0,
        expectedCompletionDate="2026-11-01"
    )
    result = engine.analyze_project(project)
    assert result.indicators.costAnomaly.isAnomaly
    assert result.indicators.costAnomaly.deviationPercent > 100.0

def test_severe_delay_classified():
    project = ProjectAnalysisRequest(
        projectId="TEST-DELAY-01",
        projectName="Community Primary Health Sub-Centre",
        categoryName="Healthcare & Sanitation",
        sanctionedAmount=45.0,
        releasedAmount=40.0,
        expenditureAmount=30.0,
        physicalProgress=50,
        financialProgress=75.0,
        expectedCompletionDate="2024-01-01" # Over 2 years overdue
    )
    result = engine.analyze_project(project)
    assert result.indicators.delayStatus.status == "SEVERELY_DELAYED"
    assert result.indicators.delayStatus.delayDays > 180

def test_edge_cases_and_zero_values_safety():
    # Test project with all zeroes and missing optional dates
    project = ProjectAnalysisRequest(
        projectId="TEST-ZERO-01",
        projectName="Newly Sanctioned Project With Zero Progress",
        categoryName="General Infrastructure",
        sanctionedAmount=0.0,
        releasedAmount=0.0,
        expenditureAmount=0.0,
        physicalProgress=0,
        financialProgress=0.0,
        startDate=None,
        expectedCompletionDate=None,
        actualCompletionDate=None
    )
    result = engine.analyze_project(project)
    assert result.riskScore is not None
    assert result.riskLevel in ["LOW", "MEDIUM", "HIGH", "CRITICAL", "INSUFFICIENT_DATA"]
    assert result.riskLevel == "INSUFFICIENT_DATA"

def test_inference_reproducibility():
    project = ProjectAnalysisRequest(
        projectId="TEST-REPRO-01",
        projectName="High School Digital Smart Classroom Lab",
        categoryName="Education & Schools",
        sanctionedAmount=35.0,
        releasedAmount=30.0,
        expenditureAmount=25.0,
        physicalProgress=70,
        financialProgress=83.3,
        expectedCompletionDate="2026-10-30"
    )
    result1 = engine.analyze_project(project)
    result2 = engine.analyze_project(project)
    assert result1.riskScore == result2.riskScore
    assert result1.riskLevel == result2.riskLevel
    assert result1.isolationForestRawScore == result2.isolationForestRawScore

def test_duplicate_detection_logic():
    target = ProjectAnalysisRequest(
        projectId="PROJ-ORIG",
        projectName="Construction of 5km Link Road Velhe to Ketkawle",
        description="Cement concrete road with reinforced side drains",
        districtName="Pune",
        categoryName="Roads & Bridges",
        sanctionedAmount=85.0
    )
    candidates = [
        DuplicateCandidate(
            projectId="PROJ-CAND-1",
            projectName="Construction of 5km Link Road Velhe to Ketkawle",
            description="Cement concrete road with reinforced side drains",
            districtName="Pune",
            categoryName="Roads & Bridges",
            sanctionedAmount=84.5
        ),
        DuplicateCandidate(
            projectId="PROJ-CAND-2",
            projectName="Primary School Science Laboratory Equipment",
            description="School laboratory apparatus",
            districtName="Pune",
            categoryName="Education & Schools",
            sanctionedAmount=30.0
        )
    ]
    res = engine.detect_duplicates(target, candidates)
    assert res.possibleDuplicate
    assert res.matchingProjectId == "PROJ-CAND-1"
    assert res.similarityScore > 65.0

    # Test cache warm hit on identical candidate corpus (transforms only target)
    res_warm = engine.detect_duplicates(target, candidates)
    assert res_warm.possibleDuplicate
    assert res_warm.matchingProjectId == "PROJ-CAND-1"

    # Test cache invalidation
    inval_res = engine.invalidate_duplicate_cache()
    assert inval_res["status"] == "success"
    assert engine._candidate_corpus_hash is None

def test_model_evaluation_suite():
    eval_report = run_pipeline_evaluation()
    assert eval_report["evaluationStatus"] == "COMPLETED"
    assert eval_report["totalEvaluatedRecords"] >= 7
    assert eval_report["performanceMetrics"]["accuracy"] >= 0.8
    assert len(eval_report["documentedLimitations"]) > 0

def test_grounded_nl_analytics():
    p1 = ProjectAnalysisRequest(
        projectId="MPLAD-TEST-01",
        projectName="Overdue Bridge",
        status="DELAYED",
        sanctionedAmount=90.0,
        releasedAmount=80.0,
        expenditureAmount=75.0,
        physicalProgress=30,
        financialProgress=93.7,
        expectedCompletionDate="2025-01-01"
    )
    query = NlQueryRequest(
        query="Which projects are delayed in our constituency?",
        projects=[p1]
    )
    ans = nl_engine.answer_query(query)
    assert "delayed" in ans.answer.lower()
    assert "MPLAD-TEST-01" in ans.citedProjects
    assert len(ans.suggestedActions) > 0
