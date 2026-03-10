import { supabaseAdmin } from './supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function initDatabase() {
  try {
    // Create tables using raw SQL via RPC
    await supabaseAdmin.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS li_users (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          email TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'attorney',
          firm_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS li_firms (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          name TEXT NOT NULL,
          owner_id UUID,
          subscription_status TEXT DEFAULT 'trial',
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS li_questionnaires (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          firm_id UUID NOT NULL,
          name TEXT NOT NULL,
          practice_area TEXT NOT NULL,
          fields JSONB NOT NULL DEFAULT '[]',
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS li_matters (
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
        );

        CREATE TABLE IF NOT EXISTS li_documents (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          matter_id UUID NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL DEFAULT 'upload',
          storage_path TEXT,
          file_url TEXT,
          signed BOOLEAN DEFAULT false,
          signed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS li_conflict_entries (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          firm_id UUID NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          phone TEXT,
          matter_description TEXT,
          matter_id UUID,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );

        CREATE TABLE IF NOT EXISTS li_portal_tokens (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          matter_id UUID NOT NULL,
          token TEXT UNIQUE NOT NULL,
          email TEXT NOT NULL,
          expires_at TIMESTAMPTZ NOT NULL,
          used BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT NOW()
        );
      `
    })
  } catch {
    // Tables may already exist, continue
  }

  // Seed admin account
  const adminEmail = 'MrNorthbound@gmail.com'
  const adminPassword = 'Jade@12!'
  const firmId = uuidv4()
  const adminId = uuidv4()

  try {
    // Check if firm exists
    const { data: existingFirm } = await supabaseAdmin
      .from('li_firms')
      .select('id')
      .eq('name', 'Admin Firm')
      .single()

    let activeFirmId = existingFirm?.id || firmId

    if (!existingFirm) {
      const { data: newFirm } = await supabaseAdmin
        .from('li_firms')
        .insert({ id: firmId, name: 'Admin Firm', subscription_status: 'active' })
        .select('id')
        .single()
      activeFirmId = newFirm?.id || firmId
    }

    // Check if admin user exists
    const { data: existingAdmin } = await supabaseAdmin
      .from('li_users')
      .select('id')
      .eq('email', adminEmail)
      .single()

    if (!existingAdmin) {
      const passwordHash = await bcrypt.hash(adminPassword, 12)
      await supabaseAdmin.from('li_users').insert({
        id: adminId,
        email: adminEmail,
        name: 'Admin',
        password_hash: passwordHash,
        role: 'admin',
        firm_id: activeFirmId
      })
    }

    // Seed sample questionnaire
    const { data: existingQ } = await supabaseAdmin
      .from('li_questionnaires')
      .select('id')
      .eq('name', 'Personal Injury Intake')
      .single()

    if (!existingQ) {
      const { data: adminUser } = await supabaseAdmin
        .from('li_users')
        .select('firm_id')
        .eq('email', adminEmail)
        .single()

      if (adminUser?.firm_id) {
        await supabaseAdmin.from('li_questionnaires').insert({
          firm_id: adminUser.firm_id,
          name: 'Personal Injury Intake',
          practice_area: 'Personal Injury',
          is_active: true,
          fields: [
            { id: 'f1', label: 'Date of Incident', type: 'date', required: true },
            { id: 'f2', label: 'Description of Incident', type: 'textarea', required: true },
            { id: 'f3', label: 'Were you injured?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'f4', label: 'Medical Treatment Received', type: 'textarea', required: false, conditional: { field: 'f3', value: 'Yes' } },
            { id: 'f5', label: 'Name of Other Party', type: 'text', required: false },
            { id: 'f6', label: 'Insurance Company', type: 'text', required: false }
          ]
        })

        await supabaseAdmin.from('li_questionnaires').insert({
          firm_id: adminUser.firm_id,
          name: 'Family Law Intake',
          practice_area: 'Family Law',
          is_active: true,
          fields: [
            { id: 'f1', label: 'Type of Matter', type: 'select', required: true, options: ['Divorce', 'Child Custody', 'Adoption', 'Other'] },
            { id: 'f2', label: 'Are there children involved?', type: 'radio', required: true, options: ['Yes', 'No'] },
            { id: 'f3', label: "Children's Names and Ages", type: 'textarea', required: false, conditional: { field: 'f2', value: 'Yes' } },
            { id: 'f4', label: 'Other Party Name', type: 'text', required: true },
            { id: 'f5', label: 'Date of Marriage', type: 'date', required: false },
            { id: 'f6', label: 'Brief description of situation', type: 'textarea', required: true }
          ]
        })
      }
    }

    return { success: true }
  } catch (error) {
    console.error('DB init error:', error)
    return { success: false, error }
  }
}
