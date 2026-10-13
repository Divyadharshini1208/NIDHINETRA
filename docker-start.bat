@echo off
REM ==============================================================================
REM NIDHINETRA — 1-Click Docker Launch Script for Windows
REM ==============================================================================
echo ==============================================================================
echo [NIDHINETRA] Starting Full Stack Platform via Docker Compose...
echo ==============================================================================
echo.

where docker >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Docker is not found in your system PATH.
    echo Please make sure Docker Desktop is installed and running.
    echo Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
    pause
    exit /b 1
)

echo Building and launching all services (PostgreSQL, AI Service, Spring Boot, Next.js)...
echo.
docker compose up --build -d

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Docker Compose failed to start the containers.
    pause
    exit /b 1
)

echo.
echo ==============================================================================
echo [SUCCESS] NIDHINETRA services are starting up!
echo ==============================================================================
echo  - Frontend Web Portal : http://localhost:3000
echo  - Spring Boot Backend : http://localhost:8080/swagger-ui.html
echo  - Python AI Service   : http://localhost:8000/docs
echo  - PostgreSQL Database : localhost:5432 (db: mplads_db)
echo ==============================================================================
echo.
echo To view live logs:
echo   docker compose logs -f
echo.
echo To shut down all services:
echo   docker compose down
echo.
pause
