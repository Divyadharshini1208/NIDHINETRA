"""
Test Suite for PyTorch Tabular Autoencoder Anomaly Engine.
Validates neural network architecture, CPU forward pass, reconstruction MSE,
state_dict loading, threshold derivation, and numerical stability.
"""

import pytest
import numpy as np
import torch
import torch.nn as nn
from pipeline.pytorch_autoencoder import TabularAutoencoder, PyTorchAnomalyEngine, pytorch_engine

def test_tabular_autoencoder_architecture():
    model = TabularAutoencoder(input_dim=10, latent_dim=4)
    assert isinstance(model.encoder, nn.Sequential)
    assert isinstance(model.decoder, nn.Sequential)
    
    # Test forward pass with batch of 8
    dummy_input = torch.randn(8, 10, dtype=torch.float32)
    output = model(dummy_input)
    assert output.shape == (8, 10)
    assert not torch.isnan(output).any()

def test_pytorch_engine_initialization_and_metadata():
    assert pytorch_engine is not None
    assert pytorch_engine.model is not None
    assert pytorch_engine.scaler is not None
    assert pytorch_engine.threshold > 0.0
    assert pytorch_engine.status in ["EXPERIMENTAL", "VALIDATED"]
    assert "model_architecture" in pytorch_engine.metadata
    assert pytorch_engine.metadata["input_dimension"] == 10
    assert pytorch_engine.metadata["latent_dimension"] == 4

def test_pytorch_inference_normal_vector():
    # Representative normal civil project vector
    normal_vector = np.array([30.0, 0.8, 0.75, 75.0, 75.0, 0.0, 0.3, 15.0, 5.0, 0.35], dtype=np.float32)
    result = pytorch_engine.infer(normal_vector)
    
    assert "reconstructionMse" in result
    assert "thresholdMse" in result
    assert "isAnomalous" in result
    assert "indicator" in result
    assert isinstance(result["isAnomalous"], bool)
    assert result["modelName"] == "PyTorch Tabular Autoencoder"
    assert result["device"] in ["cpu", "cuda"]

def test_pytorch_inference_anomalous_outlier():
    # Extreme outlier vector (severe mismatch, massive delay, huge benchmark variance)
    anomalous_vector = np.array([220.0, 1.0, 1.2, 5.0, 95.0, 90.0, 18.0, 500.0, 250.0, 0.95], dtype=np.float32)
    result = pytorch_engine.infer(anomalous_vector)
    
    assert result["reconstructionMse"] > 0.0
    # Reconstruction MSE for such an extreme outlier should be elevated
    assert result["reconstructionMse"] > pytorch_engine.threshold or result["isAnomalous"] is True

def test_pytorch_edge_case_nan_and_inf_safety():
    # Edge case vector containing NaNs and infs
    dirty_vector = np.array([np.nan, np.inf, -np.inf, 0.0, 0.0, np.nan, 0.0, 0.0, 0.0, 0.0], dtype=np.float32)
    result = pytorch_engine.infer(dirty_vector)
    assert not np.isnan(result["reconstructionMse"])
    assert result["reconstructionMse"] >= 0.0
