'use client'

export const dynamic = 'force-dynamic'

import { useRouter } from 'next/navigation'
import { AppShell } from '../../components/AppShell'
import { ObjectForm } from '../../components/ObjectForm'

export default function NeuesObjektPage() {
  const router = useRouter()

  return (
    <AppShell>
      <h1 className="text-2xl font-bold mb-6">Neues Objekt anlegen</h1>
      <ObjectForm
        submitLabel="Objekt speichern"
        onCancel={() => router.push('/')}
        onSubmit={async (payload) => {
          const res = await fetch('/api/properties', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
          if (!res.ok) throw new Error('failed')
          const data = await res.json()
          router.push(`/objekte/${data.id}`)
        }}
      />
    </AppShell>
  )
}
