'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '../../components/AppShell'

export default function NeuesObjektPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Record<string, string | boolean>>({
    name: '',
    address: '',
    zip: '',
    city: '',
    rooms: '',
    size_sqm: '',
    floor: '',
    furnished: true,
    base_rent: '',
    utilities: '',
    deposit: '',
    target_group: '',
    description: '',
    rules: '',
  })

  const set = (k: string, v: string | boolean) => setForm((p) => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!form.name) {
      setError('Bitte gib einen Namen für das Objekt an.')
      return
    }
    setSaving(true)

    // Zahlenfelder konvertieren
    const numeric = ['rooms', 'size_sqm', 'base_rent', 'utilities', 'deposit']
    const payload: Record<string, unknown> = { ...form }
    numeric.forEach((k) => {
      payload[k] = form[k] === '' ? null : Number(form[k])
    })

    const res = await fetch('/api/properties', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setSaving(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/objekte/${data.id}`)
    } else {
      setError('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    }
  }

  const input = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500'

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Neues Objekt anlegen</h1>

      <form onSubmit={handleSubmit} className="bg-white border rounded-xl p-6 space-y-6 max-w-2xl">
        {error && <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded-lg text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">Bezeichnung *</label>
          <input className={input} value={form.name as string} onChange={(e) => set('name', e.target.value)} placeholder="z.B. Apartment Kerpen Zentrum" />
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div className="sm:col-span-3">
            <label className="block text-sm font-medium mb-1">Straße & Hausnummer</label>
            <input className={input} value={form.address as string} onChange={(e) => set('address', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PLZ</label>
            <input className={input} value={form.zip as string} onChange={(e) => set('zip', e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">Ort</label>
            <input className={input} value={form.city as string} onChange={(e) => set('city', e.target.value)} />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Zimmer</label>
            <input className={input} type="number" step="0.5" value={form.rooms as string} onChange={(e) => set('rooms', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Wohnfläche (m²)</label>
            <input className={input} type="number" step="0.1" value={form.size_sqm as string} onChange={(e) => set('size_sqm', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Etage</label>
            <input className={input} value={form.floor as string} onChange={(e) => set('floor', e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.furnished as boolean} onChange={(e) => set('furnished', e.target.checked)} className="w-4 h-4" />
          Möbliert
        </label>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kaltmiete (€)</label>
            <input className={input} type="number" step="0.01" value={form.base_rent as string} onChange={(e) => set('base_rent', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nebenkosten (€)</label>
            <input className={input} type="number" step="0.01" value={form.utilities as string} onChange={(e) => set('utilities', e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Kaution (€)</label>
            <input className={input} type="number" step="0.01" value={form.deposit as string} onChange={(e) => set('deposit', e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Zielgruppe</label>
          <input className={input} value={form.target_group as string} onChange={(e) => set('target_group', e.target.value)} placeholder="z.B. Monteure, Studenten, Geschäftsleute, Pendler" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Beschreibung</label>
          <textarea className={`${input} h-24`} value={form.description as string} onChange={(e) => set('description', e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Hausordnung / Regeln</label>
          <textarea className={`${input} h-20`} value={form.rules as string} onChange={(e) => set('rules', e.target.value)} placeholder="z.B. Nichtraucher, keine Haustiere" />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-slate-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50">
            {saving ? 'Wird gespeichert…' : 'Objekt speichern'}
          </button>
          <button type="button" onClick={() => router.push('/')} className="px-5 py-2 rounded-lg border font-medium hover:bg-gray-50">
            Abbrechen
          </button>
        </div>
      </form>
    </AppShell>
  )
}
