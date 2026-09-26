@echo off
title StockSense Launcher
echo ===================================================
echo   StockSense - Real-Time Inventory Management
echo ===================================================
echo.

:: Navigate to project root directory
cd /d "%~dp0"

:: 1. Copy .env files if missing
if not exist "server\.env" (
    echo [INFO] Creating server\.env from .env.example...
    copy "server\.env.example" "server\.env" >nul
)

if not exist "client\.env" (
    echo [INFO] Creating client\.env from .env.example...
    copy "client\.env.example" "client\.env" >nul
)

:: 2. Check and install Server dependencies
if not exist "server\node_modules" (
    echo [INFO] Installing server dependencies...
    cd server
    call npm install
    cd ..
)

:: 3. Check and install Client dependencies
if not exist "client\node_modules" (
    echo [INFO] Installing client dependencies...
    cd client
    call npm install
    cd ..
)

:: 4. Database Setup (Prisma SQLite)
if not exist "server\prisma\dev.db" (
    if not exist "server\dev.db" (
        echo [INFO] Setting up database and seeding demo data...
        cd server
        call npx prisma db push
        call npm run seed
        cd ..
    )
)

echo.
echo ===================================================
echo   Starting Backend and Frontend Servers...
echo ===================================================
echo.

:: 5. Launch Backend Server in a new window
start "StockSense Backend Server (Port 5000)" cmd /k "cd /d "%~dp0server" && npm run dev"

:: 6. Launch Frontend Client in a new window
start "StockSense Frontend Client (Port 5173)" cmd /k "cd /d "%~dp0client" && npm run dev"

echo Backend API:  http://localhost:5000
echo Frontend App: http://localhost:5173
echo.
echo Demo Login Credentials:
echo   Manager: manager@stocksense.com  / password123
echo   Staff:   staff@stocksense.com    / password123
echo ===================================================
echo.
pause
