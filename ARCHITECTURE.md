# 🏗️ SR FoodKraft - System Architecture

## 📊 Complete System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    SR FOODKRAFT SYSTEM                          │
│                   Catering Management Platform                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────┐         ┌──────────────────────┐      │
│  │   ADMIN PANEL       │         │   CUSTOMER APP       │      │
│  ├─────────────────────┤         ├──────────────────────┤      │
│  │ • Dashboard         │         │ • Browse Menu        │      │
│  │ • Order Management  │         │ • Place Orders       │      │
│  │ • Menu Management   │         │ • Track Delivery     │      │
│  │ • Customer Mgmt     │         │ • Payment           │      │
│  │ • Reports           │         │ • Reviews           │      │
│  │ • Settings          │         │ • Profile           │      │
│  │                     │         │                     │      │
│  │ React + TypeScript  │         │ React + TypeScript  │      │
│  │ TailwindCSS         │         │ TailwindCSS + PWA   │      │
│  │ Zustand (State)     │         │ Zustand (State)     │      │
│  │ Vite (Build)        │         │ Vite (Build)        │      │
│  └─────────────────────┘         └──────────────────────┘      │
│           │                               │                     │
│           └───────────────┬───────────────┘                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            │ API Calls (REST/GraphQL)
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                           ▼                                     │
│                    BACKEND LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  DEVELOPMENT ENVIRONMENT                  │  │
│  │              (Your Local Machine - FREE)                  │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  ┌─────────────┐                                         │  │
│  │  │ PostgreSQL  │  ← Database Engine                      │  │
│  │  │ Version 15+ │     • Menu Items                        │  │
│  │  └──────┬──────┘     • Orders                            │  │
│  │         │            • Customers                          │  │
│  │         │            • Payments                           │  │
│  │         │                                                 │  │
│  │  ┌──────┴──────┐                                         │  │
│  │  │  pgAdmin 4  │  ← Database GUI                         │  │
│  │  │             │     • View/Edit Data                    │  │
│  │  └─────────────┘     • Run Queries                       │  │
│  │                      • Manage Schema                     │  │
│  │                      • Backups                           │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 PRODUCTION ENVIRONMENT                    │  │
│  │                   (Cloud - When Ready)                    │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │                                                           │  │
│  │  Option 1: SUPABASE (Recommended) ⭐                      │  │
│  │  ├─ PostgreSQL Database                                  │  │
│  │  ├─ Authentication (Built-in)                            │  │
│  │  ├─ File Storage                                         │  │
│  │  ├─ Real-time Subscriptions                              │  │
│  │  ├─ Edge Functions (Serverless)                          │  │
│  │  ├─ Auto-generated REST API                              │  │
│  │  ├─ Auto-generated GraphQL API                           │  │
│  │  └─ Row Level Security (RLS)                             │  │
│  │                                                           │  │
│  │  FREE Tier: 500MB DB, 50K users, 5GB bandwidth           │  │
│  │  PRO: $25/month (8GB DB, 100GB bandwidth)                │  │
│  │                                                           │  │
│  │  Option 2: NEON                                          │  │
│  │  ├─ Serverless PostgreSQL                                │  │
│  │  ├─ 3GB free tier                                        │  │
│  │  └─ Auto-scaling                                         │  │
│  │                                                           │  │
│  │  Option 3: RAILWAY                                       │  │
│  │  ├─ PostgreSQL + Backend Hosting                         │  │
│  │  └─ $5 credit/month free                                 │  │
│  │                                                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │
┌───────────────────────────┼─────────────────────────────────────┐
│                           ▼                                     │
│                  EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  PAYMENT     │  │     SMS      │  │    EMAIL     │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │  Razorpay    │  │   Twilio     │  │   Resend     │         │
│  │  or Stripe   │  │   MSG91      │  │   SendGrid   │         │
│  │              │  │   AWS SNS    │  │   AWS SES    │         │
│  │ 2% per txn   │  │ ₹1-2 per SMS │  │ 3K free/mo   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   STORAGE    │  │     MAPS     │  │  ANALYTICS   │         │
│  ├──────────────┤  ├──────────────┤  ├──────────────┤         │
│  │ Cloudinary   │  │ Google Maps  │  │ Google       │         │
│  │ Supabase     │  │ OpenStreet   │  │ Analytics    │         │
│  │              │  │              │  │              │         │
│  │ 25GB free    │  │ Pay per use  │  │ FREE         │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE TABLES                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────┐
│ user_profiles   │ ─────────┐
├─────────────────┤          │
│ • id (PK)       │          │
│ • email         │          │
│ • name          │          │
│ • phone         │          │
│ • created_at    │          │
└────────┬────────┘          │
         │                   │
         │                   │
         ├───────────────────┼─────────────┐
         │                   │             │
         │                   │             │
┌────────▼────────┐   ┌──────▼──────┐  ┌──▼───────────────┐
│   addresses     │   │ orders      │  │ user_favorites   │
├─────────────────┤   ├─────────────┤  ├──────────────────┤
│ • id (PK)       │   │ • id (PK)   │  │ • id (PK)        │
│ • user_id (FK)  │   │ • user_id   │  │ • user_id (FK)   │
│ • type          │   │ • order_no  │  │ • menu_item_id   │
│ • street        │   │ • status    │  └──────────────────┘
│ • city          │   │ • total     │
│ • state         │   │ • date/time │
│ • zip_code      │   └──────┬──────┘
└─────────────────┘          │
                             │
┌──────────────────┐   ┌─────▼────────┐
│ menu_categories  │   │ order_items  │
├──────────────────┤   ├──────────────┤
│ • id (PK)        │◄──│ • id (PK)    │
│ • name           │   │ • order_id   │
│ • description    │   │ • menu_item  │
│ • display_order  │   │ • quantity   │
└────────┬─────────┘   │ • unit_price │
         │             │ • total      │
         │             └──────────────┘
         │
┌────────▼──────────┐
│   menu_items      │
├───────────────────┤
│ • id (PK)         │
│ • name            │
│ • description     │
│ • category_id     │
│ • price_per_kg    │
│ • price_per_piece │
│ • is_vegetarian   │
│ • is_available    │
│ • image_url       │
└───────────────────┘

┌──────────────────┐   ┌──────────────────┐
│ notifications    │   │ reviews          │
├──────────────────┤   ├──────────────────┤
│ • id (PK)        │   │ • id (PK)        │
│ • user_id (FK)   │   │ • user_id (FK)   │
│ • type           │   │ • order_id (FK)  │
│ • title          │   │ • menu_item_id   │
│ • message        │   │ • rating (1-5)   │
│ • is_read        │   │ • review_text    │
└──────────────────┘   └──────────────────┘
```

---

## 🔄 Data Flow

### **Customer Places Order**

```
1. Customer App
   └─> Browse Menu
       └─> Add Items to Cart
           └─> Enter Delivery Details
               └─> Select Payment Method
                   │
2. Backend (PostgreSQL)     ▼
   └─> Create Order Record
       └─> Create Order Items
           └─> Update Inventory
               │
3. Payment Service          ▼
   └─> Process Payment (Razorpay)
       └─> Verify Payment
           └─> Update Payment Status
               │
4. Notification Service     ▼
   └─> Send Confirmation SMS (Twilio)
       └─> Send Email Receipt (Resend)
           └─> Create In-App Notification
               │
5. Admin Panel              ▼
   └─> Show New Order
       └─> Update Order Status
           └─> Customer Gets Real-time Update
```

### **Admin Manages Menu**

```
1. Admin Panel
   └─> Add/Edit Menu Item
       └─> Upload Image
           │
2. Storage Service          ▼
   └─> Upload to Cloudinary
       └─> Get Image URL
           │
3. Backend (PostgreSQL)     ▼
   └─> Save Menu Item
       └─> Update Category
           │
4. Customer App             ▼
   └─> Auto-refresh Menu
       └─> Show New Item
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: AUTHENTICATION                                        │
│  ├─ Email/Password                                              │
│  ├─ OTP Verification                                            │
│  ├─ JWT Tokens                                                  │
│  └─ Session Management                                          │
│                                                                 │
│  Layer 2: AUTHORIZATION                                         │
│  ├─ Role-based Access (Admin vs Customer)                      │
│  ├─ Row Level Security (RLS)                                    │
│  └─ API Key Protection                                          │
│                                                                 │
│  Layer 3: DATA PROTECTION                                       │
│  ├─ HTTPS/TLS Encryption                                        │
│  ├─ Password Hashing (bcrypt)                                   │
│  ├─ SQL Injection Prevention                                    │
│  └─ XSS Protection                                              │
│                                                                 │
│  Layer 4: PAYMENT SECURITY                                      │
│  ├─ PCI DSS Compliant (via Razorpay)                           │
│  ├─ No card data stored                                         │
│  └─ Webhook Signature Verification                             │
│                                                                 │
│  Layer 5: MONITORING                                            │
│  ├─ Error Tracking (Sentry)                                     │
│  ├─ Activity Logs                                               │
│  ├─ Rate Limiting                                               │
│  └─ Intrusion Detection                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📈 Scaling Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                    GROWTH ROADMAP                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PHASE 1: MVP (0-100 orders/month)                              │
│  ├─ Local PostgreSQL Development                                │
│  ├─ Supabase FREE Tier                                          │
│  ├─ Basic features                                              │
│  └─ Cost: $0-$10/month                                          │
│                                                                 │
│  PHASE 2: GROWTH (100-1000 orders/month)                        │
│  ├─ Supabase PRO ($25/month)                                    │
│  ├─ Razorpay Integration                                        │
│  ├─ SMS/Email Notifications                                     │
│  ├─ Image Optimization (Cloudinary)                             │
│  └─ Cost: $50-$100/month                                        │
│                                                                 │
│  PHASE 3: SCALE (1000+ orders/month)                            │
│  ├─ Database Optimization (Indexes, Views)                      │
│  ├─ Caching Layer (Redis)                                       │
│  ├─ CDN for Images                                              │
│  ├─ Load Balancing                                              │
│  ├─ Background Jobs Queue                                       │
│  └─ Cost: $200-$500/month                                       │
│                                                                 │
│  PHASE 4: ENTERPRISE (5000+ orders/month)                       │
│  ├─ Dedicated Database                                          │
│  ├─ Microservices Architecture                                  │
│  ├─ Multi-region Deployment                                     │
│  ├─ Advanced Analytics                                          │
│  └─ Cost: $1000+/month                                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Development Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                   DEVELOPER WORKFLOW                            │
└─────────────────────────────────────────────────────────────────┘

Local Development:
┌──────────────┐
│ 1. Write Code│
└──────┬───────┘
       │
┌──────▼───────┐
│ 2. Test Local│ ← PostgreSQL + pgAdmin
└──────┬───────┘
       │
┌──────▼───────┐
│ 3. Git Commit│
└──────┬───────┘
       │
┌──────▼───────┐
│ 4. Push Code │
└──────┬───────┘
       │
Cloud Deployment:
┌──────▼───────┐
│ 5. CI/CD     │ ← GitHub Actions
└──────┬───────┘
       │
┌──────▼───────┐
│ 6. Build     │ ← Vite Build
└──────┬───────┘
       │
┌──────▼───────┐
│ 7. Deploy    │ ← Vercel/Netlify
└──────┬───────┘
       │
┌──────▼───────┐
│ 8. Test Live │ ← Staging Environment
└──────┬───────┘
       │
┌──────▼───────┐
│ 9. Production│ ← Go Live!
└──────────────┘
```

---

## 💰 Cost Optimization Tips

```
1. DATABASE
   ✅ Start with Supabase FREE (500MB)
   ✅ Optimize queries (use indexes)
   ✅ Archive old data regularly
   ✅ Use database views for complex queries

2. STORAGE
   ✅ Compress images before upload
   ✅ Use WebP format
   ✅ Lazy load images
   ✅ CDN caching

3. API CALLS
   ✅ Implement caching (localStorage)
   ✅ Batch requests
   ✅ Pagination
   ✅ Debounce search queries

4. NOTIFICATIONS
   ✅ Send only necessary SMS
   ✅ Use email for non-urgent
   ✅ In-app notifications when possible
   ✅ Batch notifications

5. MONITORING
   ✅ Set up usage alerts
   ✅ Monitor bandwidth usage
   ✅ Track API calls
   ✅ Regular cost audits
```

---

## 🎯 Technology Choices Explained

### **Why PostgreSQL?**

- ✅ Industry standard (used by Instagram, Spotify, Netflix)
- ✅ ACID compliant (reliable transactions)
- ✅ Rich data types (JSON, Arrays, etc.)
- ✅ Powerful querying
- ✅ Great tooling (pgAdmin)
- ✅ FREE and open source

### **Why Supabase?**

- ✅ Built on PostgreSQL (easy migration)
- ✅ Auth + Database + Storage in one
- ✅ Generous free tier
- ✅ Real-time features
- ✅ Auto-generated APIs
- ✅ Good documentation

### **Why React + TypeScript?**

- ✅ Component-based (reusable)
- ✅ Type safety (fewer bugs)
- ✅ Large ecosystem
- ✅ Great developer experience
- ✅ Industry standard

### **Why Razorpay?**

- ✅ India-focused (UPI, Cards, Wallets)
- ✅ Easy integration
- ✅ Competitive pricing (2%)
- ✅ Good support
- ✅ Instant settlements

---

## 📚 Recommended Reading Order

```
1. START_HERE.md ← You should read this first!
2. This file (ARCHITECTURE.md) ← Understanding the system
3. QUICK_START_GUIDE.md ← Get started in 5 minutes
4. README_BACKEND_SETUP.md ← Complete overview
5. DEVELOPMENT_SETUP.md ← Detailed setup instructions
```

---

**Now you understand the complete architecture! Ready to build?** 🚀

**Next:** Go to [START_HERE.md](START_HERE.md) to begin setup!
