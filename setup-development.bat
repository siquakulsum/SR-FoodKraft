@echo off
REM SR FoodKraft - Local Development Setup Script for Windows
REM This script helps you set up PostgreSQL + pgAdmin for local development

echo ============================================
echo SR FoodKraft - Development Environment Setup
echo ============================================
echo.

REM Check if PostgreSQL is installed
echo [1/5] Checking PostgreSQL installation...
psql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: PostgreSQL not found!
    echo.
    echo Please install PostgreSQL from:
    echo https://www.postgresql.org/download/windows/
    echo.
    echo Or use Chocolatey:
    echo   choco install postgresql15 pgadmin4
    echo.
    pause
    exit /b 1
)
echo ✓ PostgreSQL found!
echo.

REM Create database
echo [2/5] Creating database...
psql -U postgres -c "CREATE DATABASE sr_foodkraft_dev;" 2>nul
if %errorlevel% equ 0 (
    echo ✓ Database 'sr_foodkraft_dev' created successfully!
) else (
    echo ℹ Database may already exist (this is OK)
)
echo.

REM Run setup SQL
echo [3/5] Setting up database schema...
if exist setup-local-db.sql (
    psql -U postgres -d sr_foodkraft_dev -f setup-local-db.sql
    echo ✓ Database schema created successfully!
) else (
    echo ⚠ setup-local-db.sql not found, skipping...
)
echo.

REM Create .env files
echo [4/5] Creating environment files...

REM Admin .env.local
if not exist Admin\.env.local (
    if exist env.example (
        copy env.example Admin\.env.local >nul
        echo ✓ Created Admin\.env.local
    )
) else (
    echo ℹ Admin\.env.local already exists
)

REM Customer .env.local
if not exist Customer\.env.local (
    if exist env.example (
        copy env.example Customer\.env.local >nul
        echo ✓ Created Customer\.env.local
    )
) else (
    echo ℹ Customer\.env.local already exists
)
echo.

REM Install dependencies
echo [5/5] Installing dependencies...
echo.
echo Installing Admin dependencies...
cd Admin
call npm install
cd ..
echo.
echo Installing Customer dependencies...
cd Customer
call npm install
cd ..
echo.

echo ============================================
echo ✓ Setup Complete!
echo ============================================
echo.
echo Next steps:
echo 1. Edit Admin\.env.local and Customer\.env.local
echo 2. Update VITE_DB_PASSWORD with your PostgreSQL password
echo 3. Open pgAdmin and connect to 'sr_foodkraft_dev' database
echo 4. Run: npm run dev (in Admin or Customer folder)
echo.
echo pgAdmin connection details:
echo   Host: localhost
echo   Port: 5432
echo   Database: sr_foodkraft_dev
echo   Username: postgres
echo   Password: [your password]
echo.
echo Happy coding! 🚀
echo.
pause

