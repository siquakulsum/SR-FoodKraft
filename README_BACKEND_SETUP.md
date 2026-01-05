# 🍽️ SR FoodKraft - Backend Development Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack Recommendation](#tech-stack-recommendation)
- [Local Development Setup](#local-development-setup)
- [Database Management with pgAdmin](#database-management-with-pgadmin)
- [Deployment Options](#deployment-options)
- [Cost Analysis](#cost-analysis)

---

## 🎯 Overview

SR FoodKraft is a catering management system with:

- **Admin Panel**: Manage orders, menu, customers
- **Customer App**: Browse menu, place orders, track deliveries

This guide helps you set up the backend for **FREE local development** using PostgreSQL + pgAdmin.

---

## 💻 Tech Stack Recommendation

### ✅ **Recommended: Hybrid Architecture**

```
Development (Local - FREE):
  ├─ PostgreSQL (Database)
  ├─ pgAdmin (Database GUI)
  └─ Your React Apps

Production (Cloud):
  ├─ Supabase FREE Tier (500MB DB, 5GB bandwidth)
  │   OR
  ├─ Supabase Pro ($25/month - Recommended for production)
  │   OR
  └─ Other PostgreSQL hosts (Neon, Railway, etc.)
```

### **Why This Approach?**

| Aspect          | Benefit                                        |
| --------------- | ---------------------------------------------- |
| **Development** | 100% FREE - No cloud costs while building      |
| **Learning**    | Full control - Understand PostgreSQL deeply    |
| **Performance** | Fast - No network latency                      |
| **Privacy**     | Secure - Data stays on your machine            |
| **Flexibility** | Deploy anywhere - Not locked into one provider |

### **Complete Stack Overview**

```yaml
Frontend:
  - React 18 + TypeScript
  - Vite (Build tool)
  - TailwindCSS (Styling)
  - Zustand (State management)

Backend (Local Development):
  - PostgreSQL 15+ (Database)
  - pgAdmin 4 (Database GUI)
  - Direct PostgreSQL connection

Backend (Production Options):
  Option 1 - Supabase (Recommended):
    - PostgreSQL database
    - Built-in authentication
    - Real-time subscriptions
    - File storage
    - Edge functions
    - FREE: 500MB DB, 50K MAU, 5GB bandwidth
    - PRO: $25/month (8GB DB, 100GB bandwidth)

  Option 2 - Neon:
    - Serverless PostgreSQL
    - 3GB free tier
    - Auto-scaling

  Option 3 - Railway:
    - PostgreSQL + backend hosting
    - $5 credit/month free

Additional Services:
  - Payment: Razorpay (2% transaction fee)
  - SMS: Twilio or MSG91
  - Email: Resend (3,000/month free)
  - Images: Cloudinary (25GB free)
```

---

## 🚀 Local Development Setup

### **Quick Start (5 Minutes)**

1. **Install PostgreSQL + pgAdmin**

   **Windows:**

   ```bash
   # Download installer:
   https://www.postgresql.org/download/windows/
   # Install both PostgreSQL and pgAdmin
   ```

   **macOS:**

   ```bash
   brew install postgresql@15
   brew install --cask pgadmin4
   brew services start postgresql@15
   ```

   **Linux:**

   ```bash
   sudo apt install postgresql postgresql-contrib pgadmin4
   sudo systemctl start postgresql
   ```

2. **Run Setup Script**

   **Windows:**

   ```bash
   # Double-click or run:
   setup-development.bat
   ```

   **macOS/Linux:**

   ```bash
   chmod +x setup-development.sh
   ./setup-development.sh
   ```

3. **Configure Environment**

   Edit `Admin/.env.local` and `Customer/.env.local`:

   ```env
   VITE_DB_PASSWORD=your_postgres_password
   ```

4. **Start Development**

   ```bash
   # Terminal 1
   cd Admin
   npm run dev

   # Terminal 2
   cd Customer
   npm run dev
   ```

### **Manual Setup**

If you prefer manual setup, see [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for detailed instructions.

---

## 📊 Database Management with pgAdmin

### **Connecting to Database**

1. Open pgAdmin 4
2. Right-click `Servers` → `Create` → `Server`
3. **General Tab:**
   - Name: `SR FoodKraft Local`
4. **Connection Tab:**
   - Host: `localhost`
   - Port: `5432`
   - Database: `sr_foodkraft_dev`
   - Username: `postgres`
   - Password: `[your password]`
5. Click `Save`

### **Common Tasks**

#### View/Edit Data

```
1. Navigate to table (e.g., orders)
2. Right-click → View/Edit Data → All Rows
3. Edit inline, press F6 to save
```

#### Run SQL Queries

```
1. Tools → Query Tool
2. Write your SQL
3. Press F5 to execute
```

#### Add Sample Data

```sql
-- Run the seed file:
# In Query Tool: File → Open → seed-data.sql
# Then press F5
```

#### Backup Database

```
1. Right-click sr_foodkraft_dev → Backup
2. Format: Plain
3. Save as: backup_2024_10_14.sql
```

### **Useful Queries**

```sql
-- View all orders with customer info
SELECT
    o.order_number,
    u.name,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
JOIN user_profiles u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- Check database size
SELECT pg_size_pretty(pg_database_size('sr_foodkraft_dev'));

-- Most popular menu items
SELECT
    m.name,
    COUNT(oi.id) as times_ordered,
    SUM(oi.total_price) as total_revenue
FROM menu_items m
JOIN order_items oi ON m.id = oi.menu_item_id
GROUP BY m.id, m.name
ORDER BY times_ordered DESC;
```

---

## 🚀 Deployment Options

When you're ready to deploy to production:

### **Option 1: Supabase** ⭐ (Recommended)

**Why Supabase?**

- ✅ Already compatible (both use PostgreSQL)
- ✅ Easy migration from local DB
- ✅ Built-in auth, storage, real-time
- ✅ Generous free tier
- ✅ Automatic backups
- ✅ Global CDN

**Migration Steps:**

```bash
# 1. Export local schema
pg_dump -U postgres -s sr_foodkraft_dev > schema.sql

# 2. Create Supabase project (free)
https://supabase.com

# 3. Import schema in Supabase SQL Editor
# Copy-paste schema.sql content

# 4. Update .env.production
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# 5. Deploy your frontend
npm run build
```

**Pricing:**

- FREE: 500MB DB, 50K MAU, 5GB bandwidth
- PRO ($25/month): 8GB DB, 100GB bandwidth, daily backups

### **Option 2: Neon** (Serverless PostgreSQL)

**Why Neon?**

- ✅ 3GB free tier (vs Supabase 500MB)
- ✅ Serverless (auto-scales, auto-pauses)
- ✅ Branching (like Git for your database)
- ✅ Fast setup

**Migration Steps:**

```bash
# 1. Create account at neon.tech
# 2. Create project
# 3. Get connection string
# 4. Import your schema

psql "postgres://user:pass@host.neon.tech/db" < schema.sql
```

**Pricing:**

- FREE: 3GB storage, 100 hours compute/month
- PRO ($19/month): Unlimited, always active

### **Option 3: Railway**

**Why Railway?**

- ✅ Simple deployment
- ✅ PostgreSQL + backend hosting
- ✅ GitHub integration

**Pricing:**

- FREE: $5 credit/month (~500 hours)
- PRO: Pay as you go (~$10-20/month)

### **Option 4: Self-Hosted**

**Cheapest Options:**

```yaml
DigitalOcean:
  - Managed PostgreSQL: $15/month
  - Or Droplet + self-install: $6/month

Oracle Cloud Always Free:
  - 4 CPU, 24GB RAM - FREE FOREVER!
  - Install PostgreSQL yourself
  - Best for advanced users

Render:
  - PostgreSQL: $7/month (free for 90 days)
```

---

## 💰 Cost Analysis

### **Development Phase** (Now)

```yaml
PostgreSQL (Local): FREE ✅
pgAdmin: FREE ✅
Total: $0/month
```

### **Production Phase** (After Launch)

#### **Scenario 1: Minimal (0-100 orders/month)**

```yaml
Database: Supabase FREE
  - 500MB storage
  - 50K users
  - 5GB bandwidth
  Cost: $0

Payment Gateway: Razorpay
  - 2% per transaction
  Cost: Variable (₹200-₹500)

SMS: Twilio/MSG91
  - ₹1-2 per SMS
  Cost: ₹500-₹1000

Email: Resend
  - 3,000/month free
  Cost: $0

Total: ~₹700-₹1500/month ($8-18)
```

#### **Scenario 2: Growing (100-1000 orders/month)**

```yaml
Database: Supabase PRO
  Cost: $25/month (₹2,100)

Payment Gateway: Razorpay (2%)
  Cost: ₹2,000-₹10,000

SMS: ~500-1000/month
  Cost: ₹2,000-₹5,000

Email: Resend (up to 50K)
  Cost: $20/month (₹1,700)

Total: ~₹7,800-₹18,800/month ($95-230)
```

#### **Scenario 3: Established (1000+ orders/month)**

```yaml
Database: Supabase PRO + Add-ons
  Cost: $50-100/month (₹4,200-₹8,400)

Payment Gateway: Razorpay
  - Negotiate better rates (1.5-1.8%)
  Cost: ₹15,000-₹50,000

SMS: 2000-3000/month
  Cost: ₹8,000-₹15,000

Email: Resend/SendGrid
  Cost: $50/month (₹4,200)

CDN/Images: Cloudinary
  Cost: $89/month (₹7,500)

Total: ~₹38,900-₹85,100/month ($475-1040)
```

### **Cost Comparison**

| Approach           | Setup Cost | Monthly Cost | Scalability | Effort    |
| ------------------ | ---------- | ------------ | ----------- | --------- |
| **Supabase**       | $0         | $0-$25       | Excellent   | Low       |
| **Neon**           | $0         | $0-$19       | Excellent   | Low       |
| **Railway**        | $0         | $0-$20       | Good        | Low       |
| **DigitalOcean**   | $0         | $15-$50      | Good        | Medium    |
| **AWS/Azure**      | $0         | $30-$100     | Excellent   | High      |
| **Custom Backend** | $2K-$10K   | $50-$200     | Good        | Very High |

---

## 📁 Project Structure

```
SR FOODKRAFT/
├── Admin/                          # Admin Panel (React)
│   ├── src/
│   ├── .env.local                  # Local config (not in git)
│   └── package.json
│
├── Customer/                       # Customer App (React PWA)
│   ├── src/
│   ├── supabase/
│   │   └── migrations/             # Database migrations
│   ├── .env.local                  # Local config (not in git)
│   └── package.json
│
├── setup-local-db.sql              # Database schema
├── seed-data.sql                   # Sample data
├── env.example                     # Environment template
├── setup-development.bat           # Windows setup script
├── setup-development.sh            # macOS/Linux setup script
├── QUICK_START_GUIDE.md            # 5-minute setup
├── DEVELOPMENT_SETUP.md            # Detailed setup
└── README_BACKEND_SETUP.md         # This file
```

---

## 🎯 Recommended Workflow

### **Phase 1: Local Development** (Weeks 1-4)

```
✅ Set up PostgreSQL + pgAdmin
✅ Create database schema
✅ Add sample data
✅ Build features locally
✅ Test thoroughly
✅ Zero cloud costs
```

### **Phase 2: Cloud Testing** (Weeks 5-6)

```
✅ Create Supabase FREE account
✅ Import database schema
✅ Test cloud connectivity
✅ Configure authentication
✅ Test with small user group
```

### **Phase 3: Production Launch** (Week 7+)

```
✅ Upgrade to Supabase Pro ($25/month)
✅ Set up payment gateway (Razorpay)
✅ Configure SMS/Email services
✅ Deploy frontend (Vercel/Netlify)
✅ Monitor and optimize
```

---

## 🆘 Troubleshooting

### PostgreSQL Won't Start

```bash
# Windows
services.msc → PostgreSQL → Start

# macOS
brew services restart postgresql@15

# Linux
sudo systemctl restart postgresql
```

### Can't Connect in pgAdmin

```
1. Verify PostgreSQL is running
2. Check password is correct
3. Try: psql -U postgres -d sr_foodkraft_dev
4. Check pg_hba.conf if authentication fails
```

### Port 5432 in Use

```bash
# Find what's using it
netstat -ano | findstr :5432  # Windows
lsof -i :5432                 # macOS/Linux

# Kill process or change PostgreSQL port
```

### Migration to Supabase Failing

```bash
# Export with only schema (no data)
pg_dump -U postgres -s sr_foodkraft_dev > schema.sql

# Or export specific tables
pg_dump -U postgres -t menu_items sr_foodkraft_dev > menu_items.sql
```

---

## 📚 Resources

### Documentation

- **PostgreSQL:** https://www.postgresql.org/docs/
- **pgAdmin:** https://www.pgadmin.org/docs/
- **Supabase:** https://supabase.com/docs

### Tutorials

- **PostgreSQL Tutorial:** https://www.postgresqltutorial.com/
- **SQL for Beginners:** https://www.w3schools.com/sql/
- **Supabase Crash Course:** https://www.youtube.com/watch?v=7uKQBl9uZ00

### Community

- **PostgreSQL Discord:** https://discord.gg/postgresql
- **Supabase Discord:** https://discord.supabase.com/
- **Stack Overflow:** Tag questions with `postgresql` or `supabase`

---

## ✅ Quick Reference

### Essential Commands

```bash
# PostgreSQL
psql -U postgres                    # Connect
\l                                  # List databases
\c sr_foodkraft_dev                 # Connect to database
\dt                                 # List tables
\d table_name                       # Describe table
\q                                  # Quit

# Backup & Restore
pg_dump -U postgres sr_foodkraft_dev > backup.sql
psql -U postgres sr_foodkraft_dev < backup.sql

# Check if PostgreSQL is running
pg_isready
```

### pgAdmin Shortcuts

```
F5  - Execute query
F6  - Save changes
F7  - Format SQL
F8  - Execute all
Ctrl+Shift+C - Comment
Ctrl+Shift+U - Uncomment
```

---

## 🎉 You're All Set!

You now have:

- ✅ FREE local development environment
- ✅ PostgreSQL database with pgAdmin
- ✅ Sample data to test with
- ✅ Clear path to production deployment
- ✅ Cost-effective scaling strategy

**Start building and deploy when ready!** 🚀

---

## 📞 Need Help?

1. Check [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)
2. See [DEVELOPMENT_SETUP.md](DEVELOPMENT_SETUP.md) for details
3. Review [Troubleshooting](#troubleshooting) section
4. Ask in team chat or create an issue

**Happy Coding!** 🍽️✨
