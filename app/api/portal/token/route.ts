import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matterId } = await request.json()

  const { data: matter } = await supabaseAdmin
    .from('li_matters')
    .select('id, client_email')
    .eq('id', matterId)
    .single()

  if (!matter) return NextResponse.json({ error: 'Matter not found' }, { status: 404 })

  const token = uuidv4()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days

  await supabaseAdmin.from('li_portal_tokens').insert({
    id: uuidv4(),
    matter_id: matterId,
    token,
    email: matter.client_email,
    expires_at: expiresAt,
    used: false,
  })

  return NextResponse.json({ token, portalUrl: `/portal/${token}` })
}
