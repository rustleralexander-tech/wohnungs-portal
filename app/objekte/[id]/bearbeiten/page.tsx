'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { AppShell } from '../../../components/AppShell'
import { ObjectForm, ObjectFormValues } from '../../../components/ObjectForm'

export default function ObjektBearbeitenPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [initial, setInitial] = useState<ObjectFormValues | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/properties/${id}`)
      .then((r) => r.json())
      .then((d) => setInitial(d))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Objekt bearbeiten</h1>
      {loading || !initial ? (
        <p className="text-gray-500">Wird geladen…</p>
      ) : (
        <ObjectForm
          initial={initial}
          submitLabel="Änderungen speichern"
          onCancel={() => router.push(`/objekte/${id}`)}
          onSubmit={async (payload) => {
            const res = await fetch(`/api/properties/${id}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            })
            if (!res.ok) throw new Error('failed')
            router.push(`/objekte/${id}`)
          }}
        />
      )}
    </AppShell>
  )
}
