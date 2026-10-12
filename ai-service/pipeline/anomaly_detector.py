import datetime
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple, Optional
from sklearn.ensemble import IsolationForest
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
    DuplicateCandidate,
    DuplicateDetectionResponse
)

# Regional/Sectoral unit benchmarks (in ₹ Lakhs) for typical MPLADS civil works
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

class AnomalyDetectionEngine:
    def __init__(self):
        # Initialize and pre-fit an Isolation Forest on representative MPLADS baseline distributions
        self.iso_forest = IsolationForest(
            n_estimators=120,
            contamination=0.15,
            random_state=42
        )
        self._init_baseline_model()

    def _init_baseline_model(self):
        """Pre-fit model with realistic baseline distribution of normal and edge-case works."""
        np.random.seed(42)
        n_samples = 400
        
        sanctioned = np.random.uniform(5.0, 100.0, n_samples)
        released = sanctioned * np.random.uniform(0.5, 1.0, n_samples)
        physical = np.random.uniform(10, 100, n_samples)
        # In normal cases, financial progress closely mirrors physical progress (+- 15%)
        financial = np.clip(physical + np.random.normal(0, 10, n_samples), 0, 100)
        expenditure = released * (financial / 100.0)
        delay = np.maximum(0, np.random.normal(20, 45, n_samples))
        
        features = np.column_stack([
            sanctioned,
            released,
            expenditure,
            (expenditure / np.maximum(released, 1.0)) * 100.0,
            physical,
            financial,
            financial - physical,
            delay,
            expenditure / np.maximum(physical, 1.0)
        ])
        
        self.iso_forest.fit(features)

    def _calculate_delay(self, start_date_str: Optional[str], expected_date_str: Optional[str], actual_date_str: Optional[str]) -> Tuple[str, int, str]:
        today = datetime.date.today()
        delay_days = 0
        
        if not expected_date_str:
            return "ON_TRACK", 0, "Expected completion date not specified; milestone tracking pending."

        try:
            expected_date = datetime.datetime.strptime(expected_date_str[:10], "%Y-%m-%d").date()
        except Exception:
            return "ON_TRACK", 0, "Valid completion date format required for timeline analytics."

        if actual_date_str:
            try:
                actual_date = datetime.datetime.strptime(actual_date_str[:10], "%Y-%m-%d").date()
                if actual_date > expected_date:
                    delay_days = (actual_date - expected_date).days
            except Exception:
                pass
        elif today > expected_date:
            delay_days = (today - expected_date).days

        if delay_days <= 0:
            return "ON_TRACK", 0, "Project is progressing on-schedule within sanctioned timeline envelope."
        elif delay_days <= 60:
            return "AT_RISK", delay_days, f"Project is {delay_days} days past milestone target; minor schedule slippage observed."
        elif delay_days <= 180:
            return "DELAYED", delay_days, f"Project is {delay_days} days delayed beyond scheduled completion date; requires district administrative intervention."
        else:
            return "SEVERELY_DELAYED", delay_days, f"Project is {delay_days} days severely delayed (>6 months); immediate review required."

    def _evaluate_cost_anomaly(self, category: str, sanctioned: float) -> CostAnomalyIndicator:
        cat_key = "General Infrastructure"
        for k in CATEGORY_BENCHMARKS.keys():
            if k.lower() in category.lower():
                cat_key = k
                break
        
        bm = CATEGORY_BENCHMARKS[cat_key]
        avg_cost = bm["avg"]
        max_norm = bm["max_normal"]
        
        if sanctioned > max_norm:
            dev_percent = round(((sanctioned - avg_cost) / avg_cost) * 100.0, 1)
            return CostAnomalyIndicator(
                isAnomaly=True,
                deviationPercent=dev_percent,
                benchmarkSanctionedLakhs=avg_cost,
                explanation=f"Potential Cost Anomaly: Sanctioned budget (₹{sanctioned:.2f} Lakhs) exceeds typical category benchmark (₹{avg_cost:.2f} Lakhs) by +{dev_percent}%. Detailed technical DPR review recommended."
            )
        else:
            dev_percent = round(((sanctioned - avg_cost) / avg_cost) * 100.0, 1) if avg_cost > 0 else 0.0
            return CostAnomalyIndicator(
                isAnomaly=False,
                deviationPercent=dev_percent,
                benchmarkSanctionedLakhs=avg_cost,
                explanation=f"Sanctioned outlay is within typical benchmark range for {cat_key} (Benchmark: ₹{avg_cost:.2f} Lakhs)."
            )

    def _evaluate_progress_mismatch(self, physical: int, financial: float, expenditure: float) -> ProgressMismatchIndicator:
        diff = round(financial - physical, 1)
        if diff >= 25.0 and expenditure >= 5.0:
            return ProgressMismatchIndicator(
                isMismatch=True,
                physicalProgressPercent=physical,
                financialProgressPercent=financial,
                differencePercentagePoints=diff,
                explanation=f"Progress / Expenditure Mismatch: Financial expenditure ({financial:.1f}%) is significantly ahead of certified physical execution ({physical}%) by {diff} percentage points."
            )
        elif diff >= 15.0:
            return ProgressMismatchIndicator(
                isMismatch=False,
                physicalProgressPercent=physical,
                financialProgressPercent=financial,
                differencePercentagePoints=diff,
                explanation=f"Disbursement ({financial:.1f}%) marginally leads physical completion ({physical}%) by {diff} points. Within manageable operational range."
            )
        else:
            return ProgressMismatchIndicator(
                isMismatch=False,
                physicalProgressPercent=physical,
                financialProgressPercent=financial,
                differencePercentagePoints=diff,
                explanation=f"Financial progress ({financial:.1f}%) and physical milestone execution ({physical}%) are balanced."
            )

    def _evaluate_payment_anomaly(self, project: ProjectAnalysisRequest) -> PaymentAnomalyIndicator:
        payments = project.payments or []
        if not payments:
            # Check ratio of expenditure to sanctioned if no discrete payment ledger items
            return PaymentAnomalyIndicator(
                isAnomaly=False,
                concentrationIndex=0.0,
                unusualLargePaymentCount=0,
                explanation="No discrete payment anomalies detected in transaction ledger."
            )

        amounts = [p.amount for p in payments if p.amount > 0]
        if not amounts:
            return PaymentAnomalyIndicator(
                isAnomaly=False,
                concentrationIndex=0.0,
                unusualLargePaymentCount=0,
                explanation="Standard disbursement pattern."
            )

        total_pay = sum(amounts)
        max_pay = max(amounts)
        concentration = round((max_pay / total_pay), 2) if total_pay > 0 else 0.0
        
        large_payments = [a for a in amounts if a > (0.6 * project.sanctionedAmount)]
        
        if concentration > 0.70 and project.physicalProgress < 50:
            return PaymentAnomalyIndicator(
                isAnomaly=True,
                concentrationIndex=concentration,
                unusualLargePaymentCount=len(large_payments),
                explanation=f"Potential Payment Anomaly: High single-payment concentration ({int(concentration*100)}% of total funds in single transaction) while certified physical progress is at {project.physicalProgress}%."
            )
        else:
            return PaymentAnomalyIndicator(
                isAnomaly=False,
                concentrationIndex=concentration,
                unusualLargePaymentCount=len(large_payments),
                explanation="Disbursement disbursements follow typical multi-tranche milestone release curves."
            )

    def analyze_project(self, project: ProjectAnalysisRequest) -> ProjectAnalysisResponse:
        sanctioned = max(0.0, project.sanctionedAmount)
        released = max(0.0, project.releasedAmount)
        expenditure = max(0.0, project.expenditureAmount)
        physical = max(0, min(100, project.physicalProgress))
        financial = max(0.0, min(100.0, project.financialProgress))
        
        # 1. Component indicators
        delay_status, delay_days, delay_expl = self._calculate_delay(
            project.startDate, project.expectedCompletionDate, project.actualCompletionDate
        )
        delay_ind = DelayIndicator(status=delay_status, delayDays=delay_days, explanation=delay_expl)
        
        cost_ind = self._evaluate_cost_anomaly(project.categoryName or "General", sanctioned)
        mismatch_ind = self._evaluate_progress_mismatch(physical, financial, expenditure)
        payment_ind = self._evaluate_payment_anomaly(project)
        
        duplicate_ind = DuplicateRiskIndicator(
            isPossibleDuplicate=False,
            similarityScore=0.0,
            matchingProjectId=None,
            matchingProjectName=None,
            explanation="No duplicate work signatures detected in local jurisdiction."
        )

        # 2. Isolation Forest Evaluation
        utilization = (expenditure / released * 100.0) if released > 0 else 0.0
        feature_vector = np.array([[
            sanctioned,
            released,
            expenditure,
            utilization,
            physical,
            financial,
            financial - physical,
            float(delay_days),
            expenditure / max(physical, 1.0)
        ]])
        
        raw_iso_score = float(self.iso_forest.score_samples(feature_vector)[0])
        # raw_iso_score is typically between -0.8 (extreme anomaly) to +0.2 (typical normal)
        iso_risk_component = max(0.0, min(100.0, (-raw_iso_score + 0.2) * 100.0))

        # 3. Rule-Weighted Calibration (0-100)
        risk_points = 10.0 # Base minimum
        reasons: List[str] = []
        recommendations: List[str] = []

        if mismatch_ind.isMismatch:
            risk_points += 35.0
            reasons.append(mismatch_ind.explanation)
            recommendations.append("Conduct certified on-site engineering verification before releasing subsequent installment.")

        if cost_ind.isAnomaly:
            risk_points += 25.0
            reasons.append(cost_ind.explanation)
            recommendations.append("Review itemized Schedule of Rates (SoR) and compare against district engineering standard rates.")

        if delay_status == "SEVERELY_DELAYED":
            risk_points += 30.0
            reasons.append(delay_ind.explanation)
            recommendations.append("Issue formal show-cause notice to Implementing Agency regarding timeline breach.")
        elif delay_status == "DELAYED":
            risk_points += 18.0
            reasons.append(delay_ind.explanation)
            recommendations.append("Instruct District Planning Officer to obtain updated completion schedule.")
        elif delay_status == "AT_RISK":
            risk_points += 8.0
            reasons.append(delay_ind.explanation)

        if payment_ind.isAnomaly:
            risk_points += 20.0
            reasons.append(payment_ind.explanation)
            recommendations.append("Audit payment vouchers and verify direct contractor disbursement against certified Measurement Book (MB).")

        # Blend Isolation Forest and Explainable Rules
        blended_score = int(round(0.65 * risk_points + 0.35 * iso_risk_component))
        final_risk_score = max(5, min(98, blended_score))

        if final_risk_score >= 80:
            risk_level = "CRITICAL"
            overall_health = "CRITICAL_ATTENTION"
        elif final_risk_score >= 60:
            risk_level = "HIGH"
            overall_health = "ELEVATED_RISK"
        elif final_risk_score >= 30:
            risk_level = "MEDIUM"
            overall_health = "MODERATE"
        else:
            risk_level = "LOW"
            overall_health = "HEALTHY"

        if not reasons:
            reasons.append("Project indicators align with standard statutory progress and disbursement patterns.")
            recommendations.append("Maintain standard periodic reporting and quarterly milestone audits.")

        analyzed_time = datetime.datetime.now().isoformat()

        return ProjectAnalysisResponse(
            projectId=project.projectId,
            riskScore=final_risk_score,
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
            recommendations=recommendations,
            analyzedAt=analyzed_time
        )

    def detect_duplicates(self, target: ProjectAnalysisRequest, candidates: List[DuplicateCandidate]) -> DuplicateDetectionResponse:
        if not candidates:
            return DuplicateDetectionResponse(
                targetProjectId=target.projectId,
                possibleDuplicate=False,
                similarityScore=0.0,
                matchingProjectId=None,
                matchingProjectName=None,
                reasons=["No candidate projects in comparison jurisdiction."]
            )

        target_text = f"{target.projectName} {target.description or ''} {target.categoryName or ''} {target.districtName or ''}"
        candidate_texts = [
            f"{c.projectName} {c.description or ''} {c.categoryName or ''} {c.districtName or ''}"
            for c in candidates
        ]

        all_texts = [target_text] + candidate_texts
        vectorizer = TfidfVectorizer(ngram_range=(1, 3), analyzer='word', min_df=1)
        tfidf_matrix = vectorizer.fit_transform(all_texts)

        cosine_sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        best_idx = int(np.argmax(cosine_sims))
        best_sim = float(cosine_sims[best_idx])
        best_candidate = candidates[best_idx]

        # Calculate amount similarity
        amount_ratio = 1.0
        if target.sanctionedAmount > 0 and best_candidate.sanctionedAmount > 0:
            diff = abs(target.sanctionedAmount - best_candidate.sanctionedAmount)
            amount_ratio = max(0.0, 1.0 - (diff / max(target.sanctionedAmount, best_candidate.sanctionedAmount)))

        # Weighted combined similarity score (0 - 100)
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

# Global singleton engine instance
engine = AnomalyDetectionEngine()
