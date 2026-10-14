# ==============================================================================
# NIDHINETRA — AI Anomaly Detection & Intelligence Microservice
# Python 3.11 Slim with Scikit-Learn, FastAPI, Uvicorn, Pandas, NumPy
# ==============================================================================
FROM python:3.11-slim

WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

# Install curl for container health check and build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install PyTorch CPU-only wheel first to avoid downloading 2.5GB CUDA GPU wheels
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

# Install remaining python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and model artifacts
COPY . .

# Expose microservice port
EXPOSE 8000

# Health check compatible with dynamic $PORT on Render / cloud platforms
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Start FastAPI microservice via Uvicorn (binds to dynamic $PORT assigned by cloud host)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]

