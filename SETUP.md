# Wohnungs Portal - Setup Guide

## 🏗️ Überblick

Dies ist ein Next.js-basiertes Wohnungs-Buchungssystem für längerfristige Mietungen.

**Tech Stack:**
- Frontend: Next.js 16 + React 19 + Tailwind CSS
- Backend: Next.js API Routes
- Database: Supabase (PostgreSQL)
- Auth: NextAuth.js
- Hosting: Vercel

## 📋 Voraussetzungen

- Node.js 18+ und npm/yarn
- Supabase Account (kostenlos verfügbar)
- Vercel Account (optional, für Deployment)

## 🚀 Schnellstart

### 1. Supabase Setup

1. Gehe zu [supabase.com](https://supabase.com) und erstelle einen neuen Projekt
2. Notiere dir die Projekt-URL und anon-key aus den Einstellungen
3. Gehe zum SQL Editor und führe den Inhalt von `supabase/schema.sql` aus
4. Erstelle einen Storage Bucket namens "documents"

### 2. Umgebungsvariablen

```bash
# Kopiere das Example und fülle es aus
cp .env.local.example .env.local
```

Fülle folgende Variablen aus:

```env
# Supabase (aus den Projekt-Einstellungen)
NEXT_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (aus Settings > API)

# NextAuth Secret (generate mit: openssl rand -base64 32)
NEXTAUTH_SECRET=your_secret_here
NEXTAUTH_URL=http://localhost:3000

# Admin Credentials
ADMIN_EMAIL=alexander@example.com
ADMIN_PASSWORD=secure_password_here

# Property Info
NEXT_PUBLIC_PROPERTY_NAME=Apartment Kerpen
NEXT_PUBLIC_PROPERTY_LOCATION=Kerpen, Germany
```

### 3. Dependencies installieren

```bash
npm install
```

### 4. Lokal starten

```bash
npm run dev
```

Die App ist dann verfügbar unter http://localhost:3000

## 📍 URL Struktur

- `/` - Öffentliche Listing-Seite
- `/booking` - Buchungsformular
- `/admin/login` - Admin Login
- `/admin` - Admin Dashboard

## 🔧 Nutzung

### Booking-Prozess (öffentlich)

1. Gast füllt Formular aus (`/booking`)
2. Gast lädt Ausweiskopie hoch
3. Buchungsanfrage wird in Supabase gespeichert (Status: pending)

### Admin-Dashboard

1. Admin meldet sich unter `/admin/login` an
2. Sieht alle Buchungen in einer Tabelle
3. Kann Status manualell ändern: pending → approved → active → completed
4. Wenn Status ändert, sollte eine Email verschickt werden (TODO: implementieren)

## 📧 Email-Notifications (Phase 2)

Derzeit gibt es noch keine automatischen Email-Versände. Das wird später mit Resend.com integriert:

```typescript
// TODO: sendStatusUpdateEmail() implementieren
if (status && status !== 'pending') {
  await resend.emails.send({
    from: 'bookings@wohnungs-portal.de',
    to: booking.email,
    subject: `Buchung Status Update: ${status}`,
    html: `<p>Dein Booking Status ist jetzt: ${status}</p>`
  })
}
```

## 📱 Responsive Design

Die App ist mobile-responsive mit Tailwind CSS. Alle Seiten passen sich an verschiedene Bildschirmgrößen an.

## 🔒 Security Notes

- Admin-Daten sind in .env.local (nicht committed)
- NextAuth nutzt signed cookies für Sessions
- Supabase Row Level Security (RLS) ist aktiviert
- File uploads sind limitiert auf 5MB

## 🚢 Deployment auf Vercel

```bash
# 1. Git Repository
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/wohnungs-portal
git push -u origin main

# 2. Vercel CLI
npm install -g vercel
vercel

# 3. Umgebungsvariablen in Vercel Dashboard setzen
# (alle Variablen aus .env.local)

# 4. Deploy
vercel --prod
```

## 📊 Nächste Schritte (Phase 2+)

- [ ] Email-Notifications via Resend.com
- [ ] Airbnb API-Integration
- [ ] Booking.com API-Integration
- [ ] Kalender-Sync zwischen Plattformen
- [ ] Mietvertrag Auto-Generation (PDF)
- [ ] Zahlungsintegration (Stripe für Spanien)
- [ ] Gast-Self-Service Portal
- [ ] Analytics Dashboard

## 🐛 Troubleshooting

### "Cannot read properties of undefined (reading 'from')"

Stelle sicher, dass `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` gesetzt ist.

### "Session is null" im Admin-Dashboard

Überprüfe, dass `NEXTAUTH_SECRET` und `NEXTAUTH_URL` korrekt sind.

### Storage Upload funktioniert nicht

Stelle sicher, dass der "documents" Bucket in Supabase existiert und öffentlich lesbar ist.

## 📞 Support

Für Fragen oder Issues: siehe Memory oder die Documentation in CLAUDE.md
