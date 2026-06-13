'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { NebenkostenAbrechnungFilled, StatementDocData } from '../../../dokumente/[id]/[type]/templates'

export default function NebenkostenPdfPage({ params }: { params: Promise<{ statementId: string }> }) {
  const { statementId } = use(params)
  const { status } = useSession()
  const router = useRouter()
  const [data, setData] = useState<StatementDocData | null>(null)
  const [tenancyId, setTenancyId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
  }, [status, router])

  useEffect(() => {
    fetch(`/api/cost-statements/${statementId}`)
      .then((r) => r.json())
      .then((d) => {
        setTenancyId(d.tenancy?.id || null)
        setData({
          period_start: d.period_start,
          period_end: d.period_end,
          prepayment_total: d.prepayment_total,
          positions: Array.isArray(d.positions) ? d.positions : [],
          notes: d.notes,
          tenant: d.tenancy?.tenant || {},
          property: d.tenancy?.property || {},
          landlord: d.landlord || {},
        })
      })
      .finally(() => setLoading(false))
  }, [statementId])

  if (status === 'loading' || loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Wird geladen…</div>
  }
  if (status === 'unauthenticated') return null
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Daten nicht gefunden.</div>
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="no-print bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <Link href={tenancyId ? `/nebenkosten/edit/${statementId}` : '/'} className="text-sm text-gray-500 hover:underline">
            ← Zurück zum Bearbeiten
          </Link>
          <button
            onClick={() => window.print()}
            className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-900"
          >
            🖨 Drucken / Als PDF speichern
          </button>
        </div>
      </div>

      <div className="py-6">
        <div className="bg-white shadow-sm mx-auto" style={{ maxWidth: 820 }}>
          <NebenkostenAbrechnungFilled s={data} />
        </div>
      </div>
    </div>
  )
}
