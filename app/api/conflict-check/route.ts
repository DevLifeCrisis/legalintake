import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { clientName, clientEmail, adverseParties } = await request.json()
  const firmId = session.user.firm_id || 'a0000000-0000-0000-0000-000000000001'

  const conflicts: Array<{
    type: string
    matched_name: string
    matter_id: string
    description: string
  }> = []

  // Check by name (fuzzy: contains)
  if (clientName) {
    const nameParts = clientName.toLowerCase().split(' ')
    const { data: nameMatches } = await supabaseAdmin
      .from('li_conflict_entries')
      .select('*')
      .eq('firm_id', firmId)
      .or(nameParts.map((p: string) => `name.ilike.%${p}%`).join(','))

    if (nameMatches && nameMatches.length > 0) {
      for (const match of nameMatches) {
        conflicts.push({
          type: 'name_match',
          matched_name: match.name,
          matter_id: match.matter_id,
          description: match.matter_description || 'Existing client/matter'
        })
      }
    }
  }

  // Check by email
  if (clientEmail) {
    const { data: emailMatches } = await supabaseAdmin
      .from('li_conflict_entries')
      .select('*')
      .eq('firm_id', firmId)
      .ilike('email', clientEmail)

    if (emailMatches && emailMatches.length > 0) {
      for (const match of emailMatches) {
        const alreadyAdded = conflicts.some(c => c.matter_id === match.matter_id)
        if (!alreadyAdded) {
          conflicts.push({
            type: 'email_match',
            matched_name: match.name,
            matter_id: match.matter_id,
            description: match.matter_description || 'Existing client/matter'
          })
        }
      }
    }
  }

  // Check adverse parties
  if (adverseParties && adverseParties.length > 0) {
    for (const party of adverseParties) {
      const parts = party.toLowerCase().split(' ')
      const { data: partyMatches } = await supabaseAdmin
        .from('li_conflict_entries')
        .select('*')
        .eq('firm_id', firmId)
        .or(parts.map((p: string) => `name.ilike.%${p}%`).join(','))

      if (partyMatches && partyMatches.length > 0) {
        for (const match of partyMatches) {
          conflicts.push({
            type: 'adverse_party_match',
            matched_name: match.name,
            matter_id: match.matter_id,
            description: `Adverse party conflict: ${match.matter_description || 'Existing matter'}`
          })
        }
      }
    }
  }

  const hasConflict = conflicts.length > 0

  return NextResponse.json({
    hasConflict,
    conflicts,
    checkedAt: new Date().toISOString(),
    summary: hasConflict
      ? `${conflicts.length} potential conflict(s) found. Review before proceeding.`
      : 'No conflicts found. Clear to proceed.'
  })
}
