'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { AppShell } from '../../../components/AppShell'
import { euro } from '@/lib/format'

interface Position { label: string; total_cost: number | string; share_pct: number | string }

export default function NebenkostenEditPage({ params }: { params: Promise<{ statementId: string }> }) {
  const { statementId } = use(params)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [tenancyId, setTenancyId] = useState<string | null>(null)
  const [meta, setMeta] = useState<{ tenant?: string; property?: string }>({})

  const [periodStart, setPeriodStart] = useState('')
  const [periodEnd, setPeriodEnd] = useState('')
  const [positions, setPositions] = useState<Position[]>([])
  const [prepaymentTotal, setPrepaymentTotal] = useState('')
  const [notes, setNotes] = useState('')
  const [monthly, setMonthly] = useState('')
  const [months, setMonths] = useState('12')

  useEffect(() => {
    fetch(`/api/cost-statements/${statementId}`)
      .then((r) => r.json())
      .then((d) => {
        setPeriodStart(d.period_start || '')
        setPeriodEnd(d.period_end || '')
        setPositions(Array.isArray(d.positions) ? d.positions : [])
        setPrepaymentTotal(d.prepayment_total != null ? String(d.prepayment_total) : '')
        setNotes(d.notes || '')
        setTenancyId(d.tenancy?.id || null)
        setMonthly(d.tenancy?.utilities != null ? String(d.tenancy.utilities) : '')
        setMeta({ tenant: d.tenancy?.tenant?.full_name, property: d.tenancy?.property?.name })
        setLoading(false)
      })
  }, [statementId])

  const setPos = (i: number, key: keyof Position, value: string) => {
    setPositions((prev) => prev.map((p, idx) => (idx === i ? { ...p, [key]: value } : p)))
    setSaved(false)
  }
  const addPos = () => setPositions((prev) => [...prev, { label: '', total_cost: 0, share_pct: 100 }])
  const removePos = (i: number) => setPositions((prev) => prev.filter((_, idx) => idx !== i))

  const shareOf = (p: Position) => (Number(p.total_cost) || 0) * (Number(p.share_pct) || 0) / 100
  const tenantTotal = positions.reduce((sum, p) => sum + shareOf(p), 0)
  const prepaid = Number(prepaymentTotal) || 0
  const balance = prepaid - tenantTotal

  const computePrepayment = () => {
    const total = (Number(monthly) || 0) * (Number(months) || 0)
    setPrepaymentTotal(String(total))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    const res = await fetch(`/api/cost-statements/${statementId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        period_start: periodStart || null,
        period_end: periodEnd || null,
        prepayment_total: prepaid,
        positions: positions.map((p) => ({
          label: p.label,
          total_cost: Number(p.total_cost) || 0,
          share_pct: Number(p.share_pct) || 0,
        })),
        notes: notes || null,
      }),
    })
    setSaving(false)
    if (res.ok) setSaved(true)
  }

  if (loading) return <AppShell><p className="text-gray-500">Wird geladen…</p></AppShell>

  const input = 'px-2 py-1.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 text-sm'

  return (
    <AppShell>
      <div className="mb-4">
        <Link href={tenancyId ? `/nebenkosten/${tenancyId}` : '/'} className="text-sm text-gray-500 hover:underline">
          ← Zurück zur Übersicht
        </Link>
      </div>

      <h1 className="text-2xl font-bold mb-1">Nebenkostenabrechnung</h1>
      <p className="text-gray-500 mb-6">{meta.tenant} · {meta.property}</p>

      {/* Zeitraum */}
      <section className="bg-white border rounded-xl p-6 mb-4">
        <h2 className="font-semibold mb-3">Abrechnungszeitraum</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Von</label>
            <input type="date" className={`${input} w-full`} value={periodStart} onChange={(e) => { setPeriodStart(e.target.value); setSaved(false) }} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bis</label>
            <input type="date" className={`${input} w-full`} value={periodEnd} onChange={(e) => { setPeriodEnd(e.target.value); setSaved(false) }} />
          </div>
        </div>
      </section>

      {/* Kostenpositionen */}
      <section className="bg-white border rounded-xl p-6 mb-4">
        <h2 className="font-semibold mb-3">Kostenpositionen</h2>
        <div className="space-y-2">
          <div className="grid grid-cols-12 gap-2 text-xs text-gray-400 font-medium px-1">
            <span className="col-span-6">Kostenart</span>
            <span className="col-span-2 text-right">Gesamt €</span>
            <span className="col-span-2 text-right">Anteil %</span>
            <span className="col-span-2 text-right">Mieter €</span>
          </div>
          {positions.map((p, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input className={`${input} col-span-6`} value={p.label} onChange={(e) => setPos(i, 'label', e.target.value)} placeholder="Kostenart" />
              <input className={`${input} col-span-2 text-right`} type="number" step="0.01" value={p.total_cost} onChange={(e) => setPos(i, 'total_cost', e.target.value)} />
              <input className={`${input} col-span-2 text-right`} type="number" step="1" value={p.share_pct} onChange={(e) => setPos(i, 'share_pct', e.target.value)} />
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="text-sm text-gray-700">{euro(shareOf(p))}</span>
                <button onClick={() => removePos(i)} className="text-gray-300 hover:text-red-600 text-lg leading-none">×</button>
              </div>
            </div>
          ))}
        </div>
        <button onClick={addPos} className="mt-3 text-sm text-slate-700 hover:underline">+ Position hinzufügen</button>

        <div className="flex justify-between border-t mt-4 pt-3 font-semibold">
          <span>Summe Mieteranteil</span>
          <span>{euro(tenantTotal)}</span>
        </div>
      </section>

      {/* Vorauszahlungen */}
      <section className="bg-white border rounded-xl p-6 mb-4">
        <h2 className="font-semibold mb-3">Geleistete Vorauszahlungen</h2>
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">monatlich €</label>
            <input className={`${input} w-28`} type="number" step="0.01" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
          </div>
          <span className="pb-2 text-gray-400">×</span>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Monate</label>
            <input className={`${input} w-20`} type="number" value={months} onChange={(e) => setMonths(e.target.value)} />
          </div>
          <button onClick={computePrepayment} className="text-sm text-slate-700 hover:underline pb-2">= berechnen</button>
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Summe Vorauszahlungen €</label>
          <input className={`${input} w-40`} type="number" step="0.01" value={prepaymentTotal} onChange={(e) => { setPrepaymentTotal(e.target.value); setSaved(false) }} />
        </div>
      </section>

      {/* Ergebnis */}
      <section className={`rounded-xl p-6 mb-4 border ${balance >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex justify-between items-center">
          <span className="font-semibold">{balance >= 0 ? 'Guthaben für den Mieter' : 'Nachzahlung durch den Mieter'}</span>
          <span className="text-2xl font-bold">{euro(Math.abs(balance))}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">Vorauszahlungen {euro(prepaid)} − Kosten {euro(tenantTotal)}</p>
      </section>

      <section className="bg-white border rounded-xl p-6 mb-6">
        <label className="block text-sm font-medium mb-1">Anmerkung (optional, erscheint auf der Abrechnung)</label>
        <textarea className={`${input} w-full h-20`} value={notes} onChange={(e) => { setNotes(e.target.value); setSaved(false) }} />
      </section>

      <div className="flex items-center gap-3">
        <button onClick={save} disabled={saving} className="bg-slate-800 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-900 disabled:opacity-50">
          {saving ? 'Wird gespeichert…' : 'Speichern'}
        </button>
        <Link
          href={`/nebenkosten/pdf/${statementId}`}
          onClick={(e) => { if (!saved) { e.preventDefault(); alert('Bitte zuerst speichern.') } }}
          className={`px-5 py-2 rounded-lg border font-medium ${saved ? 'hover:bg-gray-50' : 'opacity-50 cursor-not-allowed'}`}
        >
          📄 Als PDF
        </Link>
        {saved && <span className="text-green-600 text-sm">✓ Gespeichert</span>}
      </div>
    </AppShell>
  )
}
