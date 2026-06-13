'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  DocData,
  Mietvertrag,
  Wohnungsgeberbestaetigung,
  Kuendigung,
  Nebenkostenabrechnung,
} from './templates'

const TITLES: Record<string, string> = {
  mietvertrag: 'Mietvertrag',
  wohnungsgeberbestaetigung: 'Wohnungsgeberbestätigung',
  kuendigung: 'Kündigung',
  nebenkostenabrechnung: 'Nebenkostenabrechnung',
}

export default function DokumentPage({ params }: { params: Promise<{ id: string; type: string }> }) {
  const { id, type } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<DocData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch(`/api/tenancies/${id}`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false))
  }, [id])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Wird geladen…</div>
  }
  if (status === 'unauthenticated') return null
  if (!data || (data as { error?: string }).error) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Daten nicht gefunden.</div>
  }

  const propertyId = (data.property as { id?: string })?.id

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Toolbar – wird beim Druck ausgeblendet */}
      <div className="no-print bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link
            href={propertyId ? `/objekte/${propertyId}` : '/'}
            className="text-sm text-gray-500 hover:underline"
          >
            ← Zurück zum Objekt
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-600">{TITLES[type] || 'Dokument'}</span>
            <button
              onClick={() => window.print()}
              className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900"
            >
              🖨 Drucken / Als PDF speichern
            </button>
          </div>
        </div>
      </div>

      {/* Hinweis nur am Bildschirm */}
      <p className="no-print text-center text-xs text-gray-400 mt-3">
        Tipp: Im Druckdialog „Als PDF sichern" wählen. Felder mit __ vor dem Druck bei Bedarf ausfüllen.
      </p>

      {/* Dokumentblatt */}
      <div className="py-6">
        <div className="bg-white shadow-sm mx-auto" style={{ maxWidth: 820 }}>
          {type === 'mietvertrag' && <Mietvertrag d={data} />}
          {type === 'wohnungsgeberbestaetigung' && <Wohnungsgeberbestaetigung d={data} />}
          {type === 'kuendigung' && <Kuendigung d={data} />}
          {type === 'nebenkostenabrechnung' && <Nebenkostenabrechnung d={data} />}
          {!TITLES[type] && <p className="p-12 text-center text-gray-500">Unbekannter Dokumenttyp.</p>}
        </div>
      </div>
    </div>
  )
}
