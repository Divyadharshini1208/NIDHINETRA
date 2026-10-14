"""
Test Suite for Data Processor, Validation & Feature Engineering Pipeline.
Validates Pandas and NumPy operations, zero denominator safeguards,
missing-value handling, and statutory data completeness states.
"""

import pytest
import numpy as np
import pandas as pd
from pipeline.data_processor import DataProcessor, FEATURE_COLUMNS, FundUtilizationMetrics

def test_robust_fund_utilization_calculation():
    project = {
        "sanctionedAmount": 50.0,
        "releasedAmount": 40.0,
        "expenditureAmount": 30.0,
        "physicalProgress": 75,
        "financialProgress": 60.0
    }
    metrics = DataProcessor.validate_and_analyze_fund_utilization(project)
    assert metrics.sanctionedAmountLakhs == 50.0
    assert metrics.releasedAmountLakhs == 40.0
    assert metrics.expenditureAmountLakhs == 30.0
    assert metrics.unspentBalanceLakhs == 10.0  # 40 - 30
    assert metrics.fundUtilizationPct == 75.0  # (30 / 40) * 100
    assert metrics.drawdownRatioPct == 80.0    # (40 / 50) * 100
    assert metrics.dataCompletenessStatus == "ROBUST"
    assert metrics.isValidForMlInference is True
    assert len(metrics.dataQualityWarnings) == 0

def test_zero_denominator_safeguards():
    project = {
        "sanctionedAmount": 0.0,
        "releasedAmount": 0.0,
        "expenditureAmount": 0.0,
        "physicalProgress": 0
    }
    metrics = DataProcessor.validate_and_analyze_fund_utilization(project)
    assert metrics.fundUtilizationPct == 0.0
    assert metrics.drawdownRatioPct == 0.0
    assert metrics.unspentBalanceLakhs == 0.0
    assert metrics.dataCompletenessStatus == "INSUFFICIENT_DATA"
    assert metrics.isValidForMlInference is False
    assert any("Sanctioned amount is zero" in w for w in metrics.dataQualityWarnings)

def test_negative_financial_values_rejected():
    project = {
        "sanctionedAmount": -25.0,
        "releasedAmount": 10.0,
        "expenditureAmount": -5.0
    }
    metrics = DataProcessor.validate_and_analyze_fund_utilization(project)
    assert metrics.dataCompletenessStatus == "INSUFFICIENT_DATA"
    assert metrics.isValidForMlInference is False
    assert any("Invalid negative" in w for w in metrics.dataQualityWarnings)

def test_missing_expenditure_handling():
    project = {
        "sanctionedAmount": 30.0,
        "releasedAmount": 20.0,
        "expenditureAmount": None,
        "physicalProgress": 50
    }
    metrics = DataProcessor.validate_and_analyze_fund_utilization(project)
    assert metrics.expenditureAmountLakhs == 0.0
    assert metrics.fundUtilizationPct == 0.0
    assert metrics.unspentBalanceLakhs == 20.0
    assert any("Disbursed expenditure is missing" in w for w in metrics.dataQualityWarnings)

def test_feature_vector_dimension_and_columns():
    project = {
        "sanctionedAmount": 45.0,
        "releasedAmount": 40.0,
        "expenditureAmount": 35.0,
        "physicalProgress": 80,
        "financialProgress": 77.8,
        "expectedCompletionDate": "2026-12-31"
    }
    vec, metrics = DataProcessor.extract_feature_vector(project)
    assert isinstance(vec, np.ndarray)
    assert vec.shape == (10,)
    assert len(FEATURE_COLUMNS) == 10
    assert not np.isnan(vec).any()

def test_dataframe_conversion_pipeline():
    projects = [
        {"sanctionedAmount": 20.0, "releasedAmount": 15.0, "expenditureAmount": 10.0, "physicalProgress": 50},
        {"sanctionedAmount": 80.0, "releasedAmount": 70.0, "expenditureAmount": 65.0, "physicalProgress": 90}
    ]
    df = DataProcessor.projects_to_dataframe(projects)
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 2
    assert list(df.columns) == FEATURE_COLUMNS
