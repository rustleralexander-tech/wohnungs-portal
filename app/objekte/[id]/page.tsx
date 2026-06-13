'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell } from '../../components/AppShell'
import { euro, germanDate } from '@/lib/format'
import { recommendPlatforms, priceHint } from '@/lib/listingAdvice'

interface Tenant {
  id: string
  full_name: string
  email: string | null
  phone: string | null
}
interface Tenancy {
  id: string
  start_date: string
  end_date: string | null
  rent_cold: number | null
  utilities: number | null
  deposit: number | null
  status: string
  tenant: Tenant
}
interface Property {
  id: string
  name: string
  address: string
  zip: string | null
  city: string | null
  rooms: number | null
  size_sqm: number | null
  floor: string | null
  furnished: boolean | null
  base_rent: number | null
  utilities: number | null
  deposit: number | null
  target_group: string | null
  description: string | null
  rules: string | null
  images: string[] | null
}

const DOCS = [
  { type: 'mietvertrag', label: 'Mietvertrag' },
  { type: 'wohnungsgeberbestaetigung', label: 'Wohnungsgeberbestätigung' },
  { type: 'kuendigung', label: 'Kündigung' },
]

const fitColor: Record<string, string> = {
  top: 'bg-green-100 text-green-800',
  gut: 'bg-blue-100 text-blue-800',
  optional: 'bg-gray-100 text-gray-600',
}

export default function ObjektDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [property, setProperty] = useState<Property | null>(null)
  const [tenancies, setTenancies] = useState<Tenancy[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const load = () => {
    Promise.all([
      fetch(`/api/properties/${id}`).then((r) => r.json()),
      fetch(`/api/tenancies?property_id=${id}`).then((r) => r.json()),
    ]).then(([prop, ten]) => {
      setProperty(prop)
      if (Array.isArray(ten)) setTenancies(ten)
      setLoading(false)
    })
  }

  useEffect(load, [id])

  if (loading) {
    return <AppShell><p className="text-gray-500">Wird geladen…</p></AppShell>
  }
  if (!property || (property as { error?: string }).error) {
    return <AppShell><p className="text-gray-500">Objekt nicht gefunden.</p></AppShell>
  }

  const platforms = recommendPlatforms(property)

  return (
    <AppShell>
      <div className="mb-4">
        <Link href="/" className="text-sm text-gray-500 hover:underline">← Zurück zur Übersicht</Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">{property.name}</h1>
          <p className="text-gray-500">{[property.address, property.zip, property.city].filter(Boolean).join(', ')}</p>
        </div>
        <div className="flex items-center gap-3">
          {property.furnished && <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">möbliert</span>}
          <Link
            href={`/objekte/${id}/bearbeiten`}
            className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 whitespace-nowrap"
          >
            Bearbeiten
          </Link>
        </div>
      </div>

      {/* Objektdaten */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Objektdaten</h2>
        <div className="grid sm:grid-cols-3 gap-y-3 gap-x-6 text-sm">
          <Fact label="Wohnfläche" value={property.size_sqm ? `${property.size_sqm} m²` : '–'} />
          <Fact label="Zimmer" value={property.rooms?.toString() || '–'} />
          <Fact label="Etage" value={property.floor || '–'} />
          <Fact label="Kaltmiete" value={euro(property.base_rent)} />
          <Fact label="Nebenkosten" value={euro(property.utilities)} />
          <Fact label="Kaution" value={euro(property.deposit)} />
          <Fact label="Zielgruppe" value={property.target_group || '–'} />
        </div>
        {property.description && <p className="text-sm text-gray-600 mt-4 whitespace-pre-wrap">{property.description}</p>}
      </section>

      {/* Bilder */}
      <ImageManager propertyId={id} initial={Array.isArray(property.images) ? property.images : []} />

      {/* Inserat-Empfehlung */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-1">Wo inserieren?</h2>
        <p className="text-sm text-gray-500 mb-4">Empfehlung anhand von Möblierung & Zielgruppe.</p>
        <div className="space-y-3">
          {platforms.map((pf) => (
            <div key={pf.name} className="flex items-start gap-3 border rounded-lg p-3">
              <span className={`text-xs px-2 py-0.5 rounded-full whitespace-nowrap mt-0.5 ${fitColor[pf.fit]}`}>{pf.fit}</span>
              <div className="flex-1">
                <a href={pf.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">
                  {pf.name} ↗
                </a>
                <p className="text-sm text-gray-600">{pf.reason}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-900">
          <strong>Mietpreis:</strong> {priceHint(property)}
        </div>
      </section>

      {/* Mietverhältnisse */}
      <section className="bg-white border rounded-xl p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold">Mieter & Mietverhältnisse</h2>
          <button onClick={() => setShowForm(!showForm)} className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900">
            {showForm ? 'Abbrechen' : '+ Mieter eintragen'}
          </button>
        </div>

        {showForm && (
          <TenancyForm
            propertyId={id}
            defaults={{ rent_cold: property.base_rent, utilities: property.utilities, deposit: property.deposit }}
            onCreated={() => { setShowForm(false); load() }}
          />
        )}

        {tenancies.length === 0 ? (
          <p className="text-sm text-gray-500">Noch kein Mieter eingetragen.</p>
        ) : (
          <div className="space-y-4">
            {tenancies.map((t) => (
              <div key={t.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{t.tenant?.full_name}</p>
                    <p className="text-sm text-gray-500">
                      {germanDate(t.start_date)} – {t.end_date ? germanDate(t.end_date) : 'unbefristet'}
                      {t.rent_cold != null && ` · ${euro(t.rent_cold)} kalt`}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {DOCS.map((d) => (
                    <Link
                      key={d.type}
                      href={`/dokumente/${t.id}/${d.type}`}
                      className="text-xs border rounded-lg px-3 py-1.5 hover:bg-gray-50 font-medium"
                    >
                      📄 {d.label}
                    </Link>
                  ))}
                  <Link
                    href={`/nebenkosten/${t.id}`}
                    className="text-xs border border-slate-300 bg-slate-50 rounded-lg px-3 py-1.5 hover:bg-slate-100 font-medium"
                  >
                    🧮 Nebenkostenabrechnung
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <button
        onClick={async () => {
          if (confirm('Objekt wirklich löschen?')) {
            await fetch(`/api/properties/${id}`, { method: 'DELETE' })
            router.push('/')
          }
        }}
        className="text-sm text-red-600 hover:underline"
      >
        Objekt löschen
      </button>
    </AppShell>
  )
}

function ImageManager({ propertyId, initial }: { propertyId: string; initial: string[] }) {
  const [images, setImages] = useState<string[]>(initial)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    setUploading(true)
    setError('')
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`/api/properties/${propertyId}/images`, { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || 'Upload fehlgeschlagen')
          break
        }
        setImages(data.images)
      }
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDelete = async (url: string) => {
    const res = await fetch(`/api/properties/${propertyId}/images?url=${encodeURIComponent(url)}`, { method: 'DELETE' })
    if (res.ok) {
      const data = await res.json()
      setImages(data.images)
    }
  }

  return (
    <section className="bg-white border rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold">Fotos</h2>
        <label className="text-sm bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 cursor-pointer">
          {uploading ? 'Wird hochgeladen…' : '+ Foto hochladen'}
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" disabled={uploading} />
        </label>
      </div>
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {images.length === 0 ? (
        <p className="text-sm text-gray-500">Noch keine Fotos. Lade Bilder hoch, um sie beim Inserieren zu verwenden.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((url) => (
            <div key={url} className="relative group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="Objektfoto" className="w-full h-32 object-cover rounded-lg border" />
              <button
                onClick={() => handleDelete(url)}
                className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition"
              >
                Löschen
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-gray-400 text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function TenancyForm({
  propertyId,
  defaults,
  onCreated,
}: {
  propertyId: string
  defaults: { rent_cold: number | null; utilities: number | null; deposit: number | null }
  onCreated: () => void
}) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({
    full_name: '',
    email: '',
    phone: '',
    birth_date: '',
    birth_place: '',
    nationality: '',
    prev_address: '',
    start_date: '',
    end_date: '',
    rent_cold: defaults.rent_cold?.toString() || '',
    utilities: defaults.utilities?.toString() || '',
    deposit: defaults.deposit?.toString() || '',
  })
  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }))
  const input = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm'

  const submit = async () => {
    if (!form.full_name || !form.start_date) {
      alert('Mietername und Mietbeginn sind erforderlich.')
      return
    }
    setSaving(true)
    const res = await fetch('/api/tenancies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id: propertyId,
        tenant: {
          full_name: form.full_name,
          email: form.email || null,
          phone: form.phone || null,
          birth_date: form.birth_date || null,
          birth_place: form.birth_place || null,
          nationality: form.nationality || null,
          prev_address: form.prev_address || null,
        },
        start_date: form.start_date,
        end_date: form.end_date || null,
        rent_cold: form.rent_cold ? Number(form.rent_cold) : null,
        utilities: form.utilities ? Number(form.utilities) : null,
        deposit: form.deposit ? Number(form.deposit) : null,
      }),
    })
    setSaving(false)
    if (res.ok) onCreated()
    else alert('Speichern fehlgeschlagen.')
  }

  return (
    <div className="border rounded-lg p-4 mb-4 bg-gray-50 space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Mieter</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Vor- und Nachname *</label><input className={input} value={form.full_name} onChange={(e) => set('full_name', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">E-Mail</label><input className={input} value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Telefon</label><input className={input} value={form.phone} onChange={(e) => set('phone', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Geburtsdatum</label><input className={input} type="date" value={form.birth_date} onChange={(e) => set('birth_date', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Geburtsort</label><input className={input} value={form.birth_place} onChange={(e) => set('birth_place', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Staatsangehörigkeit</label><input className={input} value={form.nationality} onChange={(e) => set('nationality', e.target.value)} /></div>
          <div className="sm:col-span-2"><label className="text-xs text-gray-500">Bisherige Anschrift</label><input className={input} value={form.prev_address} onChange={(e) => set('prev_address', e.target.value)} /></div>
        </div>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Mietverhältnis</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div><label className="text-xs text-gray-500">Mietbeginn *</label><input className={input} type="date" value={form.start_date} onChange={(e) => set('start_date', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Mietende (leer = unbefristet)</label><input className={input} type="date" value={form.end_date} onChange={(e) => set('end_date', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Kaltmiete (€)</label><input className={input} type="number" step="0.01" value={form.rent_cold} onChange={(e) => set('rent_cold', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Nebenkosten (€)</label><input className={input} type="number" step="0.01" value={form.utilities} onChange={(e) => set('utilities', e.target.value)} /></div>
          <div><label className="text-xs text-gray-500">Kaution (€)</label><input className={input} type="number" step="0.01" value={form.deposit} onChange={(e) => set('deposit', e.target.value)} /></div>
        </div>
      </div>
      <button onClick={submit} disabled={saving} className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900 disabled:opacity-50">
        {saving ? 'Wird gespeichert…' : 'Mieter & Mietverhältnis speichern'}
      </button>
    </div>
  )
}
