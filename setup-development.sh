#!/bin/bash
# SR FoodKraft - Local Development Setup Script for macOS/Linux

echo "============================================"
echo "SR FoodKraft - Development Environment Setup"
echo "============================================"
echo ""

# Check if PostgreSQL is installed
echo "[1/5] Checking PostgreSQL installation..."
if ! command -v psql &> /dev/null; then
    echo "❌ ERROR: PostgreSQL not found!"
    echo ""
    echo "Please install PostgreSQL:"
    echo ""
    echo "macOS:"
    echo "  brew install postgresql@15"
    echo "  brew install --cask pgadmin4"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt install postgresql postgresql-contrib pgadmin4"
    echo ""
    exit 1
fi
echo "✅ PostgreSQL found!"
echo ""

# Create database
echo "[2/5] Creating database..."
sudo -u postgres psql -c "CREATE DATABASE sr_foodkraft_dev;" 2>/dev/null || psql -U postgres -c "CREATE DATABASE sr_foodkraft_dev;" 2>/dev/null
if [ $? -eq 0 ]; then
    echo "✅ Database 'sr_foodkraft_dev' created successfully!"
else
    echo "ℹ️  Database may already exist (this is OK)"
fi
echo ""

# Run setup SQL
echo "[3/5] Setting up database schema..."
if [ -f "setup-local-db.sql" ]; then
    sudo -u postgres psql -d sr_foodkraft_dev -f setup-local-db.sql 2>/dev/null || psql -U postgres -d sr_foodkraft_dev -f setup-local-db.sql
    echo "✅ Database schema created successfully!"
else
    echo "⚠️  setup-local-db.sql not found, skipping..."
fi
echo ""

# Create .env files
echo "[4/5] Creating environment files..."

# Admin .env.local
if [ ! -f "Admin/.env.local" ]; then
    if [ -f "env.example" ]; then
        cp env.example Admin/.env.local
        echo "✅ Created Admin/.env.local"
    fi
else
    echo "ℹ️  Admin/.env.local already exists"
fi

# Customer .env.local
if [ ! -f "Customer/.env.local" ]; then
    if [ -f "env.example" ]; then
        cp env.example Customer/.env.local
        echo "✅ Created Customer/.env.local"
    fi
else
    echo "ℹ️  Customer/.env.local already exists"
fi
echo ""

# Install dependencies
echo "[5/5] Installing dependencies..."
echo ""
echo "Installing Admin dependencies..."
cd Admin && npm install
cd ..
echo ""
echo "Installing Customer dependencies..."
cd Customer && npm install
cd ..
echo ""

echo "============================================"
echo "✅ Setup Complete!"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Edit Admin/.env.local and Customer/.env.local"
echo "2. Update VITE_DB_PASSWORD with your PostgreSQL password"
echo "3. Open pgAdmin and connect to 'sr_foodkraft_dev' database"
echo "4. Run: npm run dev (in Admin or Customer folder)"
echo ""
echo "pgAdmin connection details:"
echo "  Host: localhost"
echo "  Port: 5432"
echo "  Database: sr_foodkraft_dev"
echo "  Username: postgres"
echo "  Password: [your password]"
echo ""
echo "Happy coding! 🚀"
echo ""

