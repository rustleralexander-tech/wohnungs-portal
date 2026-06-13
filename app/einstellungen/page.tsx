'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { AppShell } from '../components/AppShell'

const FIELDS: { key: string; label: string; placeholder?: string; group: string }[] = [
  { key: 'full_name', label: 'Vor- und Nachname', placeholder: 'Alexander Rustler', group: 'Person' },
  { key: 'address_street', label: 'Straße & Hausnummer', placeholder: 'Musterstraße 1', group: 'Person' },
  { key: 'address_zip', label: 'PLZ', placeholder: '50171', group: 'Person' },
  { key: 'address_city', label: 'Ort', placeholder: 'Kerpen', group: 'Person' },
  { key: 'email', label: 'E-Mail', placeholder: 'mail@example.com', group: 'Kontakt' },
  { key: 'phone', label: 'Telefon', placeholder: '+49 …', group: 'Kontakt' },
  { key: 'iban', label: 'IBAN', placeholder: 'DE…', group: 'Bankverbindung' },
  { key: 'bic', label: 'BIC', placeholder: '', group: 'Bankverbindung' },
  { key: 'bank_name', label: 'Bank', placeholder: 'Sparkasse …', group: 'Bankverbindung' },
  { key: 'tax_id', label: 'Steuernummer / Steuer-ID', placeholder: '', group: 'Sonstiges' },
]

export default function EinstellungenPage() {
  const [form, setForm] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetch('/api/landlord')
      .then((r) => r.json())
      .then((data) => setForm(data || {}))
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    const res = await fetch('/api/landlord', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  const groups = Array.from(new Set(FIELDS.map((f) => f.group)))

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-1">Vermieter-Stammdaten</h1>
      <p className="text-gray-500 text-sm mb-6">
        Diese Daten werden automatisch in alle Dokumente (Mietvertrag, Wohnungsgeberbestätigung etc.) eingesetzt.
      </p>

      {loading ? (
        <p className="text-gray-500">Wird geladen…</p>
      ) : (
        <div className="bg-white border rounded-xl p-6 space-y-6 max-w-2xl">
          {groups.map((group) => (
            <div key={group}>
              <h2 className="font-semibold text-sm text-gray-400 uppercase tracking-wide mb-3">{group}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {FIELDS.filter((f) => f.group === group).map((f) => (
                  <div key={f.key}>
                    <label className="block text-sm font-medium mb-1">{f.label}</label>
                    <input
                      type="text"
                      value={form[f.key] || ''}
                      onChange={(e) => handleChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-slate-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50"
            >
              {saving ? 'Wird gespeichert…' : 'Speichern'}
            </button>
            {saved && <span className="text-green-600 text-sm">✓ Gespeichert</span>}
          </div>
        </div>
      )}
    </AppShell>
  )
}
