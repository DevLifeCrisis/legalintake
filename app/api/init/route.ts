import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'

export async function GET() {
  try {
    // Create tables
    const tables = [
      `CREATE TABLE IF NOT EXISTS li_firms (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        owner_id UUID,
        subscription_status TEXT DEFAULT 'active',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS li_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'attorney',
        firm_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS li_questionnaires (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firm_id UUID NOT NULL,
        name TEXT NOT NULL,
        practice_area TEXT NOT NULL,
        fields JSONB NOT NULL DEFAULT '[]',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS li_matters (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firm_id UUID NOT NULL,
        client_name TEXT NOT NULL,
        client_email TEXT NOT NULL,
        client_phone TEXT,
        practice_area TEXT NOT NULL,
        matter_description TEXT,
        status TEXT DEFAULT 'intake',
        intake_data JSONB DEFAULT '{}',
        questionnaire_id UUID,
        assigned_attorney_id UUID,
        conflict_checked BOOLEAN DEFAULT false,
        conflict_result TEXT,
        engagement_letter_sent BOOLEAN DEFAULT false,
        engagement_letter_signed BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS li_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        matter_id UUID NOT NULL,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'upload',
        storage_path TEXT,
        file_url TEXT,
        file_content TEXT,
        signed BOOLEAN DEFAULT false,
        signed_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS li_conflict_entries (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        firm_id UUID NOT NULL,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        matter_description TEXT,
        matter_id UUID,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`,
      `CREATE TABLE IF NOT EXISTS li_portal_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        matter_id UUID NOT NULL,
        token TEXT UNIQUE NOT NULL,
        email TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        used BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )`
    ]

    for (const sql of tables) {
      try {
        await supabaseAdmin.rpc('exec_sql', { sql })
      } catch {
        // Try direct query as fallback
      }
    }

    // Seed firm
    const firmId = 'a0000000-0000-0000-0000-000000000001'
    const { data: existingFirm } = await supabaseAdmin
      .from('li_firms')
      .select('id')
      .eq('id', firmId)
      .single()

    if (!existingFirm) {
      await supabaseAdmin.from('li_firms').insert({
        id: firmId,
        name: 'Admin Firm',
        subscription_status: 'active'
      })
    }

    // Seed admin
    const adminEmail = 'MrNorthbound@gmail.com'
    const { data: existingAdmin } = await supabaseAdmin
      .from('li_users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash('Jade@12!', 12)
      await supabaseAdmin.from('li_users').insert({
        id: 'a0000000-0000-0000-0000-000000000002',
        email: adminEmail,
        name: 'Admin',
        password_hash: passwordHash,
        role: 'admin',
        firm_id: firmId
      })
    }

    // Seed sample questionnaires
    const { count } = await supabaseAdmin
      .from('li_questionnaires')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', firmId)

    if (!count || count === 0) {
      await supabaseAdmin.from('li_questionnaires').insert([
        {
          firm_id: firmId,
          name: 'Personal Injury Intake',
          practice_area: 'Personal Injury',
          is_active: true,
          fields: [
            { id: 'f1', label: 'Date of Incident', type: 'date', required: true },
            { id: 'f2', label: 'Description of Incident', type: 'textarea', required: true },
            { id: 'f3', label: 'Were you injured?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'f4', label: 'Medical Treatment Received', type: 'textarea', required: false, conditional: { field: 'f3', value: 'Yes' } },
            { id: 'f5', label: 'Name of Other Party', type: 'text', required: false },
            { id: 'f6', label: 'Insurance Company (if known)', type: 'text', required: false }
          ]
        },
        {
          firm_id: firmId,
          name: 'Family Law Intake',
          practice_area: 'Family Law',
          is_active: true,
          fields: [
            { id: 'f1', label: 'Type of Matter', type: 'select', required: true, options: ['Divorce', 'Child Custody', 'Adoption', 'Paternity', 'Other'] },
            { id: 'f2', label: 'Are there children involved?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'f3', label: "Children's Names and Ages", type: 'textarea', required: false, conditional: { field: 'f2', value: 'Yes' } },
            { id: 'f4', label: 'Other Party Name', type: 'text', required: true },
            { id: 'f5', label: 'Date of Marriage', type: 'date', required: false },
            { id: 'f6', label: 'Brief description of situation', type: 'textarea', required: true }
          ]
        },
        {
          firm_id: firmId,
          name: 'Estate Planning Intake',
          practice_area: 'Estate Planning',
          is_active: true,
          fields: [
            { id: 'f1', label: 'Do you have an existing will?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'f2', label: 'Marital Status', type: 'select', required: true, options: ['Single', 'Married', 'Divorced', 'Widowed'] },
            { id: 'f3', label: 'Do you have children?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'f4', label: 'Number of children', type: 'number', required: false, conditional: { field: 'f3', value: 'Yes' } },
            { id: 'f5', label: 'Approximate estate value', type: 'select', required: false, options: ['Under $100K', '$100K-$500K', '$500K-$1M', 'Over $1M', 'Prefer not to say'] },
            { id: 'f6', label: 'Primary goals for estate plan', type: 'textarea', required: true }
          ]
        }
      ])
    }

    // Seed sample matters
    const { count: matterCount } = await supabaseAdmin
      .from('li_matters')
      .select('id', { count: 'exact', head: true })
      .eq('firm_id', firmId)

    if (!matterCount || matterCount === 0) {
      await supabaseAdmin.from('li_matters').insert([
        {
          firm_id: firmId,
          client_name: 'Jane Smith',
          client_email: 'jane.smith@example.com',
          client_phone: '555-0101',
          practice_area: 'Personal Injury',
          matter_description: 'Slip and fall at grocery store',
          status: 'active',
          conflict_checked: true,
          conflict_result: 'clear',
          engagement_letter_sent: true,
          engagement_letter_signed: true,
          intake_data: { 'Date of Incident': '2026-01-15', 'Description of Incident': 'Slip and fall in produce section' }
        },
        {
          firm_id: firmId,
          client_name: 'Robert Johnson',
          client_email: 'robert.j@example.com',
          client_phone: '555-0102',
          practice_area: 'Family Law',
          matter_description: 'Divorce proceedings',
          status: 'intake',
          conflict_checked: true,
          conflict_result: 'clear',
          engagement_letter_sent: false,
          intake_data: { 'Type of Matter': 'Divorce', 'Other Party Name': 'Susan Johnson' }
        },
        {
          firm_id: firmId,
          client_name: 'Maria Garcia',
          client_email: 'maria.g@example.com',
          client_phone: '555-0103',
          practice_area: 'Estate Planning',
          matter_description: 'Will and trust preparation',
          status: 'active',
          conflict_checked: true,
          conflict_result: 'clear',
          engagement_letter_sent: true,
          engagement_letter_signed: false,
          intake_data: { 'Marital Status': 'Married', 'Do you have children?': 'Yes' }
        }
      ])
    }

    return NextResponse.json({ success: true, message: 'Database initialized successfully' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
