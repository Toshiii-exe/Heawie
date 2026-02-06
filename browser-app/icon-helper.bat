@echo off
echo ================================================
echo  Heartbeat Browser - Icon Helper
echo ================================================
echo.

if not exist "assets" mkdir assets

echo This script helps you create an icon for the browser.
echo.
echo Option 1: Use an existing icon
echo   - Place your icon.ico (256x256 px) in the 'assets' folder
echo.
echo Option 2: Create from an image
echo   - Use online converter: https://icoconvert.com/
echo   - Upload your image (PNG, JPG)
echo   - Download as .ico
echo   - Save to 'assets' folder as 'icon.ico'
echo.
echo Option 3: Skip the icon
echo   - The build will use a default Electron icon
echo   - Edit package.json and remove the icon line (line 37)
echo.

if exist "assets\icon.ico" (
    echo [OK] Icon found at assets\icon.ico
) else (
    echo [!] No icon found at assets\icon.ico
    echo The browser will build with default icon.
)

echo.
pause
