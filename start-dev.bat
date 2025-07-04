@echo off
echo Starting Refuture Development Environment...
echo.

echo Checking if MongoDB is running...
netstat -an | findstr :27017 >nul
if %errorlevel% neq 0 (
    echo WARNING: MongoDB doesn't seem to be running on port 27017
    echo Please start MongoDB or use MongoDB Atlas
    echo.
)

echo Starting both frontend and backend...
npm run dev:full

pause 