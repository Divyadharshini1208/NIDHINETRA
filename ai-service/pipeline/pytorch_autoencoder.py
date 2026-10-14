"""
NIDHINETRA — PyTorch Tabular Autoencoder for Experimental Anomaly Detection
Implements an unsupervised deep-learning reconstruction network using torch.nn.
Evaluated independently alongside Scikit-Learn IsolationForest baseline.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional, Tuple

import numpy as np
import joblib
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import RobustScaler

from pipeline.data_processor import FEATURE_COLUMNS, DataProcessor

logger = logging.getLogger("mplads-pytorch-autoencoder")

def _resolve_model_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parent.parent / "models",
        Path.cwd() / "models",
        Path.cwd() / "ai-service" / "models",
        Path(__file__).resolve().parent / "models",
    ]
    for c in candidates:
        if c.exists() and (c / "pytorch_autoencoder.pt").exists():
            return c
    return candidates[0]

MODEL_DIR = _resolve_model_dir()
PYTORCH_WEIGHTS_PATH = MODEL_DIR / "pytorch_autoencoder.pt"
PYTORCH_SCALER_PATH = MODEL_DIR / "pytorch_scaler.joblib"
PYTORCH_METADATA_PATH = MODEL_DIR / "pytorch_metadata.json"


class TabularAutoencoder(nn.Module):
    """
    Symmetric Encoder-Decoder Deep Neural Network for Tabular Civil Work Telemetry.
    Reconstructs normal reference vectors; high reconstruction error indicates multi-variate anomaly.
    """

    def __init__(self, input_dim: int = 10, latent_dim: int = 4):
        super(TabularAutoencoder, self).__init__()
        self.input_dim = input_dim
        self.latent_dim = latent_dim

        # Encoder: compresses 10 features down to a 4-dimensional latent bottleneck
        self.encoder = nn.Sequential(
            nn.Linear(input_dim, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Dropout(0.1),
            nn.Linear(32, 16),
            nn.ReLU(),
            nn.Linear(16, latent_dim)
        )

        # Decoder: reconstructs the original 10-dimensional feature vector
        self.decoder = nn.Sequential(
            nn.Linear(latent_dim, 16),
            nn.ReLU(),
            nn.Linear(16, 32),
            nn.BatchNorm1d(32),
            nn.ReLU(),
            nn.Linear(32, input_dim)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        latent = self.encoder(x)
        reconstruction = self.decoder(latent)
        return reconstruction


class PyTorchAnomalyEngine:
    """
    Production-grade manager for the PyTorch Tabular Autoencoder.
    Handles tensor conversion, train/val split, GPU/CPU execution, threshold derivation,
    and state_dict persistence.
    """

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Optional[TabularAutoencoder] = None
        self.scaler: Optional[RobustScaler] = None
        self.threshold: float = 1.85  # Default empirical reconstruction MSE cutoff
        self.metadata: Dict[str, Any] = {}
        self.status: str = "EXPERIMENTAL"

        # Restrict PyTorch thread count in serverless execution environments
        try:
            torch.set_num_threads(1)
        except Exception:
            pass

        try:
            MODEL_DIR.mkdir(parents=True, exist_ok=True)
        except OSError:
            pass
        self._load_or_train_model()

    def _load_or_train_model(self):
        """Loads state_dict and scaler from disk if available, otherwise trains baseline model."""
        if PYTORCH_WEIGHTS_PATH.exists() and PYTORCH_SCALER_PATH.exists() and PYTORCH_METADATA_PATH.exists():
            try:
                self.model = TabularAutoencoder(input_dim=len(FEATURE_COLUMNS), latent_dim=4)
                try:
                    state_dict = torch.load(PYTORCH_WEIGHTS_PATH, map_location=self.device, weights_only=True)
                except TypeError:
                    state_dict = torch.load(PYTORCH_WEIGHTS_PATH, map_location=self.device)
                self.model.load_state_dict(state_dict)
                self.model.to(self.device)
                self.model.eval()

                self.scaler = joblib.load(PYTORCH_SCALER_PATH)
                with open(PYTORCH_METADATA_PATH, "r") as f:
                    self.metadata = json.load(f)

                self.threshold = float(self.metadata.get("reconstruction_threshold_mse", 1.85))
                self.status = self.metadata.get("status", "EXPERIMENTAL")
                logger.info(f"Loaded existing PyTorch Autoencoder (Threshold MSE: {self.threshold:.4f}, Device: {self.device})")
                return
            except Exception as e:
                logger.warning(f"Failed to load PyTorch model weights ({e}); re-training baseline model.")

        # Train initial reproducible baseline model
        self.train_and_persist()

    def train_and_persist(
        self,
        n_samples: int = 1000,
        epochs: int = 40,
        batch_size: int = 32,
        lr: float = 0.003
    ) -> Dict[str, Any]:
        """
        Trains the autoencoder on reference developmental work data using PyTorch.
        Derives reconstruction threshold from the 95th percentile of validation errors.
        """
        logger.info(f"Training PyTorch Tabular Autoencoder on {n_samples} reference records...")
        np.random.seed(42)
        torch.manual_seed(42)

        # Generate representative empirical reference data
        sanctioned = np.random.gamma(shape=3.5, scale=12.0, size=n_samples)
        drawdown = np.clip(np.random.beta(a=3.0, b=2.0, size=n_samples), 0.2, 1.0)
        velocity = np.clip(drawdown * np.random.uniform(0.6, 1.05, size=n_samples), 0.1, 1.1)
        physical = np.clip(velocity * 100.0 + np.random.normal(0, 7.0, size=n_samples), 0.0, 100.0)
        financial = velocity * 100.0
        gap = financial - physical
        exp_per_pct = (velocity * sanctioned) / np.maximum(physical, 1.0)
        delays = np.random.exponential(scale=18.0, size=n_samples)
        cat_dev = np.random.normal(0, 15.0, size=n_samples)
        concentration = np.clip(np.random.beta(2.5, 3.5, size=n_samples), 0.1, 0.95)

        X_raw = np.column_stack([
            sanctioned, drawdown, velocity, physical, financial,
            gap, exp_per_pct, delays, cat_dev, concentration
        ])

        # Train / Validation split (80% train, 20% validation)
        split_idx = int(0.8 * n_samples)
        X_train_raw = X_raw[:split_idx]
        X_val_raw = X_raw[split_idx:]

        # Fit RobustScaler exclusively on training split to prevent data leakage
        self.scaler = RobustScaler()
        X_train_scaled = self.scaler.fit_transform(X_train_raw)
        X_val_scaled = self.scaler.transform(X_val_raw)

        # Create DataLoader
        train_tensor = torch.tensor(X_train_scaled, dtype=torch.float32)
        val_tensor = torch.tensor(X_val_scaled, dtype=torch.float32)

        train_loader = DataLoader(TensorDataset(train_tensor, train_tensor), batch_size=batch_size, shuffle=True)

        self.model = TabularAutoencoder(input_dim=len(FEATURE_COLUMNS), latent_dim=4).to(self.device)
        criterion = nn.MSELoss()
        optimizer = optim.Adam(self.model.parameters(), lr=lr, weight_decay=1e-5)

        # Training Loop
        self.model.train()
        for epoch in range(epochs):
            for batch_x, _ in train_loader:
                batch_x = batch_x.to(self.device)
                optimizer.zero_grad()
                reconstructed = self.model(batch_x)
                loss = criterion(reconstructed, batch_x)
                loss.backward()
                optimizer.step()

        # Validation & Threshold Derivation
        self.model.eval()
        with torch.no_grad():
            val_x = val_tensor.to(self.device)
            val_recon = self.model(val_x)
            # Per-sample MSE
            val_errors = torch.mean((val_recon - val_x) ** 2, dim=1).cpu().numpy()

        # Threshold set to 95th percentile of normal validation errors
        derived_threshold = float(np.percentile(val_errors, 95))
        mean_val_error = float(np.mean(val_errors))

        self.threshold = derived_threshold
        self.status = "VALIDATED"

        # Metadata
        self.metadata = {
            "model_architecture": "TabularAutoencoder (10 -> 32 -> 16 -> 4 -> 16 -> 32 -> 10)",
            "framework": "PyTorch",
            "torch_version": torch.__version__,
            "device": str(self.device),
            "input_dimension": len(FEATURE_COLUMNS),
            "latent_dimension": 4,
            "feature_columns": FEATURE_COLUMNS,
            "training_samples": len(X_train_raw),
            "validation_samples": len(X_val_raw),
            "epochs": epochs,
            "validation_mean_mse": round(mean_val_error, 5),
            "reconstruction_threshold_mse": round(derived_threshold, 5),
            "status": self.status,
            "statutory_role": "Experimental deep-learning anomaly benchmark evaluated against IsolationForest baseline."
        }

        # Persist weights and scaler securely if filesystem is writable
        try:
            torch.save(self.model.state_dict(), PYTORCH_WEIGHTS_PATH)
            joblib.dump(self.scaler, PYTORCH_SCALER_PATH)
            with open(PYTORCH_METADATA_PATH, "w") as f:
                json.dump(self.metadata, f, indent=2)
        except OSError:
            # Serverless environments (e.g. Vercel/AWS Lambda) have read-only filesystems
            pass

        logger.info(f"PyTorch Autoencoder trained & persisted. Derived MSE Threshold: {derived_threshold:.4f}")
        return self.metadata

    def infer(self, raw_vector: np.ndarray) -> Dict[str, Any]:
        """
        Runs PyTorch inference on a single 10-dimensional feature vector.
        Calculates reconstruction error and evaluates against the derived threshold.
        """
        if self.model is None or self.scaler is None:
            return {
                "modelStatus": "NOT_READY",
                "reconstructionMse": 0.0,
                "thresholdMse": self.threshold,
                "isAnomalous": False,
                "reconstructionConfidence": 0.0,
                "indicator": "INSUFFICIENT_DATA",
                "message": "PyTorch Autoencoder weights or scaler are not loaded."
            }

        # Handle non-finite values safely
        clean_vector = np.nan_to_num(raw_vector, nan=0.0, posinf=100.0, neginf=-100.0).reshape(1, -1)

        # Scale features using fitted RobustScaler
        scaled_vector = self.scaler.transform(clean_vector)

        # PyTorch Tensor inference
        self.model.eval()
        with torch.no_grad():
            x_tensor = torch.tensor(scaled_vector, dtype=torch.float32).to(self.device)
            reconstruction = self.model(x_tensor)
            # Calculate MSE
            mse = float(torch.mean((reconstruction - x_tensor) ** 2).item())

        is_anomalous = bool(mse > self.threshold)
        ratio = mse / max(self.threshold, 0.001)

        # Confidence metric derived from distance from decision boundary
        confidence = float(np.clip(min(1.0, abs(ratio - 1.0) * 0.5 + 0.5) * 100.0, 50.0, 99.0))

        if is_anomalous:
            indicator = "POTENTIALLY_ANOMALOUS_RECONSTRUCTION"
            explanation = (
                f"PyTorch Autoencoder reconstruction MSE ({mse:.4f}) exceeds empirical threshold ({self.threshold:.4f}). "
                "The feature combination diverges from typical civil works patterns."
            )
        else:
            indicator = "CONGRUENT_RECONSTRUCTION"
            explanation = (
                f"PyTorch Autoencoder reconstruction MSE ({mse:.4f}) is within permissible baseline tolerance ({self.threshold:.4f})."
            )

        return {
            "modelName": "PyTorch Tabular Autoencoder",
            "modelVersion": "2.1.0-torch",
            "modelStatus": self.status,
            "device": str(self.device),
            "reconstructionMse": round(mse, 4),
            "thresholdMse": round(self.threshold, 4),
            "isAnomalous": is_anomalous,
            "reconstructionConfidence": round(confidence, 1),
            "indicator": indicator,
            "explanation": explanation
        }


# Global Singleton Instance
pytorch_engine = PyTorchAnomalyEngine()
