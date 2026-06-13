import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Mietverhältnisse (optional gefiltert nach property_id), mit Mieter + Objekt
export async function GET(request: NextRequest) {
  try {
    const propertyId = request.nextUrl.searchParams.get('property_id')

    let query = supabaseServer
      .from('tenancies')
      .select('*, tenant:tenants(*), property:properties(*)')
      .order('created_at', { ascending: false })

    if (propertyId) {
      query = query.eq('property_id', propertyId)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching tenancies:', error)
    return NextResponse.json({ error: 'Failed to fetch tenancies' }, { status: 500 })
  }
}

// POST - Neues Mietverhältnis: legt Mieter an (falls neu) und verknüpft mit Objekt
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenant, property_id, start_date, end_date, move_in_date, rent_cold, utilities, deposit, notes } = body

    if (!property_id || !tenant?.full_name || !start_date) {
      return NextResponse.json({ error: 'Objekt, Mietername und Beginn sind erforderlich' }, { status: 400 })
    }

    // Mieter anlegen
    const { data: tenantRow, error: tenantErr } = await supabaseServer
      .from('tenants')
      .insert([tenant])
      .select()
      .single()

    if (tenantErr) throw tenantErr

    // Mietverhältnis anlegen
    const { data, error } = await supabaseServer
      .from('tenancies')
      .insert([{
        property_id,
        tenant_id: tenantRow.id,
        start_date,
        end_date: end_date || null,
        move_in_date: move_in_date || start_date,
        rent_cold: rent_cold || null,
        utilities: utilities || null,
        deposit: deposit || null,
        notes: notes || null,
        status: 'active',
      }])
      .select('*, tenant:tenants(*), property:properties(*)')
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating tenancy:', error)
    return NextResponse.json({ error: 'Failed to create tenancy' }, { status: 500 })
  }
}
