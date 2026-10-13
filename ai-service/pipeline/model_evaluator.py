"""
Model Evaluation and Diagnostic Audit Suite for MPLADS Anomaly Detection.
Provides reproducible evaluation over representative normal and deliberately anomalous project records.
Computes confusion matrix, detection sensitivity, false positive estimates, and documents limitations.
"""

import numpy as np
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from typing import Dict, Any, List
from schemas.models import ProjectAnalysisRequest
from pipeline.anomaly_detector import engine

def run_pipeline_evaluation() -> Dict[str, Any]:
    """
    Evaluates the Isolation Forest Anomaly Detection pipeline against
    a benchmark evaluation suite of controlled test cases.
    """
    # 1. Normal Test Records (Expected: Low or Medium Risk, not flagged as Critical)
    normal_cases: List[ProjectAnalysisRequest] = [
        ProjectAnalysisRequest(
            projectId="EVAL-NORM-001",
            projectName="Community RO Water Purification Unit in Gram Panchayat",
            categoryName="Drinking Water",
            sanctionedAmount=22.0,
            releasedAmount=20.0,
            expenditureAmount=18.0,
            physicalProgress=85,
            financialProgress=90.0,
            expectedCompletionDate="2026-12-31"
        ),
        ProjectAnalysisRequest(
            projectId="EVAL-NORM-002",
            projectName="Upgradation of High School Science Laboratory",
            categoryName="Education & Schools",
            sanctionedAmount=34.0,
            releasedAmount=25.0,
            expenditureAmount=15.0,
            physicalProgress=60,
            financialProgress=60.0,
            expectedCompletionDate="2026-11-15"
        ),
        ProjectAnalysisRequest(
            projectId="EVAL-NORM-003",
            projectName="Rural Road Metalling and Concrete Pavers",
            categoryName="Roads & Bridges",
            sanctionedAmount=62.0,
            releasedAmount=50.0,
            expenditureAmount=45.0,
            physicalProgress=70,
            financialProgress=72.0,
            expectedCompletionDate="2026-10-20"
        ),
        ProjectAnalysisRequest(
            projectId="EVAL-NORM-004",
            projectName="Solar High Mast Street Lighting System",
            categoryName="Energy & Lighting",
            sanctionedAmount=18.0,
            releasedAmount=18.0,
            expenditureAmount=18.0,
            physicalProgress=100,
            financialProgress=100.0,
            actualCompletionDate="2026-09-01",
            expectedCompletionDate="2026-09-15"
        )
    ]

    # 2. Deliberately Anomalous Records (Expected: High or Critical Risk, elevated score)
    anomalous_cases: List[ProjectAnalysisRequest] = [
        ProjectAnalysisRequest(
            projectId="EVAL-ANOM-001",
            projectName="Suspected High Drawdown Without Physical Execution",
            categoryName="Drinking Water",
            sanctionedAmount=45.0,
            releasedAmount=45.0,
            expenditureAmount=42.0,
            physicalProgress=12, # Severe mismatch: 93% spent, 12% physical
            financialProgress=93.3,
            expectedCompletionDate="2025-06-01"
        ),
        ProjectAnalysisRequest(
            projectId="EVAL-ANOM-002",
            projectName="Extreme Outlier Cost Outlay for Standard School Room",
            categoryName="Education & Schools",
            sanctionedAmount=185.0, # Benchmark is 35L; 185L is 5x standard
            releasedAmount=120.0,
            expenditureAmount=110.0,
            physicalProgress=40,
            financialProgress=91.6,
            expectedCompletionDate="2025-01-15"
        ),
        ProjectAnalysisRequest(
            projectId="EVAL-ANOM-003",
            projectName="Multi-Year Delayed Unfinished Bridge Overdue by 400 Days",
            categoryName="Roads & Bridges",
            sanctionedAmount=95.0,
            releasedAmount=90.0,
            expenditureAmount=88.0,
            physicalProgress=30,
            financialProgress=97.0,
            expectedCompletionDate="2024-01-01" # > 600 days delayed
        )
    ]

    normal_results = [engine.analyze_project(c) for c in normal_cases]
    anomalous_results = [engine.analyze_project(c) for c in anomalous_cases]

    # Metrics
    # True Negative: Normal cases scored < 60 (LOW or MEDIUM)
    # False Positive: Normal cases scored >= 60
    # True Positive: Anomalous cases scored >= 60 (HIGH or CRITICAL)
    # False Negative: Anomalous cases scored < 60
    tn = sum(1 for r in normal_results if r.riskScore < 60)
    fp = sum(1 for r in normal_results if r.riskScore >= 60)
    tp = sum(1 for r in anomalous_results if r.riskScore >= 60)
    fn = sum(1 for r in anomalous_results if r.riskScore < 60)

    total_eval = len(normal_cases) + len(anomalous_cases)
    accuracy = (tp + tn) / total_eval if total_eval > 0 else 0.0
    sensitivity_recall = tp / (tp + fn) if (tp + fn) > 0 else 0.0
    specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0
    false_positive_rate = fp / (fp + tn) if (fp + tn) > 0 else 0.0

    return {
        "evaluationStatus": "COMPLETED",
        "totalEvaluatedRecords": total_eval,
        "confusionMatrix": {
            "truePositives": tp,
            "trueNegatives": tn,
            "falsePositives": fp,
            "falseNegatives": fn
        },
        "performanceMetrics": {
            "accuracy": round(accuracy, 3),
            "sensitivityRecall": round(sensitivity_recall, 3),
            "specificity": round(specificity, 3),
            "falsePositiveRate": round(false_positive_rate, 3)
        },
        "caseDetails": {
            "normalCasesScored": [
                {"id": r.projectId, "score": r.riskScore, "tier": r.riskLevel}
                for r in normal_results
            ],
            "anomalousCasesScored": [
                {"id": r.projectId, "score": r.riskScore, "tier": r.riskLevel, "topFactor": r.contributingFeatures[0].featureName if r.contributingFeatures else None}
                for r in anomalous_results
            ]
        },
        "documentedLimitations": [
            "Unsupervised Isolation Forest relies on representative baseline feature distributions; regional terrain variations (e.g. hilly northeastern states vs plains) may exhibit legitimately higher unit road costs.",
            "An anomaly score indicates statistical deviation from expected norms, NOT verified fraud or wrongdoing.",
            "Works with incomplete timeline records rely on available financial milestones for estimation.",
            "Evaluation performed on representative reference benchmarks; continuous production recalibration recommended as live MoSPI eSAKSHI data volume expands."
        ]
    }

if __name__ == "__main__":
    report = run_pipeline_evaluation()
    print("=== MODEL EVALUATION REPORT ===")
    print(f"Total Evaluated: {report['totalEvaluatedRecords']}")
    print(f"Confusion Matrix: {report['confusionMatrix']}")
    print(f"Sensitivity (Recall): {report['performanceMetrics']['sensitivityRecall']}")
    print(f"Specificity: {report['performanceMetrics']['specificity']}")
    print(f"False Positive Rate: {report['performanceMetrics']['falsePositiveRate']}")
    print("\nAnomalous Cases Scores:")
    for c in report["caseDetails"]["anomalousCasesScored"]:
        print(f"  - {c['id']}: Score={c['score']}, Tier={c['tier']}, TopFactor={c['topFactor']}")
