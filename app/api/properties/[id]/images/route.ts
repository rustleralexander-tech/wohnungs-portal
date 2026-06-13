import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const BUCKET = 'property-images'

// POST - Bild hochladen und an property.images anhängen
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'Keine Datei' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Nur Bilddateien erlaubt' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Bild zu groß (max 10MB)' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'jpg'
    const path = `${id}/${Date.now()}.${ext}`
    const buffer = await file.arrayBuffer()

    const { error: uploadError } = await supabaseServer.storage
      .from(BUCKET)
      .upload(path, buffer, { contentType: file.type, upsert: false })

    if (uploadError) throw uploadError

    const { data: urlData } = supabaseServer.storage.from(BUCKET).getPublicUrl(path)
    const url = urlData.publicUrl

    // An images-Array anhängen
    const { data: prop } = await supabaseServer
      .from('properties')
      .select('images')
      .eq('id', id)
      .single()

    const images: string[] = Array.isArray(prop?.images) ? prop.images : []
    images.push(url)

    const { error: updateError } = await supabaseServer
      .from('properties')
      .update({ images })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({ url, images })
  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Upload fehlgeschlagen' }, { status: 500 })
  }
}

// DELETE - Bild aus der Liste entfernen (?url=...)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const url = request.nextUrl.searchParams.get('url')
    if (!url) return NextResponse.json({ error: 'url fehlt' }, { status: 400 })

    const { data: prop } = await supabaseServer
      .from('properties')
      .select('images')
      .eq('id', id)
      .single()

    const images: string[] = Array.isArray(prop?.images) ? prop.images : []
    const next = images.filter((u) => u !== url)

    const { error } = await supabaseServer
      .from('properties')
      .update({ images: next })
      .eq('id', id)

    if (error) throw error

    // Datei aus dem Storage löschen (Pfad nach dem Bucket-Namen extrahieren)
    const marker = `/${BUCKET}/`
    const idx = url.indexOf(marker)
    if (idx !== -1) {
      const storagePath = url.substring(idx + marker.length)
      await supabaseServer.storage.from(BUCKET).remove([storagePath])
    }

    return NextResponse.json({ images: next })
  } catch (error) {
    console.error('Image delete error:', error)
    return NextResponse.json({ error: 'Löschen fehlgeschlagen' }, { status: 500 })
  }
}
