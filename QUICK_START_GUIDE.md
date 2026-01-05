# 🚀 SR FoodKraft - Quick Start Guide (PostgreSQL + pgAdmin)

## ⚡ 5-Minute Setup

### Step 1: Install PostgreSQL + pgAdmin

**Windows:**

```bash
# Download and run installer:
https://www.postgresql.org/download/windows/

# During installation:
# - Remember the password you set for 'postgres' user!
# - Keep default port: 5432
# - Install pgAdmin 4 (included)
```

**macOS:**

```bash
brew install postgresql@15
brew install --cask pgadmin4
brew services start postgresql@15
```

**Linux:**

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib pgadmin4
sudo systemctl start postgresql
```

### Step 2: Run Setup Script

**Windows:**

```bash
# Double-click: setup-development.bat
# OR in Command Prompt:
setup-development.bat
```

**macOS/Linux:**

```bash
chmod +x setup-development.sh
./setup-development.sh
```

### Step 3: Configure Environment

Edit `Admin/.env.local` and `Customer/.env.local`:

```env
VITE_DB_PASSWORD=your_actual_postgres_password
```

### Step 4: Open pgAdmin

1. **Launch pgAdmin 4**
2. **Add Server:**

   - Right-click `Servers` → `Create` → `Server`
   - **General Tab:**
     - Name: `SR FoodKraft Local`
   - **Connection Tab:**
     - Host: `localhost`
     - Port: `5432`
     - Database: `sr_foodkraft_dev`
     - Username: `postgres`
     - Password: `[your password]`
   - Click `Save`

3. **Verify Setup:**
   - Expand: `SR FoodKraft Local` → `Databases` → `sr_foodkraft_dev` → `Schemas` → `public` → `Tables`
   - You should see: `menu_items`, `orders`, `users`, etc.

### Step 5: Start Development

```bash
# Terminal 1: Admin Panel
cd Admin
npm run dev

# Terminal 2: Customer App
cd Customer
npm run dev
```

## ✅ You're Ready!

- **Admin Panel:** http://localhost:5173
- **Customer App:** http://localhost:5174
- **pgAdmin:** http://localhost:5050 (or desktop app)
- **Database:** localhost:5432

---

## 📊 Using pgAdmin for Development

### View/Edit Data

```
1. Navigate to table (e.g., menu_items)
2. Right-click → View/Edit Data → All Rows
3. Edit data directly in grid
4. Click Save (F6)
```

### Run Queries

```
1. Tools → Query Tool
2. Write SQL:
   SELECT * FROM orders WHERE status = 'placed';
3. Click Execute (F5)
```

### Export Data

```
1. Right-click table → Import/Export
2. Choose format (CSV, JSON)
3. Set file location
4. Click OK
```

### Backup Database

```
1. Right-click sr_foodkraft_dev → Backup
2. Choose file name: backup_2024_10_14.sql
3. Format: Plain
4. Click Backup
```

---

## 🛠️ Common Tasks

### Add Sample Menu Items

```sql
-- Run in pgAdmin Query Tool
INSERT INTO menu_items (name, description, category_id, price_per_kg, is_vegetarian)
SELECT
    'Chicken Biryani',
    'Aromatic rice with tender chicken',
    id,
    550.00,
    false
FROM menu_categories
WHERE name = 'Main Course';
```

### View Recent Orders

```sql
SELECT
    o.order_number,
    u.name as customer_name,
    o.total_amount,
    o.status,
    o.created_at
FROM orders o
JOIN user_profiles u ON o.user_id = u.id
ORDER BY o.created_at DESC
LIMIT 10;
```

### Check Database Size

```sql
SELECT
    pg_size_pretty(pg_database_size('sr_foodkraft_dev')) as size;
```

---

## 🆘 Troubleshooting

### PostgreSQL Not Starting?

```bash
# Windows
services.msc → Find PostgreSQL → Start

# macOS
brew services restart postgresql@15

# Linux
sudo systemctl restart postgresql
```

### Can't Connect in pgAdmin?

```
1. Check PostgreSQL is running (see above)
2. Verify password is correct
3. Try connecting via terminal:
   psql -U postgres -d sr_foodkraft_dev
```

### Port 5432 Already in Use?

```bash
# Find what's using the port
# Windows
netstat -ano | findstr :5432

# macOS/Linux
lsof -i :5432

# Kill the process or change PostgreSQL port
```

### Forgot PostgreSQL Password?

```bash
# Edit pg_hba.conf (location varies)
# Windows: C:\Program Files\PostgreSQL\15\data\pg_hba.conf
# macOS: /usr/local/var/postgres/pg_hba.conf
# Linux: /etc/postgresql/15/main/pg_hba.conf

# Change: md5 → trust
# Restart PostgreSQL
# Connect without password
psql -U postgres
ALTER USER postgres PASSWORD 'new_password';
# Change back: trust → md5
# Restart PostgreSQL
```

---

## 🎯 Development Workflow

### Daily Routine

```
1. ✅ Start PostgreSQL (auto-starts on Windows)
2. ✅ Open pgAdmin (optional - only when you need to view/edit data)
3. ✅ Run: npm run dev (in Admin or Customer)
4. ✅ Code your features
5. ✅ Test in browser
6. ✅ Check data in pgAdmin if needed
```

### Making Database Changes

```
1. Write SQL in pgAdmin Query Tool
2. Test the change
3. If good, save to a migration file
4. Commit to git
5. Share with team
```

### Before Committing

```bash
# Export current schema
pg_dump -U postgres -s sr_foodkraft_dev > schema.sql

# Add to git
git add schema.sql
git commit -m "Updated database schema"
```

---

## 🚀 Next Steps

- [ ] Complete local setup
- [ ] Create sample menu items in pgAdmin
- [ ] Test customer order flow
- [ ] Test admin order management
- [ ] Add more features
- [ ] Deploy to Supabase when ready

---

## 📚 Resources

- **PostgreSQL Docs:** https://www.postgresql.org/docs/
- **pgAdmin Docs:** https://www.pgadmin.org/docs/
- **SQL Tutorial:** https://www.w3schools.com/sql/
- **Full Setup Guide:** See `DEVELOPMENT_SETUP.md`

---

**Need Help?** Check the detailed guide in `DEVELOPMENT_SETUP.md` or ask in the team chat!

Happy Coding! 🎉
