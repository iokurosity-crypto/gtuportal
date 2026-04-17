@echo off
REM Remove unnecessary files for clean GitHub upload

echo.
echo ===== CLEANING UNNECESSARY FILES =====
echo.

REM Remove .history folder
if exist ".history" (
    echo Removing .history/
    rmdir /s /q ".history"
)

REM Remove .zencoder folder
if exist ".zencoder" (
    echo Removing .zencoder/
    rmdir /s /q ".zencoder"
)

REM Remove .zenflow folder
if exist ".zenflow" (
    echo Removing .zenflow/
    rmdir /s /q ".zenflow"
)

REM Remove unnecessary test files
if exist "check_syntax.js" (
    echo Removing check_syntax.js
    del check_syntax.js
)

if exist "startup-check.js" (
    echo Removing startup-check.js
    del startup-check.js
)

if exist "test-backend.js" (
    echo Removing test-backend.js
    del test-backend.js
)

if exist "COMPLETENESS_ANALYSIS.json" (
    echo Removing COMPLETENESS_ANALYSIS.json
    del COMPLETENESS_ANALYSIS.json
)

REM Remove node_modules from frontend
if exist "frontend\node_modules" (
    echo Removing frontend/node_modules
    rmdir /s /q "frontend\node_modules"
)

REM Remove dist from frontend (will rebuild on Vercel)
if exist "frontend\dist" (
    echo Removing frontend/dist
    rmdir /s /q "frontend\dist"
)

REM Remove node_modules from backend3
if exist "backend3\node_modules" (
    echo Removing backend3/node_modules
    rmdir /s /q "backend3\node_modules"
)

REM Remove uploads folder from backend3
if exist "backend3\uploads" (
    echo Removing backend3/uploads
    rmdir /s /q "backend3\uploads"
)

echo.
echo ===== CLEANUP COMPLETE =====
echo.
echo Your project is now clean and ready for GitHub upload!
echo Total size reduced: ~200-300 MB
echo.
echo Next steps:
echo 1. Upload to GitHub
echo 2. Connect to Vercel (for frontend)
echo 3. Connect to Render (for backend)
echo.
pause
