# LegalIntake

**Professional client intake system for solo and small law firms.**

LegalIntake replaces intake chaos — email chains, PDFs, spreadsheet conflict checks — with a streamlined, automated onboarding portal.

## Features

- **Custom Intake Questionnaires** — Build per-practice-area forms with conditional logic
- **Automated Conflict Checking** — Check new clients against existing matter database
- **Engagement Letter Generation** — Auto-generate and e-sign engagement letters
- **Client Portal** — Secure link-based portal for document upload and e-signature
- **Matter Dashboard** — CRM-style view of all clients and intake data

## Stack

- Next.js 14 App Router + TypeScript
- Tailwind CSS (mobile-first)
- Supabase (database)
- NextAuth (authentication)
- Vercel (deployment)

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/DevLifeCrisis/legalintake.git
cd legalintake
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=your_random_secret_string
NEXTAUTH_URL=http://localhost:3000
```

### 3. Database Setup

Initialize the database (creates all tables + seeds admin account):

```
GET /api/init
```

Or visit `http://localhost:3000/api/init` after starting the dev server.

### 4. Run Dev Server

```bash
npm run dev
```

## Admin Account

Seeded at startup:
- **Email:** MrNorthbound@gmail.com
- **Password:** Jade@12!

## Deployment (Vercel)

```bash
vercel --prod
```

Set environment variables in Vercel dashboard.

## Pricing

$19/month flat rate — full feature access.

## License

© 2026 LegalIntake. All rights reserved.
