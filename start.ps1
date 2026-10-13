# ==============================================================================
# NIDHINETRA — 1-Command PowerShell Full Stack Launcher
# ==============================================================================
$rootDir = $PSScriptRoot

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host "[NIDHINETRA] Starting Full Stack Platform in 1 Command..." -ForegroundColor Green
Write-Host "==============================================================================" -ForegroundColor Cyan

Write-Host "[1/3] Launching Python AI Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\ai-service'; Write-Host '--- Python AI Service (Port 8000) ---' -ForegroundColor Cyan; python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "[2/3] Launching Spring Boot Backend (Port 8080)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\backend'; Write-Host '--- Spring Boot Backend (Port 8080) ---' -ForegroundColor Cyan; mvn spring-boot:run"

Write-Host "[3/3] Launching Next.js Frontend (Port 3000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$rootDir\frontend'; Write-Host '--- Next.js Frontend (Port 3000) ---' -ForegroundColor Cyan; npm run dev"

Write-Host "`n[SUCCESS] All 3 services are launching in separate windows!" -ForegroundColor Green
Write-Host "  - Frontend Portal : http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend Swagger : http://localhost:8080/swagger-ui.html" -ForegroundColor White
Write-Host "  - AI Microservice : http://localhost:8000/docs" -ForegroundColor White

Write-Host "`nOpening browser in 6 seconds..." -ForegroundColor Cyan
Start-Sleep -Seconds 6
Start-Process "http://localhost:3000"
