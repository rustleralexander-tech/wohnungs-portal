// Inserat-Empfehlung: aus Objektdaten ableiten, wo am besten inseriert wird.
// Reine Heuristik/Struktur — konkrete Marktpreise folgen später.

export interface PropertyLike {
  furnished?: boolean | null
  target_group?: string | null
  size_sqm?: number | null
  rooms?: number | null
  city?: string | null
}

export interface PlatformRecommendation {
  name: string
  url: string
  fit: 'top' | 'gut' | 'optional'
  reason: string
}

export function recommendPlatforms(p: PropertyLike): PlatformRecommendation[] {
  const target = (p.target_group || '').toLowerCase()
  const isStudent = target.includes('student')
  const isWorker = target.includes('monteur') || target.includes('pendler') || target.includes('handwerk')
  const isBusiness = target.includes('geschäft') || target.includes('business') || target.includes('fachkr')

  const recs: PlatformRecommendation[] = [
    {
      name: 'Wunderflats',
      url: 'https://wunderflats.com/de/vermieter',
      fit: p.furnished ? 'top' : 'optional',
      reason: p.furnished
        ? 'Spezialist für möblierte Wohnungen auf Zeit (genau deine Zielgruppe). Inserieren kostenlos, Provision erst bei Vermietung.'
        : 'Nur sinnvoll wenn möbliert — sonst überspringen.',
    },
    {
      name: 'HousingAnywhere',
      url: 'https://housinganywhere.com/de/vermieter',
      fit: isStudent || isBusiness ? 'top' : 'gut',
      reason: isStudent
        ? 'Stark bei internationalen Studenten & jungen Berufstätigen. Englischsprachiges Inserat empfehlenswert.'
        : 'Gute Reichweite bei internationalen Mietern auf Zeit.',
    },
    {
      name: 'WG-Gesucht.de',
      url: 'https://www.wg-gesucht.de/immobilie-inserieren.html',
      fit: isStudent || isWorker ? 'top' : 'gut',
      reason: 'Größte deutsche Reichweite, ideal für Monteure & Studenten. Günstig, aber Inserat nur manuell pflegbar (keine Schnittstelle).',
    },
    {
      name: 'Spotahome',
      url: 'https://hosts.spotahome.com/',
      fit: isStudent || isBusiness ? 'gut' : 'optional',
      reason: 'International, mit Foto-/Video-Verifizierung. Eher für längerfristige Vermietung an internationale Mieter.',
    },
  ]

  const order = { top: 0, gut: 1, optional: 2 }
  return recs.sort((a, b) => order[a.fit] - order[b.fit])
}

export function priceHint(p: PropertyLike): string {
  if (!p.size_sqm) {
    return 'Trage die Wohnfläche ein, um eine grobe Preisspanne zu sehen. Für möblierte Wohnungen auf Zeit liegt der Quadratmeterpreis i.d.R. deutlich über der ortsüblichen Kaltmiete (Möblierungs- und Flexibilitätszuschlag).'
  }
  return `Für möblierte Wohnungen auf Zeit kannst du in der Regel einen Aufschlag von 30–60 % auf die ortsübliche Kaltmiete ansetzen (Möblierung + kurze Laufzeit + Nebenkosten inkl.). Konkrete Kerpen-Marktdaten füllen wir im nächsten Schritt ein — dann rechnen wir die Spanne für deine ${p.size_sqm} m² aus.`
}
