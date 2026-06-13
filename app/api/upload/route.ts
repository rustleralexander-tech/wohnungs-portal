import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST - Upload file (document, contract, etc.)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const docType = formData.get('type') as string // 'passport', 'id', 'contract'
    const email = formData.get('email') as string
    const bookingId = formData.get('bookingId') as string | null

    if (!file || !docType || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPG, PNG' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Max 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${email}_${docType}_${timestamp}.${file.name.split('.').pop()}`
    const filePath = `documents/${filename}`

    // Upload to Supabase Storage
    const buffer = await file.arrayBuffer()
    const { error: uploadError } = await supabaseServer.storage
      .from('documents')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) throw uploadError

    // Get public URL
    const { data: urlData } = supabaseServer.storage
      .from('documents')
      .getPublicUrl(filePath)

    const fileUrl = urlData?.publicUrl

    // Update guest document if applicable
    if (docType === 'id' || docType === 'passport') {
      const { error: updateError } = await supabaseServer
        .from('guests')
        .upsert(
          {
            email,
            document_type: docType,
            document_url: fileUrl,
          },
          { onConflict: 'email' }
        )

      if (updateError) throw updateError
    }

    // Update booking contract if applicable
    if (docType === 'contract' && bookingId) {
      const { error: contractError } = await supabaseServer
        .from('bookings')
        .update({ notes: `Contract uploaded: ${fileUrl}` })
        .eq('id', bookingId)

      if (contractError) throw contractError
    }

    return NextResponse.json({
      success: true,
      url: fileUrl,
      filename,
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}
