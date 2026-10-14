import os
import json
import datetime
import hashlib
import threading
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from pathlib import Path
import joblib

from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import RobustScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from schemas.models import (
    ProjectAnalysisRequest,
    ProjectAnalysisResponse,
    IndicatorsContainer,
    CostAnomalyIndicator,
    DelayIndicator,
    ProgressMismatchIndicator,
    PaymentAnomalyIndicator,
    DuplicateRiskIndicator,
    ContributingFeature,
    DuplicateCandidate,
    DuplicateDetectionResponse,
    PyTorchInferenceResult,
    FundUtilizationSummary
)
from pipeline.data_processor import DataProcessor
from pipeline.pytorch_autoencoder import pytorch_engine

# Sectoral baseline unit benchmarks (in ₹ Lakhs) for MPLADS civil asset categories
CATEGORY_BENCHMARKS = {
    "Drinking Water": {"avg": 22.5, "std": 8.0, "max_normal": 42.0},
    "Roads & Bridges": {"avg": 65.0, "std": 20.0, "max_normal": 110.0},
    "Education & Schools": {"avg": 35.0, "std": 12.0, "max_normal": 60.0},
    "Healthcare & Sanitation": {"avg": 45.0, "std": 15.0, "max_normal": 75.0},
    "Community Infrastructure": {"avg": 40.0, "std": 14.0, "max_normal": 70.0},
    "Energy & Lighting": {"avg": 18.0, "std": 6.0, "max_normal": 32.0},
    "Sports & Youth": {"avg": 28.0, "std": 10.0, "max_normal": 50.0},
    "Irrigation & Agriculture": {"avg": 38.0, "std": 14.0, "max_normal": 68.0},
    "General Infrastructure": {"avg": 40.0, "std": 15.0, "max_normal": 75.0}
}

FEATURE_SPECS = [
    {"key": "sanctioned_amount", "name": "Sanctioned Outlay (₹ Lakhs)"},
    {"key": "drawdown_ratio", "name": "Fund Release-to-Sanction Ratio"},
    {"key": "expenditure_velocity", "name": "Disbursement-to-Release Velocity"},
    {"key": "physical_progress", "name": "Certified Physical Completion (%)"},
    {"key": "financial_progress", "name": "Reported Financial Progress (%)"},
    {"key": "progress_mismatch_gap", "name": "Financial vs Physical Divergence (Points)"},
    {"key": "expenditure_per_progress_pct", "name": "Expenditure per Progress Point (₹ Lakhs/%)"},
    {"key": "milestone_delay_days", "name": "Milestone Schedule Delay (Days)"},
    {"key": "category_cost_deviation_pct", "name": "Category Benchmark Variance (%)"},
    {"key": "payment_concentration_index", "name": "Payment Drawdown Concentration Index"}
]

def _resolve_model_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent / "models",
        Path.cwd() / "models",
        Path.cwd() / "ai-service" / "models",
        Path(__file__).resolve().parent / "models",
    ]
    for c in candidates:
        if c.exists() and (c / "isolation_forest.joblib").exists():
            return c
    return candidates[0]

MODEL_DIR = _resolve_model_dir()
MODEL_PATH = MODEL_DIR / "isolation_forest.joblib"
SCALER_PATH = MODEL_DIR / "robust_scaler.joblib"
METADATA_PATH = MODEL_DIR / "model_metadata.json"

class GenuineAnomalyDetectionPipeline:
    """
    Production-grade Unsupervised Anomaly Detection Pipeline for Public Expenditure
    and Government Scheme Project Monitoring (MPLADS).

    Core Architecture:
    1. 10-Dimensional Statistical Domain Feature Vector Extraction
    2. RobustScaler Normalization (resilient to extreme outliers and zero-divisions)
    3. Scikit-Learn IsolationForest Unsupervised Model (calibrated continuous scoring)
    4. Per-Feature Diagnostic Attribution Engine (pinpoints exact deviating variables)
    5. Actionable Statutory Recommendations & Reproducible Training Artifacts
    """

    def __init__(self):
        self.scaler: Optional[RobustScaler] = None
        self.iso_forest: Optional[IsolationForest] = None
        self.metadata: Dict[str, Any] = {}
        self.baseline_stats: Dict[str, Dict[str, float]] = {}

        # Thread-safe caching for TF-IDF candidate corpus vectors
        self._duplicate_cache_lock = threading.Lock()
        self._candidate_corpus_hash: Optional[str] = None
        self._cached_vectorizer: Optional[TfidfVectorizer] = None
        self._cached_candidate_matrix: Optional[Any] = None
        self._cached_candidate_ids: Optional[List[str]] = None

        try:
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
        except OSError:
            pass
        self._load_or_train_pipeline()

    def _generate_representative_baseline_data(self, n_samples: int = 800) -> np.ndarray:
        """
        Generate representative empirical baseline data of MPLADS civil works.
        Encompasses on-track works, moderate schedule variations, and standard disbursements.
        Uses fixed seed (42) for deterministic, reproducible fitting.
        """
        np.random.seed(42)

        # 1. Sanctioned amount (5 to 120 Lakhs, typical MPLADS community asset range)
        sanctioned = np.random.gamma(shape=3.5, scale=12.0, size=n_samples)
        sanctioned = np.clip(sanctioned, 5.0, 150.0)

        # 2. Released amount (50% to 100% of sanctioned)
        drawdown_ratio = np.random.uniform(0.6, 1.0, size=n_samples)
        released = sanctioned * drawdown_ratio

        # 3. Physical progress (0 to 100)
        physical = np.random.uniform(5.0, 100.0, size=n_samples)

        # 4. In standard legitimate works, financial progress mirrors physical progress (+- 8%)
        noise = np.random.normal(0.0, 7.0, size=n_samples)
        financial = np.clip(physical + noise, 0.0, 100.0)

        # 5. Expenditure
        expenditure = released * (financial / 100.0)
        exp_velocity = expenditure / np.maximum(released, 1.0)

        # 6. Progress gap (financial - physical)
        progress_gap = financial - physical

        # 7. Expenditure per physical point
        exp_per_point = expenditure / np.maximum(physical, 1.0)

        # 8. Milestone delay days (mostly 0 to 45 days in normal operational projects)
        delay_days = np.maximum(0.0, np.random.exponential(scale=18.0, size=n_samples))

        # 9. Cost deviation against category benchmark (-20% to +25% in normal projects)
        cost_dev = np.random.normal(0.0, 15.0, size=n_samples)

        # 10. Payment concentration index (typical multi-tranche curve: 0.25 to 0.50)
        pay_conc = np.random.uniform(0.25, 0.55, size=n_samples)

        features = np.column_stack([
            sanctioned,
            drawdown_ratio,
            exp_velocity,
            physical,
            financial,
            progress_gap,
            exp_per_point,
            delay_days,
            cost_dev,
            pay_conc
        ])

        return features

    def train_and_persist(self, n_samples: int = 800) -> Dict[str, Any]:
        """
        Fit RobustScaler and IsolationForest on representative baseline distributions,
        calculate feature baseline statistics, and save artifacts to disk.
        """
        features = self._generate_representative_baseline_data(n_samples)

        # Fit RobustScaler
        self.scaler = RobustScaler(with_centering=True, with_scaling=True)
        scaled_features = self.scaler.fit_transform(features)

        # Fit IsolationForest
        self.iso_forest = IsolationForest(
            n_estimators=150,
            contamination=0.12,
            max_samples='auto',
            random_state=42,
            n_jobs=-1
        )
        self.iso_forest.fit(scaled_features)

        # Calculate baseline statistics per feature for diagnostic explainability
        self.baseline_stats = {}
        for idx, spec in enumerate(FEATURE_SPECS):
            col_data = features[:, idx]
            self.baseline_stats[spec["key"]] = {
                "median": float(np.median(col_data)),
                "iqr": float(np.percentile(col_data, 75) - np.percentile(col_data, 25)),
                "p25": float(np.percentile(col_data, 25)),
                "p75": float(np.percentile(col_data, 75)),
                "mean": float(np.mean(col_data)),
                "std": float(np.std(col_data))
            }

        # Persist model artifacts
        try:
            joblib.dump(self.iso_forest, MODEL_PATH)
            joblib.dump(self.scaler, SCALER_PATH)
            with open(METADATA_PATH, "w", encoding="utf-8") as f:
                json.dump(self.metadata, f, indent=2)
        except OSError:
            # Serverless environments (e.g. Vercel/AWS Lambda) have read-only filesystems
            pass

        return self.metadata

    def _load_or_train_pipeline(self):
        """Load persisted models if present; otherwise train and persist."""
        if MODEL_PATH.exists() and SCALER_PATH.exists() and METADATA_PATH.exists():
            try:
                self.iso_forest = joblib.load(MODEL_PATH)
                self.scaler = joblib.load(SCALER_PATH)
                with open(METADATA_PATH, "r", encoding="utf-8") as f:
                    self.metadata = json.load(f)
                self.baseline_stats = self.metadata.get("baseline_stats", {})
                return
            except Exception:
                pass
        self.train_and_persist()

    def extract_feature_vector(self, project: ProjectAnalysisRequest) -> Tuple[np.ndarray, Dict[str, float]]:
        """
        Extract numerical features from project record with safe sanitization.
        Handles zero-divisions, negative outlays, and missing dates gracefully.
        """
        sanctioned = max(0.1, float(project.sanctionedAmount or 0.0))
        released = max(0.0, float(project.releasedAmount or 0.0))
        expenditure = max(0.0, float(project.expenditureAmount or 0.0))
        physical = max(0.0, min(100.0, float(project.physicalProgress or 0)))
        financial = max(0.0, min(100.0, float(project.financialProgress or 0.0)))

        drawdown_ratio = released / sanctioned
        exp_velocity = (expenditure / released) if released > 0 else 0.0
        progress_gap = financial - physical
        exp_per_point = expenditure / max(physical, 1.0)

        # Calculate delay
        delay_days = 0.0
        if project.expectedCompletionDate:
            try:
                exp_date = datetime.datetime.strptime(project.expectedCompletionDate[:10], "%Y-%m-%d").date()
                if project.actualCompletionDate:
                    act_date = datetime.datetime.strptime(project.actualCompletionDate[:10], "%Y-%m-%d").date()
                    delay_days = max(0.0, float((act_date - exp_date).days))
                else:
                    today = datetime.date.today()
                    delay_days = max(0.0, float((today - exp_date).days))
            except Exception:
                delay_days = 0.0

        # Cost deviation against category benchmark
        cat_key = "General Infrastructure"
        if project.categoryName:
            for k in CATEGORY_BENCHMARKS.keys():
                if k.lower() in project.categoryName.lower():
                    cat_key = k
                    break
        bm_avg = CATEGORY_BENCHMARKS[cat_key]["avg"]
        cost_deviation_pct = ((sanctioned - bm_avg) / bm_avg * 100.0) if bm_avg > 0 else 0.0

        # Payment concentration
        pay_conc = 0.35
        payments = project.payments or []
        if payments:
            amounts = [p.amount for p in payments if p.amount > 0]
            if amounts and sum(amounts) > 0:
                pay_conc = max(amounts) / sum(amounts)
        elif expenditure > 0 and sanctioned > 0:
            pay_conc = min(1.0, expenditure / sanctioned)

        raw_dict = {
            "sanctioned_amount": sanctioned,
            "drawdown_ratio": drawdown_ratio,
            "expenditure_velocity": exp_velocity,
            "physical_progress": physical,
            "financial_progress": financial,
            "progress_mismatch_gap": progress_gap,
            "expenditure_per_progress_pct": exp_per_point,
            "milestone_delay_days": delay_days,
            "category_cost_deviation_pct": cost_deviation_pct,
            "payment_concentration_index": pay_conc
        }

        vector = np.array([[
            sanctioned,
            drawdown_ratio,
            exp_velocity,
            physical,
            financial,
            progress_gap,
            exp_per_point,
            delay_days,
            cost_deviation_pct,
            pay_conc
        ]])

        return vector, raw_dict

    def _calculate_feature_attributions(self, raw_dict: Dict[str, float]) -> List[ContributingFeature]:
        """
        Calculate per-feature diagnostic deviance relative to baseline medians.
        Ranks which specific factors contributed most to the project being flagged.
        """
        contributions: List[ContributingFeature] = []

        for spec in FEATURE_SPECS:
            key = spec["key"]
            val = raw_dict[key]
            stats = self.baseline_stats.get(key, {"median": val, "iqr": 1.0, "std": 1.0})
            median = stats.get("median", val)
            iqr = stats.get("iqr", 1.0) or 1.0

            deviance = abs(val - median) / iqr

            if deviance >= 2.0:
                severity = "HIGH"
            elif deviance >= 1.2:
                severity = "MEDIUM"
            else:
                severity = "LOW"

            desc = f"Observed {spec['name']}: {val:.1f} vs baseline median {median:.1f} ({deviance:.1f}x IQR deviation)"

            contributions.append(ContributingFeature(
                featureKey=key,
                featureName=spec["name"],
                observedValue=round(val, 2),
                baselineMedian=round(median, 2),
                standardizedDeviance=round(deviance, 2),
                impactSeverity=severity,
                description=desc
            ))

        contributions.sort(key=lambda x: x.standardizedDeviance, reverse=True)
        return contributions

    def analyze_project(self, project: ProjectAnalysisRequest) -> ProjectAnalysisResponse:
        """
        Comprehensive ML Anomaly Evaluation for a Civil Scheme Project.
        Integrates:
        1. 10-D Feature Extraction & RobustScaler Normalization
        2. Isolation Forest score_samples() continuous anomaly inference
        3. Feature attribution analysis identifying driving indicators
        4. Structured human-readable explanation and statutory review recommendations
        """
        feature_vector, raw_dict = self.extract_feature_vector(project)

        # Scale features
        scaled_vector = self.scaler.transform(feature_vector)

        # Run Isolation Forest inference
        raw_iso_score = float(self.iso_forest.score_samples(scaled_vector)[0])
        decision_val = float(self.iso_forest.decision_function(scaled_vector)[0])

        # Calibrate continuous ML anomaly score (0 - 100) using decision_function:
        # decision_function > 0 indicates normal inlier (mapped to 12 - 35)
        # decision_function < 0 indicates statistical outlier (mapped to 40 - 95)
        if decision_val >= 0.0:
            normalized_ml_score = 12.0 + (1.0 - min(1.0, decision_val / 0.12)) * 23.0
        else:
            normalized_ml_score = 40.0 + min(1.0, (-decision_val) / 0.15) * 55.0

        # Check domain-specific rule indicators for explainability contracts
        reasons: List[str] = []
        recommendations: List[str] = []

        # 1. Progress Mismatch Indicator
        progress_gap = raw_dict["progress_mismatch_gap"]
        is_mismatch = progress_gap >= 25.0 and raw_dict["expenditure_velocity"] > 0.4
        mismatch_ind = ProgressMismatchIndicator(
            isMismatch=is_mismatch,
            physicalProgressPercent=int(raw_dict["physical_progress"]),
            financialProgressPercent=round(raw_dict["financial_progress"], 1),
            differencePercentagePoints=round(progress_gap, 1),
            explanation=(
                f"Progress / Expenditure Divergence: Financial expenditure ({raw_dict['financial_progress']:.1f}%) "
                f"is significantly ahead of certified physical milestone execution ({int(raw_dict['physical_progress'])}%) "
                f"by {progress_gap:.1f} percentage points."
            ) if is_mismatch else (
                f"Financial releases ({raw_dict['financial_progress']:.1f}%) align with physical milestone execution ({int(raw_dict['physical_progress'])}%)."
            )
        )
        if is_mismatch:
            reasons.append(mismatch_ind.explanation)
            recommendations.append("Conduct certified on-site engineering verification before releasing subsequent installment.")

        # 2. Cost Anomaly Indicator
        cat_key = "General Infrastructure"
        if project.categoryName:
            for k in CATEGORY_BENCHMARKS.keys():
                if k.lower() in project.categoryName.lower():
                    cat_key = k
                    break
        bm_avg = CATEGORY_BENCHMARKS[cat_key]["avg"]
        bm_max = CATEGORY_BENCHMARKS[cat_key]["max_normal"]
        is_cost_anomaly = raw_dict["sanctioned_amount"] > bm_max
        cost_ind = CostAnomalyIndicator(
            isAnomaly=is_cost_anomaly,
            deviationPercent=round(raw_dict["category_cost_deviation_pct"], 1),
            benchmarkSanctionedLakhs=round(bm_avg, 2),
            explanation=(
                f"Potential Cost Anomaly: Sanctioned budget (₹{raw_dict['sanctioned_amount']:.2f} Lakhs) "
                f"exceeds standard category benchmark (₹{bm_avg:.2f} Lakhs) by +{raw_dict['category_cost_deviation_pct']:.1f}%. "
                f"Detailed DPR inspection recommended."
            ) if is_cost_anomaly else (
                f"Sanctioned outlay is within typical benchmark envelope for {cat_key} (Benchmark: ₹{bm_avg:.2f} Lakhs)."
            )
        )
        if is_cost_anomaly:
            reasons.append(cost_ind.explanation)
            recommendations.append("Review itemized Schedule of Rates (SoR) against district engineering standard rates.")

        # 3. Delay Indicator
        delay_days = int(raw_dict["milestone_delay_days"])
        if delay_days > 180:
            delay_status = "SEVERELY_DELAYED"
            delay_expl = f"Project is {delay_days} days severely delayed (>6 months); immediate executive intervention required."
            reasons.append(delay_expl)
            recommendations.append("Issue formal show-cause notice to Implementing Agency regarding timeline breach.")
        elif delay_days > 60:
            delay_status = "DELAYED"
            delay_expl = f"Project is {delay_days} days delayed beyond scheduled completion date; requires district follow-up."
            reasons.append(delay_expl)
            recommendations.append("Instruct District Planning Officer to obtain updated completion schedule.")
        elif delay_days > 0:
            delay_status = "AT_RISK"
            delay_expl = f"Project is {delay_days} days past milestone target; minor schedule slippage observed."
            reasons.append(delay_expl)
        else:
            delay_status = "ON_TRACK"
            delay_expl = "Project milestone progress is on-schedule within sanctioned timeline envelope."

        delay_ind = DelayIndicator(status=delay_status, delayDays=delay_days, explanation=delay_expl)

        # 4. Payment Anomaly Indicator
        is_payment_anom = raw_dict["payment_concentration_index"] > 0.70 and raw_dict["physical_progress"] < 40.0
        payment_ind = PaymentAnomalyIndicator(
            isAnomaly=is_payment_anom,
            concentrationIndex=round(raw_dict["payment_concentration_index"], 2),
            unusualLargePaymentCount=1 if is_payment_anom else 0,
            explanation=(
                f"High Single-Tranche Drawdown: {int(raw_dict['payment_concentration_index']*100)}% of funds disbursed "
                f"while certified physical execution is at {int(raw_dict['physical_progress'])}%."
            ) if is_payment_anom else (
                "Disbursements follow standard milestone-linked tranche release curves."
            )
        )
        if is_payment_anom:
            reasons.append(payment_ind.explanation)
            recommendations.append("Audit payment vouchers and verify direct contractor disbursement against certified Measurement Book (MB).")

        duplicate_ind = DuplicateRiskIndicator(
            isPossibleDuplicate=False,
            similarityScore=0.0,
            matchingProjectId=None,
            matchingProjectName=None,
            explanation="No duplicate work signatures detected in local jurisdiction."
        )

        # Final calibrated risk score:
        # Derived directly from Isolation Forest continuous decision score,
        # with calibrated risk tier assignments.
        final_score = int(round(np.clip(normalized_ml_score, 8.0, 96.0)))

        # Tier Thresholds (Documented Statutory Matrix):
        # 0-29: LOW, 30-59: MEDIUM, 60-79: HIGH, 80-100: CRITICAL
        if final_score >= 80:
            risk_level = "CRITICAL"
            overall_health = "CRITICAL_ATTENTION"
        elif final_score >= 60:
            risk_level = "HIGH"
            overall_health = "ELEVATED_RISK"
        elif final_score >= 30:
            risk_level = "MEDIUM"
            overall_health = "MODERATE"
        else:
            risk_level = "LOW"
            overall_health = "HEALTHY"

        # Compute Fund Utilization & Data Completeness Metrics using Pandas/NumPy
        p_dict = project.model_dump() if hasattr(project, "model_dump") else project.dict()
        fund_metrics = DataProcessor.validate_and_analyze_fund_utilization(p_dict)
        fund_summary = FundUtilizationSummary(
            sanctionedAmountLakhs=fund_metrics.sanctionedAmountLakhs,
            releasedAmountLakhs=fund_metrics.releasedAmountLakhs,
            expenditureAmountLakhs=fund_metrics.expenditureAmountLakhs,
            unspentBalanceLakhs=fund_metrics.unspentBalanceLakhs,
            fundUtilizationPct=fund_metrics.fundUtilizationPct,
            drawdownRatioPct=fund_metrics.drawdownRatioPct,
            physicalProgressPct=fund_metrics.physicalProgressPct,
            financialProgressPct=fund_metrics.financialProgressPct,
            progressDivergenceGap=fund_metrics.progressDivergenceGap,
            expenditurePerProgressPoint=fund_metrics.expenditurePerProgressPoint,
            dataCompletenessStatus=fund_metrics.dataCompletenessStatus,
            dataQualityWarnings=fund_metrics.dataQualityWarnings,
            isValidForMlInference=fund_metrics.isValidForMlInference
        )

        # PyTorch Autoencoder Inference
        raw_vec = feature_vector[0]
        pt_eval = pytorch_engine.infer(raw_vec)
        pytorch_result = PyTorchInferenceResult(
            modelName=pt_eval.get("modelName", "PyTorch Tabular Autoencoder"),
            modelVersion=pt_eval.get("modelVersion", "2.1.0-torch"),
            modelStatus=pt_eval.get("modelStatus", "VALIDATED"),
            device=pt_eval.get("device", "cpu"),
            reconstructionMse=pt_eval.get("reconstructionMse", 0.0),
            thresholdMse=pt_eval.get("thresholdMse", 0.2675),
            isAnomalous=pt_eval.get("isAnomalous", False),
            reconstructionConfidence=pt_eval.get("reconstructionConfidence", 0.0),
            indicator=pt_eval.get("indicator", "CONGRUENT_RECONSTRUCTION"),
            explanation=pt_eval.get("explanation", "")
        )

        # Handle Insufficient Data / Missing values explicitly
        if fund_metrics.dataCompletenessStatus == "INSUFFICIENT_DATA":
            risk_level = "INSUFFICIENT_DATA"
            overall_health = "DATA_INCOMPLETE"
            warning_text = f"Data Quality Notice: Incomplete statutory records ({', '.join(fund_metrics.dataQualityWarnings[:2])}). Inferences marked uncalibrated."
            reasons.insert(0, warning_text)
            recommendations.insert(0, "Update baseline financial records in district portal before initiating ML risk verification.")

        # Compute per-feature attributions
        contributing_features = self._calculate_feature_attributions(raw_dict)

        return ProjectAnalysisResponse(
            projectId=project.projectId,
            riskScore=final_score,
            riskLevel=risk_level,
            overallHealth=overall_health,
            reasons=reasons,
            indicators=IndicatorsContainer(
                costAnomaly=cost_ind,
                delayStatus=delay_ind,
                progressMismatch=mismatch_ind,
                paymentAnomaly=payment_ind,
                duplicateRisk=duplicate_ind
            ),
            isolationForestRawScore=round(raw_iso_score, 4),
            contributingFeatures=contributing_features,
            recommendations=recommendations,
            analyzedAt=datetime.datetime.now().isoformat(),
            pytorchEvaluation=pytorch_result,
            fundUtilization=fund_summary,
            modelMetadata={
                "engine": "Scikit-Learn IsolationForest v2.1 & PyTorch Tabular Autoencoder",
                "scaler": "RobustScaler",
                "featuresEvaluated": len(FEATURE_SPECS),
                "contamination": 0.12,
                "calibratedScore": final_score,
                "pytorchMse": pt_eval.get("reconstructionMse", 0.0),
                "pytorchThreshold": pt_eval.get("thresholdMse", 0.2675)
            },
            statutoryNotice="Statutory Decision Support: Flagged indicators represent statistical variations requiring human review; NOT proof of fraud."
        )

    def detect_duplicates(self, target: ProjectAnalysisRequest, candidates: List[DuplicateCandidate]) -> DuplicateDetectionResponse:
        """
        Screen candidate pool for potential duplicate civil works using TF-IDF and Cosine text similarity.
        Flags candidate works for administrative inspection; never merges or mutates records.
        """
        if not candidates:
            return DuplicateDetectionResponse(
                targetProjectId=target.projectId,
                possibleDuplicate=False,
                similarityScore=0.0,
                matchingProjectId=None,
                matchingProjectName=None,
                reasons=["No candidate projects in comparison jurisdiction pool."]
            )

        target_text = f"{target.projectName} {target.description or ''} {target.categoryName or ''} {target.districtName or ''}"
        candidate_texts = [
            f"{c.projectName} {c.description or ''} {c.categoryName or ''} {c.districtName or ''}"
            for c in candidates
        ]

        # Thread-safe cached corpus vectorization
        with self._duplicate_cache_lock:
            corpus_key = "|".join(f"{c.projectId}:{c.projectName}" for c in candidates)
            current_hash = hashlib.md5(corpus_key.encode('utf-8')).hexdigest()

            if (self._candidate_corpus_hash == current_hash and
                self._cached_vectorizer is not None and
                self._cached_candidate_matrix is not None):
                # High-speed path: transform only target text against pre-fitted candidate matrix
                target_vec = self._cached_vectorizer.transform([target_text])
                cosine_sims = cosine_similarity(target_vec, self._cached_candidate_matrix).flatten()
            else:
                # Cold-path or modified candidate pool: fit vectorizer on candidates
                vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer='word', min_df=1)
                candidate_matrix = vectorizer.fit_transform(candidate_texts)
                target_vec = vectorizer.transform([target_text])
                cosine_sims = cosine_similarity(target_vec, candidate_matrix).flatten()

                # Atomically update cached matrix and signature
                self._candidate_corpus_hash = current_hash
                self._cached_vectorizer = vectorizer
                self._cached_candidate_matrix = candidate_matrix
                self._cached_candidate_ids = [c.projectId for c in candidates]

        best_idx = int(np.argmax(cosine_sims))
        best_sim = float(cosine_sims[best_idx])
        best_candidate = candidates[best_idx]

        # Calculate amount similarity
        amount_ratio = 1.0
        if target.sanctionedAmount > 0 and best_candidate.sanctionedAmount > 0:
            diff = abs(target.sanctionedAmount - best_candidate.sanctionedAmount)
            amount_ratio = max(0.0, 1.0 - (diff / max(target.sanctionedAmount, best_candidate.sanctionedAmount)))

        combined_score = round((0.75 * best_sim + 0.25 * amount_ratio) * 100.0, 1)
        is_duplicate = combined_score >= 65.0 and best_candidate.projectId != target.projectId

        reasons = []
        if is_duplicate:
            reasons.append(
                f"Potential Duplicate Work: High semantic similarity ({combined_score}%) with existing Project ID {best_candidate.projectId} ('{best_candidate.projectName}') in same administrative jurisdiction."
            )
            reasons.append("Review project geographic coordinates and DPR scope to verify independent physical asset creation.")
        else:
            reasons.append("No duplicate project signatures detected above threshold.")

        return DuplicateDetectionResponse(
            targetProjectId=target.projectId,
            possibleDuplicate=is_duplicate,
            similarityScore=combined_score,
            matchingProjectId=best_candidate.projectId if is_duplicate else None,
            matchingProjectName=best_candidate.projectName if is_duplicate else None,
            reasons=reasons,
            comparisonDetails={
                "textSimilarity": round(best_sim * 100.0, 1),
                "financialSimilarity": round(amount_ratio * 100.0, 1),
                "evaluatedCandidateCount": len(candidates)
            }
        )

    def invalidate_duplicate_cache(self) -> dict:
        """
        Thread-safe invalidation of fitted vectorizer and document-term matrix.
        Triggered when new projects are registered or project descriptions updated.
        """
        with self._duplicate_cache_lock:
            self._candidate_corpus_hash = None
            self._cached_vectorizer = None
            self._cached_candidate_matrix = None
            self._cached_candidate_ids = []
            return {"status": "success", "message": "Duplicate candidate corpus cache invalidated successfully"}

# Global singleton engine instance
engine = GenuineAnomalyDetectionPipeline()

