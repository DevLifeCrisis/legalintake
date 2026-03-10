import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { matterId } = await request.json()

  // Get matter
  const { data: matter, error } = await supabaseAdmin
    .from('li_matters')
    .select('*')
    .eq('id', matterId)
    .single()

  if (error || !matter) return NextResponse.json({ error: 'Matter not found' }, { status: 404 })

  // Get firm
  const { data: firm } = await supabaseAdmin
    .from('li_firms')
    .select('*')
    .eq('id', matter.firm_id)
    .single()

  const firmName = firm?.name || 'Law Firm'
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // Generate engagement letter content
  const letterContent = `ENGAGEMENT LETTER

${today}

Dear ${matter.client_name},

Thank you for choosing ${firmName} to represent you. This letter confirms our agreement regarding the legal services we will provide to you.

SCOPE OF REPRESENTATION

You have engaged ${firmName} to represent you in the following matter:

Practice Area: ${matter.practice_area}
Matter Description: ${matter.matter_description || 'As discussed during our intake consultation'}

FEES AND BILLING

Our fees for the services described above will be communicated to you separately based on the specifics of your matter. You will receive detailed invoices for all work performed on your behalf.

CLIENT RESPONSIBILITIES

You agree to:
• Provide accurate and complete information relevant to your matter
• Respond promptly to requests for information or documents
• Keep us informed of any changes in your contact information
• Pay all fees and costs in accordance with our billing arrangements

CONFIDENTIALITY

All communications between you and this firm are protected by attorney-client privilege. We will maintain the confidentiality of all information you share with us.

CONFLICT OF INTEREST

We have conducted a conflict of interest check and have determined that no conflict exists that would prevent us from representing you.

TERMINATION

Either party may terminate this representation at any time with written notice, subject to our obligations under applicable professional conduct rules.

AGREEMENT

By signing below, you confirm that you have read, understood, and agree to the terms of this engagement letter.

Sincerely,

${session.user.name}
${firmName}

______________________________
Client Signature: ${matter.client_name}
Date: ___________________

______________________________
Attorney Signature: ${session.user.name}
Date: ${today}
`

  // Save document
  const docId = uuidv4()
  await supabaseAdmin.from('li_documents').insert({
    id: docId,
    matter_id: matterId,
    name: `Engagement Letter — ${matter.client_name}`,
    type: 'engagement_letter',
    file_content: letterContent,
    signed: false,
  })

  // Update matter status
  await supabaseAdmin
    .from('li_matters')
    .update({
      engagement_letter_sent: true,
      status: matter.status === 'intake' ? 'active' : matter.status,
      updated_at: new Date().toISOString()
    })
    .eq('id', matterId)

  return NextResponse.json({
    success: true,
    documentId: docId,
    content: letterContent
  })
}
