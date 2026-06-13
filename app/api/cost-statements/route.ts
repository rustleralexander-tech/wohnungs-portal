import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

const DEFAULT_POSITIONS = [
  'Heizung / Warmwasser',
  'Wasser / Abwasser',
  'Grundsteuer',
  'Müllabfuhr',
  'Hausreinigung / Allgemeinstrom',
  'Gartenpflege',
  'Versicherungen (Gebäude/Haftpflicht)',
  'Hausmeister / Wartung',
  'Sonstiges',
].map((label) => ({ label, total_cost: 0, share_pct: 100 }))

// GET - Abrechnungen (gefiltert nach tenancy_id)
export async function GET(request: NextRequest) {
  try {
    const tenancyId = request.nextUrl.searchParams.get('tenancy_id')
    let query = supabaseServer.from('cost_statements').select('*').order('created_at', { ascending: false })
    if (tenancyId) query = query.eq('tenancy_id', tenancyId)
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching cost statements:', error)
    return NextResponse.json({ error: 'Failed to fetch cost statements' }, { status: 500 })
  }
}

// POST - Neue Abrechnung anlegen (mit Standard-Positionen und Vorauszahlung aus dem Mietverhältnis)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenancy_id } = body
    if (!tenancy_id) {
      return NextResponse.json({ error: 'tenancy_id erforderlich' }, { status: 400 })
    }

    // Vorauszahlung aus Mietverhältnis (utilities × 12) als Startwert
    const { data: tenancy } = await supabaseServer
      .from('tenancies')
      .select('utilities')
      .eq('id', tenancy_id)
      .single()

    const prepaymentTotal = tenancy?.utilities ? Number(tenancy.utilities) * 12 : 0

    const { data, error } = await supabaseServer
      .from('cost_statements')
      .insert([{
        tenancy_id,
        positions: DEFAULT_POSITIONS,
        prepayment_total: prepaymentTotal,
      }])
      .select()
      .single()

    if (error) throw error
    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating cost statement:', error)
    return NextResponse.json({ error: 'Failed to create cost statement' }, { status: 500 })
  }
}
