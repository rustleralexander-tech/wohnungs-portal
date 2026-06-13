import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Abrechnung mit Mietverhältnis, Mieter, Objekt UND Vermieter (für PDF)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseServer
      .from('cost_statements')
      .select('*, tenancy:tenancies(*, tenant:tenants(*), property:properties(*))')
      .eq('id', id)
      .single()

    if (error) throw error

    const { data: landlord } = await supabaseServer
      .from('landlord_profile')
      .select('*')
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ ...data, landlord: landlord || {} })
  } catch (error) {
    console.error('Error fetching cost statement:', error)
    return NextResponse.json({ error: 'Failed to fetch cost statement' }, { status: 500 })
  }
}

// PATCH - Abrechnung aktualisieren
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const updates: Record<string, unknown> = {}
    for (const key of ['period_start', 'period_end', 'prepayment_total', 'positions', 'notes']) {
      if (key in body) updates[key] = body[key]
    }

    const { data, error } = await supabaseServer
      .from('cost_statements')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating cost statement:', error)
    return NextResponse.json({ error: 'Failed to update cost statement' }, { status: 500 })
  }
}

// DELETE
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseServer.from('cost_statements').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting cost statement:', error)
    return NextResponse.json({ error: 'Failed to delete cost statement' }, { status: 500 })
  }
}
