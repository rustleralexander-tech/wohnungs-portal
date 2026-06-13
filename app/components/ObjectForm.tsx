'use client'

import { useState } from 'react'

export interface ObjectFormValues {
  name?: string | null
  address?: string | null
  zip?: string | null
  city?: string | null
  rooms?: number | string | null
  size_sqm?: number | string | null
  floor?: string | null
  furnished?: boolean | null
  base_rent?: number | string | null
  utilities?: number | string | null
  deposit?: number | string | null
  target_group?: string | null
  description?: string | null
  rules?: string | null
}

const NUMERIC = ['rooms', 'size_sqm', 'base_rent', 'utilities', 'deposit']

export function ObjectForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: ObjectFormValues
  submitLabel: string
  onSubmit: (payload: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState<Record<string, string | boolean>>({
    name: initial?.name ?? '',
    address: initial?.address ?? '',
    zip: initial?.zip ?? '',
    city: initial?.city ?? '',
    rooms: initial?.rooms?.toString() ?? '',
    size_sqm: initial?.size_sqm?.toString() ?? '',
    floor: initial?.floor ?? '',
    furnished: initial?.furnished ?? true,
    base_rent: initial?.base_rent?.toString() ?? '',
    utilities: initial?.utilities?.toString() ?? '',
    deposit: initial?.deposit?.toString() ?? '',
    target_group: initial?.target_group ?? '',
    description: initial?.description ?? '',
    rules: initial?.rules ?? '',
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
    const payload: Record<string, unknown> = { ...form }
    NUMERIC.forEach((k) => {
      payload[k] = form[k] === '' ? null : Number(form[k])
    })
    try {
      await onSubmit(payload)
    } catch {
      setError('Speichern fehlgeschlagen. Bitte erneut versuchen.')
      setSaving(false)
    }
  }

  const input = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500'

  return (
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
          {saving ? 'Wird gespeichert…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="px-5 py-2 rounded-lg border font-medium hover:bg-gray-50">
          Abbrechen
        </button>
      </div>
    </form>
  )
}
