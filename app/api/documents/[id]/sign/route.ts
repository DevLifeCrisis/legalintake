import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { signatureName } = await request.json()

  const { data: doc, error } = await supabaseAdmin
    .from('li_documents')
    .update({
      signed: true,
      signed_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Update matter
  await supabaseAdmin
    .from('li_matters')
    .update({
      engagement_letter_signed: true,
      status: 'active',
      updated_at: new Date().toISOString()
    })
    .eq('id', doc.matter_id)

  // Append signature to content
  const { data: docFull } = await supabaseAdmin
    .from('li_documents')
    .select('file_content')
    .eq('id', id)
    .single()

  if (docFull?.file_content) {
    await supabaseAdmin
      .from('li_documents')
      .update({
        file_content: `[SIGNED BY: ${signatureName} on ${new Date().toLocaleDateString()}]\n\n` + docFull.file_content
      })
      .eq('id', id)
  }

  return NextResponse.json({ success: true, document: doc })
}
