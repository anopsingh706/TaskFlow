@echo off
echo.
echo  ================================
echo   TaskFlow - Windows Setup
echo  ================================
echo.

echo [1/3] Installing root dependencies...
call npm install
if %errorlevel% neq 0 goto error

echo.
echo [2/3] Installing server dependencies...
cd server
call npm install
if %errorlevel% neq 0 goto error
cd ..

echo.
echo [3/3] Installing client dependencies...
cd client
call npm install
if %errorlevel% neq 0 goto error
cd ..

echo.
echo  ================================
echo   Setup complete!
echo  ================================
echo.
echo  Next steps:
echo   1. Copy server\.env.example to server\.env
echo   2. Fill in your MONGO_URI, JWT_SECRET, CLOUDINARY keys
echo   3. Run: npm run dev
echo.
goto end

:error
echo.
echo  ERROR: Setup failed. Check the error above.
echo.
exit /b 1

:end
