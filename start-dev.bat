@echo off
echo Starting Refuture Development Environment...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:5001
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window...
pause > nul 