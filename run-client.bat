@echo off
title StockSense Client
cd /d "%~dp0client"
if not exist ".env" (
    echo [INFO] Creating client\.env from .env.example...
    copy ".env.example" ".env" >nul
)
if not exist "node_modules" (
    echo [INFO] Installing client dependencies...
    call npm install
)
echo Starting StockSense Frontend Client...
npm run dev
