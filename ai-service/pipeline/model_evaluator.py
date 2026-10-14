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


def run_dual_model_comparison() -> Dict[str, Any]:
    """
    Evaluates both Scikit-Learn IsolationForest and PyTorch Tabular Autoencoder
    side-by-side on identical reference cases to compare anomaly concordance.
    """
    import datetime
    from pipeline.pytorch_autoencoder import pytorch_engine

    # Benchmark test cases
    benchmark_cases = [
        # Normal reference cases
        ("BENCH-NORM-01", "Drinking Water RO Plant", "Drinking Water", 25.0, 22.0, 18.0, 80, 81.8, "2026-12-31", False),
        ("BENCH-NORM-02", "School Science Lab Upgradation", "Education & Schools", 35.0, 28.0, 20.0, 65, 71.4, "2026-11-15", False),
        ("BENCH-NORM-03", "Rural Concrete Road 1.2km", "Roads & Bridges", 60.0, 50.0, 42.0, 70, 70.0, "2026-10-20", False),
        ("BENCH-NORM-04", "Solar Street Lighting Grid", "Energy & Lighting", 18.0, 18.0, 18.0, 100, 100.0, "2026-09-15", False),
        # Deliberately anomalous cases
        ("BENCH-ANOM-01", "Severe Drawdown With Minimal Execution", "Drinking Water", 45.0, 45.0, 42.0, 12, 93.3, "2025-06-01", True),
        ("BENCH-ANOM-02", "Extreme Outlier Cost Outlay (5x Normal)", "Education & Schools", 185.0, 120.0, 110.0, 40, 91.6, "2025-01-15", True),
        ("BENCH-ANOM-03", "Overdue Delayed Road With Stalled Progress", "Roads & Bridges", 95.0, 90.0, 88.0, 30, 97.0, "2024-01-01", True),
        ("BENCH-ANOM-04", "Disproportionate Single Drawdown Burst", "Community Infrastructure", 55.0, 55.0, 52.0, 18, 94.5, "2025-08-01", True)
    ]

    comparisons = []
    agreed_count = 0
    pt_tp, pt_tn, pt_fp, pt_fn = 0, 0, 0, 0
    sk_tp, sk_tn, sk_fp, sk_fn = 0, 0, 0, 0

    for cid, name, cat, sanc, rel, exp, phy, fin, exp_date, is_anom_ground_truth in benchmark_cases:
        req = ProjectAnalysisRequest(
            projectId=cid,
            projectName=name,
            categoryName=cat,
            sanctionedAmount=sanc,
            releasedAmount=rel,
            expenditureAmount=exp,
            physicalProgress=phy,
            financialProgress=fin,
            expectedCompletionDate=exp_date
        )

        # Scikit-learn inference
        sk_res = engine.analyze_project(req)
        sk_flagged = sk_res.riskScore >= 60

        # PyTorch inference
        vec, _ = engine.extract_feature_vector(req)
        pt_res = pytorch_engine.infer(vec[0])
        pt_flagged = pt_res.get("isAnomalous", False)

        # Agreement check
        agreed = (sk_flagged == pt_flagged)
        if agreed:
            agreed_count += 1

        # Ground truth stats
        if is_anom_ground_truth:
            if sk_flagged: sk_tp += 1
            else: sk_fn += 1
            if pt_flagged: pt_tp += 1
            else: pt_fn += 1
        else:
            if not sk_flagged: sk_tn += 1
            else: sk_fp += 1
            if not pt_flagged: pt_tn += 1
            else: pt_fp += 1

        comparisons.append({
            "caseId": cid,
            "projectName": name,
            "category": cat,
            "groundTruthAnomalous": is_anom_ground_truth,
            "scikitLearn": {
                "riskScore": sk_res.riskScore,
                "riskLevel": sk_res.riskLevel,
                "isFlagged": sk_flagged,
                "rawIsoScore": sk_res.isolationForestRawScore
            },
            "pytorchAutoencoder": {
                "reconstructionMse": pt_res.get("reconstructionMse", 0.0),
                "thresholdMse": pt_res.get("thresholdMse", 0.2675),
                "isAnomalous": pt_flagged,
                "confidence": pt_res.get("reconstructionConfidence", 0.0),
                "indicator": pt_res.get("indicator", "CONGRUENT_RECONSTRUCTION")
            },
            "modelsAgreed": agreed
        })

    total = len(benchmark_cases)
    agreement_rate = (agreed_count / total * 100.0) if total > 0 else 0.0

    return {
        "totalBenchmarkCases": total,
        "agreementCount": agreed_count,
        "agreementRatePercent": round(agreement_rate, 1),
        "scikitLearnMetrics": {
            "modelName": "Scikit-Learn IsolationForest (Baseline)",
            "status": "PRODUCTION_READY",
            "accuracy": round((sk_tp + sk_tn) / total, 3),
            "sensitivity": round(sk_tp / (sk_tp + sk_fn) if (sk_tp + sk_fn) > 0 else 0.0, 3),
            "specificity": round(sk_tn / (sk_tn + sk_fp) if (sk_tn + sk_fp) > 0 else 0.0, 3),
            "falsePositiveRate": round(sk_fp / (sk_fp + sk_tn) if (sk_fp + sk_tn) > 0 else 0.0, 3)
        },
        "pytorchAutoencoderMetrics": {
            "modelName": "PyTorch Tabular Autoencoder",
            "status": pytorch_engine.status,
            "architecture": pytorch_engine.metadata.get("model_architecture", "10-32-16-4-16-32-10"),
            "thresholdMse": pytorch_engine.threshold,
            "accuracy": round((pt_tp + pt_tn) / total, 3),
            "sensitivity": round(pt_tp / (pt_tp + pt_fn) if (pt_tp + pt_fn) > 0 else 0.0, 3),
            "specificity": round(pt_tn / (pt_tn + pt_fp) if (pt_tn + pt_fp) > 0 else 0.0, 3),
            "falsePositiveRate": round(pt_fp / (pt_fp + pt_tn) if (pt_fp + pt_tn) > 0 else 0.0, 3)
        },
        "comparativeAnalysis": comparisons,
        "documentedLimitations": [
            "Isolation Forest operates as the primary, statutory-calibrated baseline with explainable per-feature deviance attribution.",
            "PyTorch Tabular Autoencoder provides deep multivariate reconstruction evaluation and is maintained as an experimental / validated benchmark.",
            "Neither model asserts legal corruption or fraud; discrepancies represent statistical divergence for administrative physical inspection.",
            "Model retraining is controlled and never triggered automatically on unverified or anomalous field reports."
        ],
        "evaluatedAt": datetime.datetime.now().isoformat()
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

    print("\n=== DUAL MODEL COMPARISON ===")
    comp = run_dual_model_comparison()
    print(f"Agreement Rate: {comp['agreementRatePercent']}% ({comp['agreementCount']}/{comp['totalBenchmarkCases']})")

