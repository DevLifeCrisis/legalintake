-- LegalIntake Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS li_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'attorney' CHECK (role IN ('admin', 'attorney', 'staff', 'client')),
  firm_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Firms table
CREATE TABLE IF NOT EXISTS li_firms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID,
  subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Questionnaires table
CREATE TABLE IF NOT EXISTS li_questionnaires (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL,
  name TEXT NOT NULL,
  practice_area TEXT NOT NULL,
  fields JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matters table
CREATE TABLE IF NOT EXISTS li_matters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL,
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  client_phone TEXT,
  practice_area TEXT NOT NULL,
  matter_description TEXT,
  status TEXT DEFAULT 'intake' CHECK (status IN ('intake', 'active', 'closed', 'conflict')),
  intake_data JSONB DEFAULT '{}',
  questionnaire_id UUID,
  assigned_attorney_id UUID,
  conflict_checked BOOLEAN DEFAULT false,
  conflict_result TEXT,
  engagement_letter_sent BOOLEAN DEFAULT false,
  engagement_letter_signed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents table
CREATE TABLE IF NOT EXISTS li_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('upload', 'engagement_letter', 'other')),
  storage_path TEXT,
  file_url TEXT,
  signed BOOLEAN DEFAULT false,
  signed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conflict entries table (searchable database for conflict checks)
CREATE TABLE IF NOT EXISTS li_conflict_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firm_id UUID NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  matter_description TEXT,
  adverse_parties TEXT[],
  matter_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client portal tokens (for client access without full auth)
CREATE TABLE IF NOT EXISTS li_portal_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matter_id UUID NOT NULL,
  token TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE li_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE li_firms ENABLE ROW LEVEL SECURITY;
ALTER TABLE li_questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE li_matters ENABLE ROW LEVEL SECURITY;
ALTER TABLE li_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE li_conflict_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE li_portal_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies (permissive for service role)
CREATE POLICY "Service role full access" ON li_users FOR ALL USING (true);
CREATE POLICY "Service role full access" ON li_firms FOR ALL USING (true);
CREATE POLICY "Service role full access" ON li_questionnaires FOR ALL USING (true);
CREATE POLICY "Service role full access" ON li_matters FOR ALL USING (true);
CREATE POLICY "Service role full access" ON li_documents FOR ALL USING (true);
CREATE POLICY "Service role full access" ON li_conflict_entries FOR ALL USING (true);
CREATE POLICY "Service role full access" ON li_portal_tokens FOR ALL USING (true);
