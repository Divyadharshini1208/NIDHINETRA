"""
NIDHINETRA — Data Processing, Validation & Feature Engineering Pipeline
Utilizes Pandas and NumPy for robust, missing-value-aware civil project analysis.
Complies with official MPLADS accounting conventions and statutory guidelines.
"""

import math
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import pandas as pd
from pydantic import BaseModel

# Canonical feature schema shared across Scikit-Learn IsolationForest and PyTorch Tabular Autoencoder
FEATURE_COLUMNS = [
    "sanctioned_amount",
    "drawdown_ratio",
    "expenditure_velocity",
    "physical_progress",
    "financial_progress",
    "progress_mismatch_gap",
    "expenditure_per_progress_pct",
    "milestone_delay_days",
    "category_cost_deviation_pct",
    "payment_concentration_index"
]

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


class FundUtilizationMetrics(BaseModel):
    """
    Structured results of fund utilization analysis for a development work.
    """
    sanctionedAmountLakhs: float
    releasedAmountLakhs: float
    expenditureAmountLakhs: float
    unspentBalanceLakhs: float
    fundUtilizationPct: float
    drawdownRatioPct: float
    physicalProgressPct: float
    financialProgressPct: float
    progressDivergenceGap: float
    expenditurePerProgressPoint: float
    dataCompletenessStatus: str  # ROBUST, MODERATE, INSUFFICIENT_DATA
    dataQualityWarnings: List[str]
    isValidForMlInference: bool = True


class DataProcessor:
    """
    Pure data preparation and feature engineering pipeline using Pandas and NumPy.
    Ensures identical, reproducible transformation for both model training and live API inference.
    """

    @staticmethod
    def validate_and_analyze_fund_utilization(project_data: Dict[str, Any]) -> FundUtilizationMetrics:
        """
        Calculates fund utilization metrics, unspent balance, and expenditure-to-progress ratios.
        Applies explicit guardrails for zero denominators, negative values, and missing fields.
        """
        warnings: List[str] = []
        is_valid = True

        raw_sanctioned = project_data.get("sanctionedAmount")
        raw_released = project_data.get("releasedAmount")
        raw_expenditure = project_data.get("expenditureAmount")
        raw_physical = project_data.get("physicalProgress")
        raw_financial = project_data.get("financialProgress")

        # 1. Sanctioned Amount Validation (Denominator check)
        if raw_sanctioned is None or pd.isna(raw_sanctioned):
            warnings.append("Sanctioned amount is missing or null.")
            sanctioned = 0.0
            is_valid = False
        else:
            try:
                sanctioned = float(raw_sanctioned)
                if sanctioned < 0:
                    warnings.append(f"Invalid negative sanctioned amount: ₹{sanctioned:.2f}L.")
                    sanctioned = 0.0
                    is_valid = False
                elif sanctioned == 0.0:
                    warnings.append("Sanctioned amount is zero; cannot compute utilization percentage.")
            except (ValueError, TypeError):
                warnings.append("Sanctioned amount cannot be parsed to numerical float.")
                sanctioned = 0.0
                is_valid = False

        # 2. Released Amount Validation
        if raw_released is None or pd.isna(raw_released):
            # If release is missing in single-installment works, use sanctioned as upper bound
            released = sanctioned
            warnings.append("Installment release amount not provided; using sanctioned outlay as baseline.")
        else:
            try:
                released = float(raw_released)
                if released < 0:
                    warnings.append(f"Invalid negative released amount: ₹{released:.2f}L.")
                    released = 0.0
            except (ValueError, TypeError):
                released = 0.0

        # 3. Expenditure Amount Validation
        if raw_expenditure is None or pd.isna(raw_expenditure):
            warnings.append("Disbursed expenditure is missing or unrecorded.")
            expenditure = 0.0
        else:
            try:
                expenditure = float(raw_expenditure)
                if expenditure < 0:
                    warnings.append(f"Invalid negative expenditure: ₹{expenditure:.2f}L.")
                    expenditure = 0.0
                    is_valid = False
                elif sanctioned > 0 and expenditure > (sanctioned * 1.5):
                    warnings.append(f"Disbursed expenditure (₹{expenditure:.2f}L) significantly exceeds sanctioned budget (₹{sanctioned:.2f}L).")
            except (ValueError, TypeError):
                warnings.append("Expenditure cannot be parsed to numerical float.")
                expenditure = 0.0
                is_valid = False

        # 4. Physical Progress Validation
        if raw_physical is None or pd.isna(raw_physical):
            physical = 0.0
            warnings.append("Certified physical progress is not recorded.")
        else:
            try:
                physical = float(raw_physical)
                physical = np.clip(physical, 0.0, 100.0)
            except (ValueError, TypeError):
                physical = 0.0

        # 5. Financial Progress Calculation
        if raw_financial is not None and not pd.isna(raw_financial):
            try:
                financial = float(raw_financial)
                financial = np.clip(financial, 0.0, 150.0)
            except (ValueError, TypeError):
                financial = (expenditure / sanctioned * 100.0) if sanctioned > 0 else 0.0
        else:
            financial = (expenditure / sanctioned * 100.0) if sanctioned > 0 else 0.0

        # 6. Safe Denominator Ratios using NumPy / Pandas safe evaluation
        denominator = released if released > 0 else sanctioned
        if denominator > 0:
            utilization_pct = float(np.round((expenditure / denominator) * 100.0, 2))
            drawdown_ratio_pct = float(np.round((released / sanctioned) * 100.0, 2)) if sanctioned > 0 else 0.0
        else:
            utilization_pct = 0.0
            drawdown_ratio_pct = 0.0

        # Unspent balance: compatible available fund calculation
        unspent_balance = float(np.round(max(0.0, (released if released > 0 else sanctioned) - expenditure), 2))

        # Progress mismatch divergence: financial progress minus physical progress
        progress_divergence = float(np.round(financial - physical, 2))

        # Expenditure per progress point (in ₹ Lakhs per 1% physical progress)
        exp_per_point = float(np.round(expenditure / max(physical, 1.0), 3))

        # Determine Data Completeness Status
        if not is_valid or sanctioned <= 0:
            completeness = "INSUFFICIENT_DATA"
        elif len(warnings) > 1:
            completeness = "MODERATE"
        else:
            completeness = "ROBUST"

        return FundUtilizationMetrics(
            sanctionedAmountLakhs=float(np.round(sanctioned, 2)),
            releasedAmountLakhs=float(np.round(released, 2)),
            expenditureAmountLakhs=float(np.round(expenditure, 2)),
            unspentBalanceLakhs=unspent_balance,
            fundUtilizationPct=utilization_pct,
            drawdownRatioPct=drawdown_ratio_pct,
            physicalProgressPct=float(np.round(physical, 2)),
            financialProgressPct=float(np.round(financial, 2)),
            progressDivergenceGap=progress_divergence,
            expenditurePerProgressPoint=exp_per_point,
            dataCompletenessStatus=completeness,
            dataQualityWarnings=warnings,
            isValidForMlInference=is_valid and (sanctioned > 0)
        )

    @staticmethod
    def extract_feature_vector(project_data: Dict[str, Any]) -> Tuple[np.ndarray, FundUtilizationMetrics]:
        """
        Extracts a 10-dimensional normalized feature vector as a 1D NumPy array of shape (10,).
        Compatible with Scikit-learn Pipeline and PyTorch Tensor transforms.
        """
        metrics = DataProcessor.validate_and_analyze_fund_utilization(project_data)

        sanctioned = metrics.sanctionedAmountLakhs
        released = metrics.releasedAmountLakhs
        expenditure = metrics.expenditureAmountLakhs
        physical = metrics.physicalProgressPct
        financial = metrics.financialProgressPct
        progress_mismatch = metrics.progressDivergenceGap
        exp_per_pct = metrics.expenditurePerProgressPoint

        drawdown_ratio = (released / sanctioned) if sanctioned > 0 else 0.0
        expenditure_velocity = (expenditure / released) if released > 0 else 0.0

        # Delay Days calculation
        delay_days = 0.0
        start_date = project_data.get("startDate")
        expected_date = project_data.get("expectedCompletionDate")
        actual_date = project_data.get("actualCompletionDate")

        if expected_date and pd.notna(expected_date):
            try:
                exp_dt = pd.to_datetime(expected_date)
                cmp_dt = pd.to_datetime(actual_date) if actual_date and pd.notna(actual_date) else pd.Timestamp.now()
                delta = (cmp_dt - exp_dt).days
                delay_days = float(max(0, delta))
            except Exception:
                delay_days = 0.0

        # Category cost deviation %
        category = project_data.get("categoryName", "General Infrastructure")
        bench = CATEGORY_BENCHMARKS.get(category, CATEGORY_BENCHMARKS["General Infrastructure"])
        cat_dev_pct = float(((sanctioned - bench["avg"]) / bench["avg"]) * 100.0)

        # Payment concentration index
        payment_concentration = float(min(1.0, (expenditure / max(sanctioned, 1.0))))

        vector = np.array([
            sanctioned,
            drawdown_ratio,
            expenditure_velocity,
            physical,
            financial,
            progress_mismatch,
            exp_per_pct,
            delay_days,
            cat_dev_pct,
            payment_concentration
        ], dtype=np.float32)

        return vector, metrics

    @staticmethod
    def projects_to_dataframe(projects: List[Dict[str, Any]]) -> pd.DataFrame:
        """
        Converts a list of raw project dictionaries into a clean, typed Pandas DataFrame
        aligned with FEATURE_COLUMNS.
        """
        rows = []
        for p in projects:
            vec, _ = DataProcessor.extract_feature_vector(p)
            rows.append(vec)

        df = pd.DataFrame(rows, columns=FEATURE_COLUMNS)
        return df
