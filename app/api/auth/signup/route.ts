import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import bcrypt from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const { name, email, password, firmName } = await request.json()

    if (!name || !email || !password || !firmName) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // Check if user exists
    const { data: existing } = await supabaseAdmin
      .from('li_users')
      .select('id')
      .eq('email', email)
      .single()

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    // Create firm
    const firmId = uuidv4()
    const { error: firmError } = await supabaseAdmin
      .from('li_firms')
      .insert({ id: firmId, name: firmName, subscription_status: 'trial' })

    if (firmError) {
      return NextResponse.json({ error: 'Failed to create firm' }, { status: 500 })
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12)
    const userId = uuidv4()

    const { error: userError } = await supabaseAdmin
      .from('li_users')
      .insert({
        id: userId,
        email,
        name,
        password_hash: passwordHash,
        role: 'attorney',
        firm_id: firmId
      })

    if (userError) {
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    // Update firm owner
    await supabaseAdmin
      .from('li_firms')
      .update({ owner_id: userId })
      .eq('id', firmId)

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
