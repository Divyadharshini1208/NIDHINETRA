@echo off
title NIDHINETRA — 1-Command Full Stack Launcher
echo ==============================================================================
echo [NIDHINETRA] Starting Full Stack Platform in 1 Command...
echo ==============================================================================
echo.

set ROOT_DIR=%~dp0

echo [1/3] Launching Python AI Microservice (Port 8000)...
start "NIDHINETRA — AI Service (:8000)" cmd /k "cd /d %ROOT_DIR%ai-service && python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Launching Spring Boot Backend (Port 8080)...
start "NIDHINETRA — Backend (:8080)" cmd /k "cd /d %ROOT_DIR%backend && mvn spring-boot:run"

echo [3/3] Launching Next.js Frontend (Port 3000)...
start "NIDHINETRA — Frontend (:3000)" cmd /k "cd /d %ROOT_DIR%frontend && npm run dev"

echo.
echo ==============================================================================
echo [SUCCESS] All 3 services are launching in their own terminal windows!
echo ==============================================================================
echo  - Frontend Web Portal : http://localhost:3000
echo  - Backend Swagger UI  : http://localhost:8080/swagger-ui.html
echo  - Python AI Service   : http://localhost:8000/docs
echo ==============================================================================
echo.
echo Opening web browser to http://localhost:3000 in 6 seconds...
timeout /t 6 >nul
start http://localhost:3000
