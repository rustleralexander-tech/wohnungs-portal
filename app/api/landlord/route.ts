import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Vermieter-Stammdaten (erste/einzige Zeile)
export async function GET() {
  try {
    const { data, error } = await supabaseServer
      .from('landlord_profile')
      .select('*')
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json(data || {})
  } catch (error) {
    console.error('Error fetching landlord profile:', error)
    return NextResponse.json({ error: 'Failed to fetch landlord profile' }, { status: 500 })
  }
}

// PUT - Stammdaten speichern (upsert auf einzige Zeile)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    // Existierende Zeile holen
    const { data: existing } = await supabaseServer
      .from('landlord_profile')
      .select('id')
      .limit(1)
      .maybeSingle()

    let result
    if (existing?.id) {
      result = await supabaseServer
        .from('landlord_profile')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabaseServer
        .from('landlord_profile')
        .insert([body])
        .select()
        .single()
    }

    if (result.error) throw result.error
    return NextResponse.json(result.data)
  } catch (error) {
    console.error('Error saving landlord profile:', error)
    return NextResponse.json({ error: 'Failed to save landlord profile' }, { status: 500 })
  }
}
