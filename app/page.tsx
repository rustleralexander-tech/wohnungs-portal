'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AppShell } from './components/AppShell'
import { euro } from '@/lib/format'

interface Property {
  id: string
  name: string
  city: string | null
  zip: string | null
  address: string
  size_sqm: number | null
  rooms: number | null
  furnished: boolean | null
  base_rent: number | null
  target_group: string | null
}

export default function Dashboard() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/properties')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProperties(data)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <AppShell>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Meine Objekte</h1>
          <p className="text-gray-500 text-sm">Verwalte deine Mietobjekte, Mieter und Dokumente</p>
        </div>
        <Link
          href="/objekte/neu"
          className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 transition"
        >
          + Objekt anlegen
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-500">Wird geladen…</p>
      ) : properties.length === 0 ? (
        <div className="bg-white border rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🏠</p>
          <h2 className="text-lg font-semibold mb-1">Noch keine Objekte</h2>
          <p className="text-gray-500 mb-4">Lege dein erstes Mietobjekt an, um loszulegen.</p>
          <Link href="/objekte/neu" className="text-slate-800 font-medium hover:underline">
            + Erstes Objekt anlegen
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {properties.map((p) => (
            <Link
              key={p.id}
              href={`/objekte/${p.id}`}
              className="bg-white border rounded-xl p-5 hover:shadow-md transition block"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{p.name}</h3>
                {p.furnished && (
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">möbliert</span>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-3">
                {[p.address, p.zip, p.city].filter(Boolean).join(', ') || 'Keine Adresse'}
              </p>
              <div className="flex gap-4 text-sm text-gray-600">
                {p.size_sqm && <span>{p.size_sqm} m²</span>}
                {p.rooms && <span>{p.rooms} Zi.</span>}
                {p.base_rent != null && <span className="font-medium">{euro(p.base_rent)}</span>}
              </div>
              {p.target_group && (
                <p className="text-xs text-gray-400 mt-2">Zielgruppe: {p.target_group}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </AppShell>
  )
}
