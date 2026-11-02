@echo off
title ScamShield - Starting Application
cd /d "%~dp0"

echo ===================================================
echo     ScamShield - AI-Powered Scam Detection
echo           Developed by Team BrainByte
echo ===================================================
echo.

python run.py %*

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ScamShield] Application stopped with an error or exit code %ERRORLEVEL%.
    pause
)
