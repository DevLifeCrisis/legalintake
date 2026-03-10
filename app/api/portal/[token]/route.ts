import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  // Find token
  const { data: portalToken, error: tokenError } = await supabaseAdmin
    .from('li_portal_tokens')
    .select('*')
    .eq('token', token)
    .single()

  if (tokenError || !portalToken) {
    return NextResponse.json({ error: 'Invalid or expired portal link' }, { status: 404 })
  }

  // Check expiry
  if (new Date(portalToken.expires_at) < new Date()) {
    return NextResponse.json({ error: 'This portal link has expired' }, { status: 410 })
  }

  // Get matter
  const { data: matter } = await supabaseAdmin
    .from('li_matters')
    .select('id, client_name, practice_area, status, engagement_letter_sent, engagement_letter_signed')
    .eq('id', portalToken.matter_id)
    .single()

  if (!matter) {
    return NextResponse.json({ error: 'Matter not found' }, { status: 404 })
  }

  // Get documents
  const { data: documents } = await supabaseAdmin
    .from('li_documents')
    .select('id, name, type, signed, signed_at, file_content, created_at')
    .eq('matter_id', portalToken.matter_id)
    .order('created_at', { ascending: false })

  return NextResponse.json({ matter, documents: documents || [] })
}
