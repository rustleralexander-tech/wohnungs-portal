import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Einzelnes Mietverhältnis mit Mieter, Objekt UND Vermieter-Stammdaten
// (alles was für die Dokumentengenerierung gebraucht wird)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data: tenancy, error } = await supabaseServer
      .from('tenancies')
      .select('*, tenant:tenants(*), property:properties(*)')
      .eq('id', id)
      .single()

    if (error) throw error

    const { data: landlord } = await supabaseServer
      .from('landlord_profile')
      .select('*')
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ ...tenancy, landlord: landlord || {} })
  } catch (error) {
    console.error('Error fetching tenancy:', error)
    return NextResponse.json({ error: 'Failed to fetch tenancy' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabaseServer.from('tenancies').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting tenancy:', error)
    return NextResponse.json({ error: 'Failed to delete tenancy' }, { status: 500 })
  }
}
