import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: matters, error } = await supabaseAdmin
    .from('li_matters')
    .select('*')
    .eq('firm_id', session.user.firm_id || 'a0000000-0000-0000-0000-000000000001')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ matters: matters || [] })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const firmId = session.user.firm_id || 'a0000000-0000-0000-0000-000000000001'

  const matterId = uuidv4()
  const { data: matter, error } = await supabaseAdmin
    .from('li_matters')
    .insert({
      id: matterId,
      firm_id: firmId,
      client_name: body.client_name,
      client_email: body.client_email,
      client_phone: body.client_phone || null,
      practice_area: body.practice_area,
      matter_description: body.matter_description || null,
      status: 'intake',
      intake_data: body.intake_data || {},
      questionnaire_id: body.questionnaire_id || null,
      assigned_attorney_id: session.user.id,
      conflict_checked: false,
      engagement_letter_sent: false,
      engagement_letter_signed: false,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Add to conflict entries database
  await supabaseAdmin.from('li_conflict_entries').insert({
    firm_id: firmId,
    name: body.client_name,
    email: body.client_email,
    phone: body.client_phone || null,
    matter_description: body.matter_description || null,
    matter_id: matterId,
  })

  return NextResponse.json({ matter })
}
