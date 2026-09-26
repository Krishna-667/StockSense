@echo off
title StockSense Server
cd /d "%~dp0server"
if not exist ".env" (
    echo [INFO] Creating server\.env from .env.example...
    copy ".env.example" ".env" >nul
)
if not exist "node_modules" (
    echo [INFO] Installing server dependencies...
    call npm install
)
echo Starting StockSense Backend Server...
npm run dev
