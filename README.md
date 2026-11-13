# AI-Powered Agriculture Crop Advisory Assistant 🌱

An autonomous, full-stack, production-grade agricultural intelligence application that leverages **Google Gemini 2.5 Flash (`@google/genai`)**, **Supabase Cloud PostgreSQL with Row Level Security (RLS)**, **Express.js**, and **React.js + Tailwind CSS** to provide farmers and agronomists with data-driven advice on crop selection, pest diagnostics, and soil health optimization based on localized NPK and climate telemetry.

---

## 🏗️ Architecture & Technology Stack

- **Frontend**: React.js 18 (Vite, React Router DOM v6+, Tailwind CSS, Lucide React Icons)
- **Backend**: Node.js & Express.js (REST API, JWT verification, Zod runtime validation)
- **Database & Auth**: Supabase Cloud PostgreSQL with strict Row Level Security (RLS) policies
- **AI Core**: Official Google Gen AI SDK (`@google/genai`) with `gemini-2.5-flash` in structured JSON mode (`responseMimeType: "application/json"`, strict `responseSchema`)
- **Validation**: Zod (Frontend forms & backend payload verification)

---

## 📁 Repository Structure

```text
├── package.json                   # Root orchestrator scripts
├── .env.example                   # Master environment template
├── README.md                      # Complete system documentation
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Core PostgreSQL DDL, RLS policies & seed procedures
├── scripts/
│   └── apply-migrations.js        # Node.js migration runner applying SQL directly to Supabase
├── server/                        # Express API Backend
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js               # Express application entry point
│       ├── controllers/
│       │   ├── farmController.js     # Farm CRUD operations
│       │   └── advisoryController.js # AI generation & advisory records
│       ├── middlewares/
│       │   └── auth.js            # Supabase JWT token verification
│       ├── routes/
│       │   ├── farmRoutes.js      # /api/farms endpoints
│       │   └── advisoryRoutes.js  # /api/advisory endpoints
│       ├── services/
│       │   └── geminiService.js   # @google/genai Gemini 2.5 Flash logic
│       ├── validations/
│       │   └── farmValidation.js  # Zod schemas (Farm & Advisory)
│       └── lib/
│           └── supabaseClient.js  # Supabase Admin & user-scoped clients
└── client/                        # React / Vite Frontend
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── src/
    │   ├── main.jsx
    │   ├── App.jsx                # Route declarations & ProtectedRoute guard
    │   ├── lib/
    │   │   ├── api.js             # Authenticated backend fetch wrappers
    │   │   └── supabaseClient.js  # Supabase client auth
    │   ├── context/
    │   │   └── AuthContext.jsx    # Session state & auth triggers
    │   ├── components/
    │   │   ├── Layout.jsx         # Sidebar navigation & header
    │   │   ├── DashboardCard.jsx  # Metric cards
    │   │   ├── FarmForm.jsx       # Farm creation form with validation
    │   │   ├── AdvisoryRequestForm.jsx # AI generation wizard & spinner
    │   │   └── AdvisoryReportDisplay.jsx # Formatted report with risk badges
    │   └── pages/
    │       ├── LandingPage.jsx    # Marketing & value prop
    │       ├── LoginPage.jsx      # Supabase Auth login
    │       ├── RegisterPage.jsx   # Supabase Auth register
    │       ├── DashboardPage.jsx  # Plots grid & advisory history
    │       ├── NewFarmPage.jsx    # Farm plot registration
    │       ├── FarmDetailPage.jsx # Plot telemetry & past advice
    │       ├── AdvisoryGeneratePage.jsx # AI wizard page
    │       └── AdvisoryDetailPage.jsx   # Single advisory report view
```

---

## ⚡ Quick Start Guide

### 1. Configure Environment Variables
Copy `.env.example` to `.env` in the root (and in `server/.env` and `client/.env`):

```bash
# Root & Server .env
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
DATABASE_URL=postgresql://postgres.your-project-ref:your-db-password@aws-0-us-east-1.pooler.supabase.com:5432/postgres
GEMINI_API_KEY=your_gemini_api_key
PORT=3000

# Client .env (client/.env)
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Apply Database Migrations to Supabase Cloud
Apply `/supabase/migrations/001_initial_schema.sql` directly to your Supabase Cloud PostgreSQL database:

```bash
npm run migrate
```
*(Alternatively, copy and paste the contents of `supabase/migrations/001_initial_schema.sql` directly into the Supabase Dashboard SQL Editor).*

This sets up:
- `farms` table with foreign key to `auth.users(id)` and cascading deletes
- `advisories` table with foreign key to `farms(id)` and `auth.users(id)`
- Strict Row Level Security (RLS) policies isolating tenants
- Automatic seed procedure `seed_sample_agri_data(target_user_id)` attached to `auth.users` on signup!

### 3. Install Dependencies
```bash
npm install
npm install --prefix server
npm install --prefix client
```

### 4. Start Development Servers
Open two terminals:

**Terminal 1 (Backend API on Port 3000):**
```bash
npm run server
```

**Terminal 2 (React Client on Port 5173):**
```bash
npm run client
```

Navigate to `http://localhost:5173` in your browser.

---

## 🛡️ Security & Tenant Isolation

- **Token Extraction**: All protected backend endpoints extract the JWT from the `Authorization: Bearer <token>` header.
- **Backend User Verification**: The server verifies the token with `supabase.auth.getUser(token)` before performing any database write or AI invocation.
- **RLS Enforced**: `user_id` is derived strictly from the verified JWT on the server, never accepted from user-supplied payload bodies.
- **API Key Secrecy**: `GEMINI_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` reside exclusively on the server and are never exposed to the client bundle.
