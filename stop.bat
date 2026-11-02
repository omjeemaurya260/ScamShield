@echo off
title ScamShield - Stopping Services
cd /d "%~dp0"

echo ===================================================
echo     ScamShield - Terminating Active Services
echo ===================================================
echo.

echo [ScamShield] Checking port 8000 (Backend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo [ScamShield] Stopping process PID %%a on port 8000...
    taskkill /F /PID %%a >nul 2>&1
)

echo [ScamShield] Checking port 5173 (Frontend)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo [ScamShield] Stopping process PID %%a on port 5173...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo [ScamShield] All ScamShield services have been stopped.
timeout /t 2 >nul
