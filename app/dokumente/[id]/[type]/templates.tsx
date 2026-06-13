import { euro, germanDate, germanDateLong } from '@/lib/format'

export interface DocData {
  id: string
  start_date: string | null
  end_date: string | null
  move_in_date: string | null
  rent_cold: number | null
  utilities: number | null
  deposit: number | null
  tenant: {
    full_name?: string | null
    email?: string | null
    phone?: string | null
    birth_date?: string | null
    birth_place?: string | null
    nationality?: string | null
    prev_address?: string | null
  }
  property: {
    name?: string | null
    address?: string | null
    zip?: string | null
    city?: string | null
    rooms?: number | null
    size_sqm?: number | null
    floor?: string | null
    furnished?: boolean | null
  }
  landlord: {
    full_name?: string | null
    address_street?: string | null
    address_zip?: string | null
    address_city?: string | null
    email?: string | null
    phone?: string | null
    iban?: string | null
    bic?: string | null
    bank_name?: string | null
    tax_id?: string | null
  }
}

const V = ({ x }: { x: string | number | null | undefined }) =>
  x === null || x === undefined || x === '' ? (
    <span style={{ color: '#bbb' }}>__________</span>
  ) : (
    <>{x}</>
  )

function landlordLine(l: DocData['landlord']) {
  return [l.full_name, l.address_street, [l.address_zip, l.address_city].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
}
function propertyLine(p: DocData['property']) {
  return [p.address, [p.zip, p.city].filter(Boolean).join(' '), p.floor ? `${p.floor}` : null]
    .filter(Boolean)
    .join(', ')
}

const Disclaimer = () => (
  <p className="no-print" style={{ marginTop: 32, fontSize: 11, color: '#999', borderTop: '1px solid #eee', paddingTop: 12 }}>
    Hinweis: Diese Vorlage dient als Arbeitshilfe und ersetzt keine Rechtsberatung. Prüfe Inhalte vor Verwendung
    und ziehe im Zweifel Anwalt/Steuerberater hinzu.
  </p>
)

const SignRow = () => (
  <table style={{ marginTop: 48 }}>
    <tbody>
      <tr>
        <td style={{ borderTop: '1px solid #111', paddingTop: 4, width: '45%' }}>Ort, Datum, Vermieter</td>
        <td style={{ width: '10%' }}></td>
        <td style={{ borderTop: '1px solid #111', paddingTop: 4, width: '45%' }}>Ort, Datum, Mieter</td>
      </tr>
    </tbody>
  </table>
)

export function Mietvertrag({ d }: { d: DocData }) {
  return (
    <div className="doc-sheet">
      <h1>Mietvertrag über {d.property.furnished ? 'möblierten ' : ''}Wohnraum</h1>
      <p style={{ color: '#666', fontSize: 13 }}>Zeitmietvertrag</p>

      <p>zwischen</p>
      <p><strong><V x={landlordLine(d.landlord)} /></strong><br />– nachfolgend „Vermieter" –</p>
      <p>und</p>
      <p>
        <strong><V x={d.tenant.full_name} /></strong>
        {d.tenant.birth_date && <>, geb. am {germanDate(d.tenant.birth_date)}</>}
        <br />bisher wohnhaft: <V x={d.tenant.prev_address} /><br />– nachfolgend „Mieter" –
      </p>

      <h2>§ 1 Mietgegenstand</h2>
      <p>
        Vermietet wird die Wohnung in <strong><V x={propertyLine(d.property)} /></strong>
        {d.property.rooms && <>, bestehend aus {d.property.rooms} Zimmer(n)</>}
        {d.property.size_sqm && <>, Wohnfläche ca. {d.property.size_sqm} m²</>}.
        {d.property.furnished && ' Die Wohnung wird möbliert vermietet (Inventarliste als Anlage).'}
      </p>

      <h2>§ 2 Mietzeit</h2>
      <p>
        Das Mietverhältnis beginnt am <strong>{germanDate(d.start_date)}</strong> und{' '}
        {d.end_date ? (
          <>ist befristet bis zum <strong>{germanDate(d.end_date)}</strong>.</>
        ) : (
          <>läuft auf unbestimmte Zeit.</>
        )}
      </p>

      <h2>§ 3 Miete und Nebenkosten</h2>
      <table>
        <tbody>
          <tr><td>Grundmiete (kalt)</td><td style={{ textAlign: 'right' }}>{euro(d.rent_cold)}</td></tr>
          <tr><td>Betriebs-/Nebenkostenvorauszahlung</td><td style={{ textAlign: 'right' }}>{euro(d.utilities)}</td></tr>
          <tr style={{ fontWeight: 700, borderTop: '1px solid #111' }}>
            <td>Gesamtmiete monatlich</td>
            <td style={{ textAlign: 'right' }}>{euro((d.rent_cold || 0) + (d.utilities || 0))}</td>
          </tr>
        </tbody>
      </table>
      <p>
        Die Miete ist monatlich im Voraus, spätestens am dritten Werktag des Monats, auf folgendes Konto zu zahlen:
        <br /><V x={d.landlord.bank_name} />, IBAN <V x={d.landlord.iban} />{d.landlord.bic ? <>, BIC {d.landlord.bic}</> : null}.
      </p>

      <h2>§ 4 Kaution</h2>
      <p>Der Mieter leistet eine Kaution in Höhe von <strong>{euro(d.deposit)}</strong>, zahlbar zu Mietbeginn.</p>

      <h2>§ 5 Möblierung / Zustand</h2>
      <p>
        {d.property.furnished
          ? 'Die Wohnung wird in dem in der Inventar-/Übergabeliste beschriebenen Zustand möbliert übergeben. Der Mieter verpflichtet sich, das Inventar pfleglich zu behandeln.'
          : 'Die Wohnung wird im bei Übergabe protokollierten Zustand übergeben.'}
      </p>

      <h2>§ 6 Pflichten des Mieters</h2>
      <p>
        Der Mieter hat die Wohnung pfleglich zu behandeln, ordnungsgemäß zu lüften und zu heizen sowie die Hausordnung
        einzuhalten. Untervermietung bedarf der vorherigen Zustimmung des Vermieters.
      </p>

      <h2>§ 7 Kündigung</h2>
      <p>
        Es gelten die gesetzlichen Kündigungsfristen gemäß §§ 573c ff. BGB. Bei befristeten Verträgen endet das
        Mietverhältnis mit Ablauf der vereinbarten Mietzeit, ohne dass es einer Kündigung bedarf.
      </p>

      <h2>§ 8 Schlussbestimmungen</h2>
      <p>
        Änderungen und Ergänzungen bedingen der Textform. Sollte eine Bestimmung unwirksam sein, bleibt der übrige
        Vertrag wirksam.
      </p>

      <SignRow />
      <Disclaimer />
    </div>
  )
}

export function Wohnungsgeberbestaetigung({ d }: { d: DocData }) {
  return (
    <div className="doc-sheet">
      <h1>Wohnungsgeberbestätigung</h1>
      <p style={{ color: '#666', fontSize: 13 }}>gemäß § 19 Abs. 3 Bundesmeldegesetz (BMG)</p>

      <h2>Wohnungsgeber / Vermieter</h2>
      <p><V x={landlordLine(d.landlord)} /></p>

      <h2>Anschrift der Wohnung</h2>
      <p><V x={propertyLine(d.property)} /></p>

      <h2>Art des meldepflichtigen Vorgangs</h2>
      <p>☒ Einzug &nbsp;&nbsp; ☐ Auszug</p>

      <h2>Datum des Ein-/Auszugs</h2>
      <p><strong>{germanDate(d.move_in_date || d.start_date)}</strong></p>

      <h2>Meldepflichtige Person(en)</h2>
      <p>
        <V x={d.tenant.full_name} />
        {d.tenant.birth_date && <>, geb. am {germanDate(d.tenant.birth_date)}</>}
      </p>

      <p style={{ marginTop: 24 }}>
        Hiermit wird bestätigt, dass die oben genannte Person in die bezeichnete Wohnung eingezogen ist. Diese
        Bestätigung ist der Meldebehörde innerhalb von zwei Wochen vorzulegen.
      </p>

      <table style={{ marginTop: 48 }}>
        <tbody>
          <tr>
            <td style={{ borderTop: '1px solid #111', paddingTop: 4, width: '60%' }}>
              Ort, Datum, Unterschrift Wohnungsgeber
            </td>
          </tr>
        </tbody>
      </table>
      <Disclaimer />
    </div>
  )
}

export function Kuendigung({ d }: { d: DocData }) {
  return (
    <div className="doc-sheet">
      <p style={{ fontSize: 12, color: '#666' }}>{landlordLine(d.landlord)}</p>
      <p style={{ marginTop: 24 }}>
        An<br />
        <strong><V x={d.tenant.full_name} /></strong><br />
        <V x={propertyLine(d.property)} />
      </p>
      <p style={{ textAlign: 'right', marginTop: 16 }}>
        <V x={d.landlord.address_city} />, den {germanDate(new Date().toISOString())}
      </p>

      <h1 style={{ marginTop: 24 }}>Kündigung des Mietverhältnisses</h1>
      <p>Wohnung: <V x={propertyLine(d.property)} /></p>

      <p style={{ marginTop: 16 }}>Sehr geehrte/r <V x={d.tenant.full_name} />,</p>
      <p>
        hiermit kündige ich das zwischen uns bestehende Mietverhältnis über die oben genannte Wohnung, begonnen am{' '}
        {germanDate(d.start_date)}, ordentlich und fristgerecht zum nächstmöglichen Termin unter Einhaltung der
        gesetzlichen Kündigungsfrist.
      </p>
      <p>
        Bitte bestätigen Sie den Erhalt dieser Kündigung sowie den Beendigungstermin schriftlich. Einen Termin zur
        Wohnungsübergabe stimmen wir rechtzeitig ab.
      </p>
      <p style={{ marginTop: 24 }}>Mit freundlichen Grüßen</p>
      <p style={{ marginTop: 40 }}>_______________________________<br /><V x={d.landlord.full_name} /></p>
      <Disclaimer />
    </div>
  )
}

export interface Position {
  label: string
  total_cost: number
  share_pct: number
}

export interface StatementDocData {
  period_start: string | null
  period_end: string | null
  prepayment_total: number | null
  positions: Position[]
  notes: string | null
  tenant: DocData['tenant']
  property: DocData['property']
  landlord: DocData['landlord']
}

export function NebenkostenAbrechnungFilled({ s }: { s: StatementDocData }) {
  const positions = Array.isArray(s.positions) ? s.positions : []
  const shareOf = (p: Position) => (Number(p.total_cost) || 0) * (Number(p.share_pct) || 0) / 100
  const tenantTotal = positions.reduce((sum, p) => sum + shareOf(p), 0)
  const prepaid = Number(s.prepayment_total) || 0
  const balance = prepaid - tenantTotal // positiv = Guthaben, negativ = Nachzahlung

  return (
    <div className="doc-sheet">
      <h1>Betriebs-/Nebenkostenabrechnung</h1>
      <p style={{ color: '#666', fontSize: 13 }}>
        Abrechnungszeitraum: {germanDate(s.period_start)} bis {germanDate(s.period_end)}
      </p>

      <h2>Vermieter</h2>
      <p><V x={landlordLine(s.landlord)} /></p>
      <h2>Mieter</h2>
      <p><V x={s.tenant.full_name} />, <V x={propertyLine(s.property)} /></p>

      <h2>Aufstellung der Betriebskosten</h2>
      <table style={{ marginTop: 4 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #111', fontWeight: 700 }}>
            <td>Kostenart</td>
            <td style={{ textAlign: 'right' }}>Gesamtkosten</td>
            <td style={{ textAlign: 'right' }}>Anteil %</td>
            <td style={{ textAlign: 'right' }}>Anteil Mieter</td>
          </tr>
        </thead>
        <tbody>
          {positions.filter((p) => (Number(p.total_cost) || 0) !== 0).map((p, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '6px 0' }}>{p.label}</td>
              <td style={{ textAlign: 'right' }}>{euro(p.total_cost)}</td>
              <td style={{ textAlign: 'right' }}>{Number(p.share_pct) || 0}%</td>
              <td style={{ textAlign: 'right' }}>{euro(shareOf(p))}</td>
            </tr>
          ))}
          <tr style={{ fontWeight: 700, borderTop: '1px solid #111' }}>
            <td style={{ padding: '6px 0' }}>Summe Ihre Kosten</td>
            <td></td>
            <td></td>
            <td style={{ textAlign: 'right' }}>{euro(tenantTotal)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Abrechnung der Vorauszahlungen</h2>
      <table>
        <tbody>
          <tr><td>Geleistete Vorauszahlungen</td><td style={{ textAlign: 'right' }}>{euro(prepaid)}</td></tr>
          <tr><td>./. Ihre Kosten lt. Abrechnung</td><td style={{ textAlign: 'right' }}>{euro(tenantTotal)}</td></tr>
          <tr style={{ fontWeight: 700, borderTop: '1px solid #111' }}>
            <td>{balance >= 0 ? 'Guthaben zu Ihren Gunsten' : 'Nachzahlung'}</td>
            <td style={{ textAlign: 'right' }}>{euro(Math.abs(balance))}</td>
          </tr>
        </tbody>
      </table>

      <p style={{ marginTop: 16, fontSize: 13, color: '#666' }}>
        {balance >= 0
          ? 'Das Guthaben wird Ihnen auf das bekannte Konto erstattet.'
          : 'Der Nachzahlungsbetrag ist innerhalb von 30 Tagen auf das bekannte Konto des Vermieters zu überweisen.'}
      </p>

      {s.notes && <p style={{ fontSize: 13 }}>{s.notes}</p>}

      <table style={{ marginTop: 40 }}>
        <tbody>
          <tr>
            <td style={{ borderTop: '1px solid #111', paddingTop: 4, width: '60%' }}>Ort, Datum, Unterschrift Vermieter</td>
          </tr>
        </tbody>
      </table>
      <Disclaimer />
    </div>
  )
}
