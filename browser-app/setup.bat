@echo off
echo ================================================
echo  Heartbeat Browser - Windows Setup Script
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installation, restart your computer and run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js is installed
node --version
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo [ERROR] package.json not found!
    echo Please run this script from the browser-app directory.
    echo.
    pause
    exit /b 1
)

echo [STEP 1/4] Installing dependencies...
echo This may take 2-3 minutes...
echo.
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b 1
)

echo.
echo [STEP 2/4] Creating heartbeat folder...
if not exist "heartbeat" mkdir heartbeat

echo.
echo [STEP 3/4] Copying Heartbeat files...
copy /Y ..\index.html heartbeat\
copy /Y ..\styles.css heartbeat\
copy /Y ..\script.js heartbeat\
copy /Y ..\messages.json heartbeat\

if %ERRORLEVEL% NEQ 0 (
    echo [WARNING] Some files may not have been copied. Please check manually.
)

echo.
echo [STEP 4/4] Creating assets folder (for icon)...
if not exist "assets" mkdir assets
echo Note: Place your icon.ico file in the assets folder before building.

echo.
echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo To test the browser:
echo   npm start
echo.
echo To build Windows installer:
echo   npm run build:win
echo.
echo The installer will be in the 'dist' folder.
echo.
pause
