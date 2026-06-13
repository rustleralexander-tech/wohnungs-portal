'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏠 Wohnungs Portal</h1>
          <Link href="/admin" className="text-sm text-blue-600 hover:underline">
            Admin
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Property Info */}
          <div>
            <h2 className="text-4xl font-bold mb-4">
              Apartment Kerpen
            </h2>
            <p className="text-gray-600 text-lg mb-6">
              Komfortables Apartment in Kerpen für Monteure, Studenten und Fachkräfte.
              Perfekt für längerfristige Vermietung mit allen wichtigen Annehmlichkeiten.
            </p>

            {/* Key Info */}
            <div className="bg-gray-50 p-6 rounded-lg mb-6">
              <h3 className="font-semibold text-lg mb-4">Ausstattung</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Gemütliches Schlafzimmer</li>
                <li>✓ Voll ausgestattete Küche</li>
                <li>✓ Modernes Badezimmer</li>
                <li>✓ Wohnzimmer mit Smart-TV</li>
                <li>✓ Kostenloses WLAN</li>
                <li>✓ Parkplatz vorhanden</li>
              </ul>
            </div>

            {/* Booking Button */}
            <Link
              href="/booking"
              className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Jetzt Buchen
            </Link>
          </div>

          {/* Image Placeholder */}
          <div className="bg-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-500 text-lg">📸 Apartment-Fotos</p>
              <p className="text-gray-400 text-sm">(Werden bald hinzugefügt)</p>
            </div>
          </div>
        </div>
      </section>

      {/* Details Section */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Häufig Gefragt</h2>

          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Wie lange kann ich mieten?</h3>
              <p className="text-gray-700">
                Wir bieten Vermietungen ab 1 Monat bis zu 12 Monaten.
                Dies ist kein klassisches Hotel - wir suchen langfristige Mietverträge mit Mietpflicht.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Welche Unterlagen brauche ich?</h3>
              <p className="text-gray-700">
                Für die Buchung benötigen wir: ein gültiges Ausweisdokument (Pass oder Personalausweis)
                und deine Kontaktdaten. Du wirst dann einen standardisierten Mietvertrag erhalten.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Wie wird bezahlt?</h3>
              <p className="text-gray-700">
                Die Miete wird monatlich per Banküberweisung bezahlt.
                Nach Bestätigung deiner Buchung erhältst du alle Bankdaten.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Kann ich die Miete kündigen?</h3>
              <p className="text-gray-700">
                Ja, mit einer Kündigungsfrist von 30 Tagen zum Ende eines Kalendermonats,
                wie in deinem Mietvertrag festgehalten.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            Wohnungs Portal © 2026 - Verwaltung von Langzeitmietungen
          </p>
        </div>
      </footer>
    </div>
  )
}
