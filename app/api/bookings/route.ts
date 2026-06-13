import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - List all bookings (for admin)
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabaseServer
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const { guest_name, email, phone, check_in, check_out, property_id, notes } = body

    // Validation
    if (!guest_name || !email || !check_in || !check_out || !property_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create booking with pending status
    const { data, error } = await supabaseServer
      .from('bookings')
      .insert([
        {
          guest_name,
          email,
          phone,
          check_in,
          check_out,
          property_id,
          notes,
          status: 'pending',
        }
      ])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
