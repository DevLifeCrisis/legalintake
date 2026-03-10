import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const firmId = session.user.firm_id || 'a0000000-0000-0000-0000-000000000001'

  const { data: questionnaires, error } = await supabaseAdmin
    .from('li_questionnaires')
    .select('*')
    .eq('firm_id', firmId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questionnaires: questionnaires || [] })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const firmId = session.user.firm_id || 'a0000000-0000-0000-0000-000000000001'

  const { data: questionnaire, error } = await supabaseAdmin
    .from('li_questionnaires')
    .insert({
      id: uuidv4(),
      firm_id: firmId,
      name: body.name,
      practice_area: body.practice_area,
      fields: body.fields || [],
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ questionnaire })
}
