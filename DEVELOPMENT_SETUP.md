# SR FoodKraft - Local Development Setup with PostgreSQL + pgAdmin

## 🎯 Development Strategy

```
Local Development (FREE):
  PostgreSQL + pgAdmin → Build & Test
  ↓
Production (When Ready):
  Deploy to Supabase or any cloud
```

## 📥 Step 1: Install PostgreSQL + pgAdmin

### Windows Installation

#### Option A: PostgreSQL Installer (Includes pgAdmin)

```bash
# Download from: https://www.postgresql.org/download/windows/
# OR use this direct link:
# https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

# Run installer and select:
✅ PostgreSQL Server
✅ pgAdmin 4
✅ Command Line Tools
✅ Stack Builder (optional)

# During installation:
Port: 5432 (default)
Password: [Choose a strong password - remember this!]
```

#### Option B: Chocolatey (Recommended for devs)

```bash
# Open PowerShell as Administrator
choco install postgresql15 pgadmin4

# Set password
psql -U postgres
ALTER USER postgres PASSWORD 'your_password';
```

### macOS Installation

```bash
# Install PostgreSQL
brew install postgresql@15
brew install --cask pgadmin4

# Start PostgreSQL
brew services start postgresql@15

# Create user
createuser -s postgres
psql postgres
ALTER USER postgres PASSWORD 'your_password';
```

### Linux Installation

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib pgadmin4

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Set password
sudo -u postgres psql
ALTER USER postgres PASSWORD 'your_password';
```

## 🗄️ Step 2: Create Development Database

### Using pgAdmin

1. **Open pgAdmin 4**
2. **Connect to Local Server**

   - Right-click `Servers` → `Create` → `Server`
   - **General Tab:**
     - Name: `SR FoodKraft Local`
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `5432`
     - Database: `postgres`
     - Username: `postgres`
     - Password: `[your password]`
   - Click `Save`

3. **Create Database**
   - Right-click `Databases` → `Create` → `Database`
   - Database name: `sr_foodkraft_dev`
   - Owner: `postgres`
   - Click `Save`

### Using Command Line

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE sr_foodkraft_dev;

# Create separate test database
CREATE DATABASE sr_foodkraft_test;

# List databases
\l

# Connect to database
\c sr_foodkraft_dev

# Exit
\q
```

## 📝 Step 3: Run Database Migrations

We'll convert your Supabase migrations to work locally.

### Install Node.js Database Tools

```bash
# In your project root
npm install -g db-migrate db-migrate-pg

# Or use node-pg-migrate
npm install -g node-pg-migrate
```

### Manual Migration (Recommended)

```bash
# Navigate to migrations folder
cd Customer/supabase/migrations

# Run each migration file in pgAdmin Query Tool
# OR via command line:
psql -U postgres -d sr_foodkraft_dev -f 20250101000000_otp_verification.sql
psql -U postgres -d sr_foodkraft_dev -f 20250101000001_update_addresses.sql
psql -U postgres -d sr_foodkraft_dev -f 20250922113111_bronze_flower.sql
psql -U postgres -d sr_foodkraft_dev -f 20250922113120_lively_meadow.sql
psql -U postgres -d sr_foodkraft_dev -f 20250922113129_withered_lantern.sql
psql -U postgres -d sr_foodkraft_dev -f 20250922115623_light_salad.sql
psql -U postgres -d sr_foodkraft_dev -f 20250922150245_broad_star.sql
```

## ⚙️ Step 4: Configure Local Environment

### Create Environment Files

**Admin/.env.local**

```env
# Local PostgreSQL
VITE_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sr_foodkraft_dev

# For direct PostgreSQL connection (without Supabase client)
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=sr_foodkraft_dev
VITE_DB_USER=postgres
VITE_DB_PASSWORD=your_password

# Disable Supabase for local dev
VITE_USE_LOCAL_DB=true

# If you still want to test Supabase
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_key_here
```

**Customer/.env.local**

```env
# Same as above
VITE_DATABASE_URL=postgresql://postgres:your_password@localhost:5432/sr_foodkraft_dev
VITE_DB_HOST=localhost
VITE_DB_PORT=5432
VITE_DB_NAME=sr_foodkraft_dev
VITE_DB_USER=postgres
VITE_DB_PASSWORD=your_password
VITE_USE_LOCAL_DB=true
```

## 🔧 Step 5: Update Code for Local Development

### Option A: Keep Supabase Client (Easier)

Connect Supabase client to local PostgreSQL using **Supabase Local Development**

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase locally
cd Customer
supabase init

# Start local Supabase (includes PostgreSQL, Auth, Storage)
supabase start

# This gives you:
# - Local PostgreSQL: postgresql://postgres:postgres@localhost:54322/postgres
# - Local Studio: http://localhost:54323
# - Local APIs: http://localhost:54321
```

### Option B: Use Direct PostgreSQL Connection

Install PostgreSQL client:

```bash
npm install pg
npm install @types/pg --save-dev
```

## 🎨 Step 6: pgAdmin Best Practices

### Essential pgAdmin Features

#### 1. **Query Tool**

```sql
-- Test your queries
SELECT * FROM menu_items;
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Check table structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'orders';
```

#### 2. **Create Tables Visually**

- Right-click `Tables` → `Create` → `Table`
- Define columns, constraints, indexes
- Generate SQL script

#### 3. **View Data**

- Right-click table → `View/Edit Data` → `All Rows`
- Edit data directly (careful!)
- Export to CSV/JSON

#### 4. **Backup & Restore**

```bash
# Backup
pg_dump -U postgres sr_foodkraft_dev > backup.sql

# Restore
psql -U postgres sr_foodkraft_dev < backup.sql
```

#### 5. **Performance Monitoring**

- Tools → Server Status
- Dashboard → View active connections
- Statistics → Table statistics

## 🔄 Development Workflow

### Daily Development

```bash
# 1. Start PostgreSQL (if not auto-started)
# Windows: Already running as service
# Mac: brew services start postgresql@15
# Linux: sudo systemctl start postgresql

# 2. Open pgAdmin
# View/edit data as needed

# 3. Run your app
cd Admin
npm run dev

cd Customer
npm run dev

# 4. Test features
# All data stays local - no cloud costs!
```

### Database Changes

```bash
# 1. Make changes in pgAdmin Query Tool
# OR create migration files

# 2. Export schema for team
pg_dump -U postgres -s sr_foodkraft_dev > schema.sql

# 3. Version control
git add schema.sql
git commit -m "Updated database schema"
```

## 🚀 Deployment Strategy

### When Ready for Production

#### Option 1: Deploy to Supabase

```bash
# 1. Create Supabase project
# 2. Export your local schema
pg_dump -U postgres -s sr_foodkraft_dev > schema.sql

# 3. Import to Supabase via pgAdmin
# Connect to Supabase (see connection details above)
# Run schema.sql in Query Tool

# 4. Update .env.production
VITE_SUPABASE_URL=your_production_url
VITE_SUPABASE_ANON_KEY=your_production_key
```

#### Option 2: Deploy to Any PostgreSQL Host

```yaml
Free PostgreSQL Hosts:
  - Supabase (500 MB free)
  - Neon (3 GB free)
  - ElephantSQL (20 MB free)
  - Railway (500 hrs free)
  - Render (90 days free)

Paid Options:
  - AWS RDS ($15-50/month)
  - DigitalOcean ($15/month)
  - Heroku Postgres ($9/month)
```

## 🛠️ Useful pgAdmin Tools

### 1. **ERD Tool (Entity Relationship Diagram)**

```
Right-click database → ERD For Database
→ Visual representation of all tables and relationships
```

### 2. **Import/Export Data**

```
Right-click table → Import/Export
→ CSV, JSON support
→ Great for seeding data
```

### 3. **SQL Snippets**

```sql
-- Find slow queries
SELECT query, calls, total_time, mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 10;

-- Check database size
SELECT pg_size_pretty(pg_database_size('sr_foodkraft_dev'));

-- Check table sizes
SELECT
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC;
```

## 📊 Recommended Extensions

```sql
-- Enable useful PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Text search
CREATE EXTENSION IF NOT EXISTS "btree_gin";      -- Better indexes
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements"; -- Query stats
```

## ✅ Checklist

- [ ] PostgreSQL 15+ installed
- [ ] pgAdmin 4 installed
- [ ] Database `sr_foodkraft_dev` created
- [ ] Migrations run successfully
- [ ] .env.local files created
- [ ] Can connect via pgAdmin
- [ ] Can query tables
- [ ] Application connects to local DB
- [ ] Test data inserted

## 🆘 Troubleshooting

### Can't connect to PostgreSQL

```bash
# Check if PostgreSQL is running
# Windows
services.msc → PostgreSQL

# Mac
brew services list

# Linux
sudo systemctl status postgresql
```

### Port 5432 already in use

```bash
# Find process using port
netstat -ano | findstr :5432

# Kill process or change PostgreSQL port
# Edit postgresql.conf
port = 5433
```

### Forgot PostgreSQL password

```bash
# Windows: Edit pg_hba.conf
# Change: md5 → trust
# Restart PostgreSQL
# Reset password:
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
# Change back: trust → md5
```

## 🎯 Next Steps

1. ✅ Set up PostgreSQL + pgAdmin (you're here)
2. 📝 Create database schema
3. 🔌 Connect your apps to local DB
4. 🧪 Seed test data
5. 💻 Start development
6. 🚀 Deploy to cloud when ready

---

**Need Help?**

- PostgreSQL Docs: https://www.postgresql.org/docs/
- pgAdmin Docs: https://www.pgadmin.org/docs/
- Stack Overflow: Tag your questions with `postgresql` and `pgadmin`
