import { supabaseServer } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// GET - Fetch single booking
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseServer
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking (mainly for status changes)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { status, notes, total_price, payment_method } = body

    const updates: any = {}
    if (status) updates.status = status
    if (notes !== undefined) updates.notes = notes
    if (total_price !== undefined) updates.total_price = total_price
    if (payment_method !== undefined) updates.payment_method = payment_method

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseServer
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// DELETE - Cancel booking
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabaseServer
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()

    if (error) throw error
    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error cancelling booking:', error)
    return NextResponse.json(
      { error: 'Failed to cancel booking' },
      { status: 500 }
    )
  }
}
