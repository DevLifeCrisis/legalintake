import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const token = formData.get('token') as string | null
    const matterId = formData.get('matter_id') as string | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!token) {
      return NextResponse.json({ error: 'No portal token provided' }, { status: 400 })
    }

    // Validate the portal token
    const { data: portalToken, error: tokenError } = await supabaseAdmin
      .from('li_portal_tokens')
      .select('id, matter_id, expires_at, used')
      .eq('token', token)
      .single()

    if (tokenError || !portalToken) {
      return NextResponse.json({ error: 'Invalid portal token' }, { status: 403 })
    }

    if (new Date(portalToken.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Portal token has expired' }, { status: 403 })
    }

    const resolvedMatterId = matterId || portalToken.matter_id

    // Validate file type and size
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'text/plain'
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Please upload PDF, DOC, DOCX, JPG, PNG, or TXT files.' },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to ArrayBuffer for Supabase Storage upload
    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const timestamp = Date.now()
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const storagePath = `portal-uploads/${resolvedMatterId}/${timestamp}_${sanitizedName}`

    // Upload to Supabase Storage (bucket: 'documents')
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('documents')
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Supabase storage upload error:', uploadError)
      // If storage bucket doesn't exist, fall back to recording metadata only
      if (uploadError.message?.includes('Bucket not found') || uploadError.message?.includes('bucket')) {
        // Store document record without storage_path
        const { data: docRecord, error: dbError } = await supabaseAdmin
          .from('li_documents')
          .insert({
            matter_id: resolvedMatterId,
            name: file.name,
            type: 'client_upload',
            storage_path: null,
            file_url: null,
            signed: false
          })
          .select('id, name, created_at')
          .single()

        if (dbError) {
          return NextResponse.json({ error: 'Failed to record document: ' + dbError.message }, { status: 500 })
        }

        return NextResponse.json({
          success: true,
          document: docRecord,
          warning: 'File metadata recorded. Storage bucket not configured — contact your attorney for setup.'
        })
      }
      return NextResponse.json({ error: 'Upload failed: ' + uploadError.message }, { status: 500 })
    }

    // Get a public URL for the uploaded file
    const { data: publicUrlData } = supabaseAdmin.storage
      .from('documents')
      .getPublicUrl(uploadData.path)

    const fileUrl = publicUrlData?.publicUrl || null

    // Record the document in the database
    const { data: docRecord, error: dbError } = await supabaseAdmin
      .from('li_documents')
      .insert({
        matter_id: resolvedMatterId,
        name: file.name,
        type: 'client_upload',
        storage_path: uploadData.path,
        file_url: fileUrl,
        signed: false
      })
      .select('id, name, storage_path, file_url, created_at')
      .single()

    if (dbError) {
      return NextResponse.json({ error: 'File uploaded but failed to record: ' + dbError.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      document: docRecord
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Upload route error:', message)
    return NextResponse.json({ error: 'Server error: ' + message }, { status: 500 })
  }
}
