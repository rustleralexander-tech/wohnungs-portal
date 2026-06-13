'use client'

export const dynamic = 'force-dynamic'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Booking {
  id: string
  guest_name: string
  email: string
  phone: string
  check_in: string
  check_out: string
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled'
  total_price: number | null
  payment_method: string | null
  notes: string | null
  created_at: string
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [updateStatus, setUpdateStatus] = useState('')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/admin/login')
    }
  }, [status, router])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchBookings()
    }
  }, [status])

  const fetchBookings = async () => {
    try {
      const res = await fetch('/api/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data)
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedBooking || !updateStatus) return

    try {
      const res = await fetch(`/api/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: updateStatus }),
      })

      if (res.ok) {
        const updated = await res.json()
        setBookings(bookings.map(b => b.id === updated.id ? updated : b))
        setSelectedBooking(updated)
        setUpdateStatus('')
      }
    } catch (err) {
      console.error('Error updating status:', err)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-gray-100 text-gray-800',
      cancelled: 'bg-red-100 text-red-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Wird geladen...</div>
      </div>
    )
  }

  if (status !== 'authenticated') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <div className="flex gap-4">
            <span className="text-gray-600">{session?.user?.email}</span>
            <Link href="/" className="text-blue-600 hover:underline">
              Zur Website
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Alle Buchungen</p>
            <p className="text-3xl font-bold">{bookings.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Ausstehend</p>
            <p className="text-3xl font-bold">{bookings.filter(b => b.status === 'pending').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Genehmigt</p>
            <p className="text-3xl font-bold">{bookings.filter(b => b.status === 'approved').length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <p className="text-gray-600 text-sm">Aktiv</p>
            <p className="text-3xl font-bold">{bookings.filter(b => b.status === 'active').length}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8">
          {/* Bookings Table */}
          <div className="col-span-2">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-6 py-4 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold">Buchungen</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Zeitraum</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(booking => (
                      <tr
                        key={booking.id}
                        onClick={() => setSelectedBooking(booking)}
                        className={`border-b cursor-pointer hover:bg-gray-50 ${
                          selectedBooking?.id === booking.id ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-6 py-3 text-sm">{booking.guest_name}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">{booking.email}</td>
                        <td className="px-6 py-3 text-sm text-gray-600">
                          {new Date(booking.check_in).toLocaleDateString('de-DE')} -{' '}
                          {new Date(booking.check_out).toLocaleDateString('de-DE')}
                        </td>
                        <td className="px-6 py-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div>
            {selectedBooking ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-bold mb-4">Details</h2>
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-600 text-sm">Name</p>
                    <p className="font-semibold">{selectedBooking.guest_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Email</p>
                    <p className="font-semibold">{selectedBooking.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Telefon</p>
                    <p className="font-semibold">{selectedBooking.phone || '-'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Einzug</p>
                    <p className="font-semibold">{new Date(selectedBooking.check_in).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Auszug</p>
                    <p className="font-semibold">{new Date(selectedBooking.check_out).toLocaleDateString('de-DE')}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm mb-2">Status ändern</p>
                    <select
                      value={updateStatus}
                      onChange={(e) => setUpdateStatus(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg mb-3"
                    >
                      <option value="">Status wählen</option>
                      <option value="approved">Approved</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    {updateStatus && (
                      <button
                        onClick={handleStatusUpdate}
                        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
                      >
                        Update
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-600">
                Wähle eine Buchung aus
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
