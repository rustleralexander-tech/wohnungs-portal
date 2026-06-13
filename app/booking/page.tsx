'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function BookingPage() {
  const [formData, setFormData] = useState({
    guest_name: '',
    email: '',
    phone: '',
    check_in: '',
    check_out: '',
    notes: '',
  })
  const [idFile, setIdFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
        setError('Nur PDF und Bilder (JPG, PNG) sind erlaubt')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Datei ist zu groß (max 5MB)')
        return
      }
      setIdFile(file)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Validate required fields
      if (!formData.guest_name || !formData.email || !formData.check_in || !formData.check_out) {
        setError('Bitte alle erforderlichen Felder ausfüllen')
        setLoading(false)
        return
      }

      if (!idFile) {
        setError('Bitte ein Ausweisdokument hochladen')
        setLoading(false)
        return
      }

      // 1. Upload ID document
      const uploadFormData = new FormData()
      uploadFormData.append('file', idFile)
      uploadFormData.append('type', 'id')
      uploadFormData.append('email', formData.email)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      })

      if (!uploadRes.ok) {
        throw new Error('Fehler beim Hochladen des Ausweises')
      }

      // 2. Create booking
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          property_id: process.env.NEXT_PUBLIC_PROPERTY_ID || 'default-property',
          document_url: (await uploadRes.json()).url,
        }),
      })

      if (!bookingRes.ok) {
        throw new Error('Fehler beim Erstellen der Buchung')
      }

      setSuccess(true)
      setFormData({
        guest_name: '',
        email: '',
        phone: '',
        check_in: '',
        check_out: '',
        notes: '',
      })
      setIdFile(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold">🏠 Wohnungs Portal</Link>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">
            Admin
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <section className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">Buchungsanfrage</h1>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-semibold text-green-900 mb-4">✓ Anfrage eingegangen!</h2>
            <p className="text-green-800 mb-4">
              Deine Buchungsanfrage wurde erfolgreich eingereicht.
              Der Vermieter wird dich in Kürze kontaktieren.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Zurück zur Startseite
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-lg">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded">
                {error}
              </div>
            )}

            {/* Guest Name */}
            <div>
              <label className="block text-sm font-semibold mb-2">Vollständiger Name *</label>
              <input
                type="text"
                name="guest_name"
                value={formData.guest_name}
                onChange={handleFormChange}
                placeholder="Max Mustermann"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold mb-2">Email-Adresse *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="max@example.com"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold mb-2">Telefonnummer</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleFormChange}
                placeholder="+49 123 456789"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Check-in Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Einzugsdatum *</label>
              <input
                type="date"
                name="check_in"
                value={formData.check_in}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Check-out Date */}
            <div>
              <label className="block text-sm font-semibold mb-2">Auszugsdatum *</label>
              <input
                type="date"
                name="check_out"
                value={formData.check_out}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* ID Document Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Ausweiskopie (PDF, JPG, PNG) *</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
                className="w-full px-4 py-2 border rounded-lg"
                required
              />
              {idFile && (
                <p className="text-sm text-green-600 mt-2">✓ {idFile.name} ausgewählt</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold mb-2">Zusätzliche Informationen</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                placeholder="z.B. Grund des Aufenthalts, Besonderheiten..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
              />
            </div>

            {/* Terms */}
            <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
              <p>
                Mit dieser Anfrage akzeptierst du, dass ein Mietvertrag notwendig ist.
                Der Vermieter wird dich kontaktieren um die weiteren Schritte zu klären.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {loading ? 'Wird verarbeitet...' : 'Anfrage absenden'}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Wohnungs Portal © 2026
          </p>
        </div>
      </footer>
    </div>
  )
}
