import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

type Field = 'description' | 'rules' | 'price'

interface PropertyInput {
  name?: string
  address?: string
  zip?: string
  city?: string
  rooms?: number | string
  size_sqm?: number | string
  floor?: string
  furnished?: boolean
  target_group?: string
}

function objektSteckbrief(p: PropertyInput): string {
  const lines = [
    p.name && `Bezeichnung: ${p.name}`,
    (p.address || p.city) && `Lage: ${[p.address, p.zip, p.city].filter(Boolean).join(', ')}`,
    p.size_sqm && `Wohnfläche: ${p.size_sqm} m²`,
    p.rooms && `Zimmer: ${p.rooms}`,
    p.floor && `Etage: ${p.floor}`,
    `Möbliert: ${p.furnished ? 'ja' : 'nein'}`,
    p.target_group && `Zielgruppe: ${p.target_group}`,
  ].filter(Boolean)
  return lines.join('\n')
}

function buildPrompt(field: Field, p: PropertyInput): string {
  const steckbrief = objektSteckbrief(p)
  switch (field) {
    case 'description':
      return `Du hilfst einem privaten Vermieter, eine ansprechende Inseratsbeschreibung für eine möblierte Wohnung auf Zeit zu schreiben (Zielgruppe Monteure, Pendler, Geschäftsleute, Studenten).

Objektdaten:
${steckbrief}

Schreibe eine einladende, sachliche deutsche Beschreibung (ca. 4–6 Sätze). Hebe Eignung für die Zielgruppe, Lage und Ausstattung hervor. Keine erfundenen Fakten über Ausstattung, die nicht oben steht — bleibe allgemein, wo Details fehlen. Gib NUR den Beschreibungstext aus, ohne Überschrift oder Anführungszeichen.`
    case 'rules':
      return `Du hilfst einem privaten Vermieter, knappe, faire Hausregeln für eine möblierte Wohnung auf Zeit zu formulieren.

Objektdaten:
${steckbrief}

Schreibe 5–7 kurze, klare Hausregeln auf Deutsch als Stichpunkte (jeweils mit "• " beginnend). Übliche Themen: Rauchen, Haustiere, Ruhezeiten, Sauberkeit, Besuch, Mülltrennung, Schäden melden. Gib NUR die Stichpunkte aus.`
    case 'price':
      return `Du bist Mietpreis-Berater für möblierte Wohnungen auf Zeit in Deutschland.

Objektdaten:
${steckbrief}

Schätze eine realistische monatliche Warmmiete (möbliert, auf Zeit) als Spanne in Euro und begründe sie in 2–3 Sätzen. Berücksichtige Möblierungs- und Flexibilitätszuschlag gegenüber der ortsüblichen Kaltmiete. Mache klar, dass dies eine grobe KI-Schätzung ohne aktuelle Marktdaten ist. Antworte auf Deutsch in diesem Format:
Empfehlung: X–Y € / Monat (warm)
Begründung: ...`
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'KI nicht konfiguriert. Bitte ANTHROPIC_API_KEY in den Umgebungsvariablen setzen.' },
        { status: 503 }
      )
    }

    const { field, property } = (await request.json()) as { field: Field; property: PropertyInput }
    if (!field || !['description', 'rules', 'price'].includes(field)) {
      return NextResponse.json({ error: 'Ungültiges Feld' }, { status: 400 })
    }

    const client = new Anthropic()
    const message = await client.messages.create({
      model: 'claude-opus-4-8',
      max_tokens: 1024,
      messages: [{ role: 'user', content: buildPrompt(field, property || {}) }],
    })

    const text = message.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim()

    return NextResponse.json({ text })
  } catch (error) {
    console.error('AI suggest error:', error)
    return NextResponse.json({ error: 'KI-Vorschlag fehlgeschlagen' }, { status: 500 })
  }
}
