#!/usr/bin/env bash
# ==============================================================================
# NIDHINETRA — 1-Command Docker Launch Script for Linux / macOS / WSL
# ==============================================================================
set -e

echo "=============================================================================="
echo "[NIDHINETRA] Starting Full Stack Platform via Docker Compose..."
echo "=============================================================================="

if ! command -v docker &> /dev/null; then
    echo "[ERROR] 'docker' command could not be found."
    echo "Please install Docker and Docker Compose before running this script."
    exit 1
fi

echo "Building and launching all services (PostgreSQL, AI Service, Spring Boot, Next.js)..."
echo ""

docker compose up --build -d

echo ""
echo "=============================================================================="
echo "[SUCCESS] NIDHINETRA services are launching!"
echo "=============================================================================="
echo " - Frontend Web Portal : http://localhost:3000"
echo " - Spring Boot Backend : http://localhost:8080/swagger-ui.html"
echo " - Python AI Service   : http://localhost:8000/docs"
echo " - PostgreSQL Database : localhost:5432 (db: mplads_db)"
echo "=============================================================================="
echo ""
echo "To monitor live logs, run:"
echo "  docker compose logs -f"
echo ""
echo "To stop all services, run:"
echo "  docker compose down"
echo ""
