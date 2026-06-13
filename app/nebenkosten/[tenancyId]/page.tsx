'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AppShell } from '../../components/AppShell'
import { euro, germanDate } from '@/lib/format'

interface Position { label: string; total_cost: number; share_pct: number }
interface Statement {
  id: string
  period_start: string | null
  period_end: string | null
  prepayment_total: number | null
  positions: Position[]
}
interface Tenancy {
  id: string
  tenant: { full_name: string }
  property: { id: string; name: string }
}

function result(s: Statement): number {
  const positions = Array.isArray(s.positions) ? s.positions : []
  const tenantTotal = positions.reduce((sum, p) => sum + (Number(p.total_cost) || 0) * (Number(p.share_pct) || 0) / 100, 0)
  return (Number(s.prepayment_total) || 0) - tenantTotal
}

export default function NebenkostenListPage({ params }: { params: Promise<{ tenancyId: string }> }) {
  const { tenancyId } = use(params)
  const router = useRouter()
  const [tenancy, setTenancy] = useState<Tenancy | null>(null)
  const [statements, setStatements] = useState<Statement[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)

  const load = () => {
    Promise.all([
      fetch(`/api/tenancies/${tenancyId}`).then((r) => r.json()),
      fetch(`/api/cost-statements?tenancy_id=${tenancyId}`).then((r) => r.json()),
    ]).then(([t, s]) => {
      setTenancy(t)
      if (Array.isArray(s)) setStatements(s)
      setLoading(false)
    })
  }
  useEffect(load, [tenancyId])

  const createNew = async () => {
    setCreating(true)
    const res = await fetch('/api/cost-statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenancy_id: tenancyId }),
    })
    setCreating(false)
    if (res.ok) {
      const data = await res.json()
      router.push(`/nebenkosten/edit/${data.id}`)
    }
  }

  if (loading) return <AppShell><p className="text-gray-500">Wird geladen…</p></AppShell>

  return (
    <AppShell>
      <div className="mb-4">
        <Link href={tenancy?.property?.id ? `/objekte/${tenancy.property.id}` : '/'} className="text-sm text-gray-500 hover:underline">
          ← Zurück zum Objekt
        </Link>
      </div>

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold">Nebenkostenabrechnungen</h1>
          <p className="text-gray-500">
            {tenancy?.tenant?.full_name} · {tenancy?.property?.name}
          </p>
        </div>
        <button onClick={createNew} disabled={creating} className="bg-slate-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50">
          {creating ? 'Wird angelegt…' : '+ Neue Abrechnung'}
        </button>
      </div>

      {statements.length === 0 ? (
        <div className="bg-white border rounded-xl p-10 text-center">
          <p className="text-3xl mb-2">🧮</p>
          <p className="text-gray-500 mb-4">Noch keine Abrechnung. Lege eine an und trage die Kosten ein.</p>
          <button onClick={createNew} disabled={creating} className="text-slate-800 font-medium hover:underline">
            + Erste Abrechnung anlegen
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {statements.map((s) => {
            const r = result(s)
            return (
              <Link
                key={s.id}
                href={`/nebenkosten/edit/${s.id}`}
                className="bg-white border rounded-xl p-4 flex justify-between items-center hover:shadow-md transition"
              >
                <div>
                  <p className="font-medium">
                    Zeitraum {germanDate(s.period_start)} – {germanDate(s.period_end)}
                  </p>
                  <p className="text-sm text-gray-500">Vorauszahlungen: {euro(s.prepayment_total)}</p>
                </div>
                <span className={`text-sm font-semibold ${r >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {r >= 0 ? 'Guthaben' : 'Nachzahlung'} {euro(Math.abs(r))}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </AppShell>
  )
}
