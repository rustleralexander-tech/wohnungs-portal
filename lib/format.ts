export function euro(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(Number(value))) return '–'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(Number(value))
}

export function germanDate(value: string | null | undefined): string {
  if (!value) return '–'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function germanDateLong(value: string | null | undefined): string {
  if (!value) return '–'
  const d = new Date(value)
  if (isNaN(d.getTime())) return '–'
  return d.toLocaleDateString('de-DE', { day: '2-digit', month: 'long', year: 'numeric' })
}
