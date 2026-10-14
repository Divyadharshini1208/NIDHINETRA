#!/usr/bin/env bash
# ==============================================================================
# NIDHINETRA — 1-Command Native Full Stack Launcher for Linux / macOS / WSL
# Runs Frontend (Next.js), Backend (Spring Boot), and AI Service (FastAPI)
# without Docker or containerization.
# ==============================================================================
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=============================================================================="
echo " [NIDHINETRA] Starting Full Stack Platform (Native Non-Containerized)"
echo "=============================================================================="
echo ""

# Dependency check
command -v java >/dev/null 2>&1 || { echo "[ERROR] Java is not installed or not in PATH. Please install Java 21+."; exit 1; }
command -v mvn >/dev/null 2>&1 || { echo "[ERROR] Maven is not installed or not in PATH. Please install Apache Maven 3.9+."; exit 1; }
command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1 || { echo "[ERROR] Python is not installed or not in PATH. Please install Python 3.11+."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "[ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+ or 20+."; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "[ERROR] npm is not installed or not in PATH."; exit 1; }

PYTHON_BIN=$(command -v python3 || command -v python)

PIDS=()

cleanup() {
    echo ""
    echo "[NIDHINETRA] Stopping all services..."
    for pid in "${PIDS[@]}"; do
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null || true
        fi
    done
    wait 2>/dev/null || true
    echo "[NIDHINETRA] All services stopped."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "[1/3] Starting Python AI Microservice (Port 8000)..."
(
    cd "$ROOT_DIR/ai-service"
    "$PYTHON_BIN" -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
) &
PIDS+=($!)

echo "[2/3] Starting Spring Boot Backend (Port 8080)..."
(
    cd "$ROOT_DIR/backend"
    mvn spring-boot:run
) &
PIDS+=($!)

echo "[3/3] Starting Next.js Frontend (Port 3000)..."
(
    cd "$ROOT_DIR/frontend"
    npm run dev
) &
PIDS+=($!)

echo ""
echo "=============================================================================="
echo "[SUCCESS] All services are starting up!"
echo "=============================================================================="
echo " - Frontend Web Portal : http://localhost:3000"
echo " - Backend Swagger UI  : http://localhost:8080/swagger-ui.html"
echo " - Python AI Service   : http://localhost:8000/docs"
echo "=============================================================================="
echo "Press Ctrl+C to stop all services."
echo ""

wait
