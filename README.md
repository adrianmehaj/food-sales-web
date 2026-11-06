# Tryeza - Produkte Bio

React 19, TypeScript strict dhe Vite 7. Ndërfaqe në shqip për telefon dhe kompjuter, me PWA dhe fonte lokale. Organizimi: src/features për funksionet, src/app për navigimin/layout-et dhe src/shared për API-në, modelet dhe komponentët e përbashkët.

## Nisja lokale

Kërkohet Node.js 22.12+ dhe backend-i food-sales-api në portin 5080.

```powershell
npm ci
npm run dev
```

Frontend-i hapet në http://127.0.0.1:5173. Vite përcjell /api, /media dhe /health te http://localhost:5080.

## Ndërtimi dhe paketimi

```powershell
npm run build
node scripts/copy-to-api.mjs 'C:\Users\Administrator\source\repos\adrianmehaj\food-sales-api'
```

React/PWA kopjohet në wwwroot të API-së. ASP.NET Core shërben frontend-in dhe backend-in në të njëjtën adresë; SQL Server është databazë më vete. Skripti scripts/Publish-App.ps1 në backend automatizon paketimin e të dy projekteve. dist, node_modules dhe konfigurimet lokale përjashtohen nga Git.

## Funksionet

- Katalog, kërkim, kategori, oferta, shportë dhe porosi pa llogari.
- Datë e dëshiruar dërgese, dërgesë në adresë ose marrje vetë.
- Profil personal për klient dhe admin; histori private e porosive/pagesave/borxheve.
- Panel admin: raporte, shitje manuale, peshë përfundimtare, stok, pagesa/borxhe, klientë dhe çmime biznesi.
- Produkte dhe banera me ngarkim fotografie JPG/PNG/WebP deri në 5 MB.
- Shtim administratorësh vetëm nga llogari admini pas krijimit të adminit të parë.
- Navigim mobil, menu admini, hapësira për safe area dhe njoftimi i instalimit.

## PWA

Emri i instalimit: **Tryeza - Produkte Bio**. Service worker aktivizohet në build production dhe ruan vetëm shell/asetet. API-ja, porositë dhe pagesat nuk ruhen offline. Për testim të plotë në telefon përdorni HTTPS. Në Safari: Share → Add to Home Screen. Një tunel i përkohshëm funksionon vetëm sa kohë API-ja dhe procesi i tunelit janë të hapur.

## Verifikimi dhe kufijtë

TypeScript/Vite/PWA build kaloi. Kontrollet e API-së me LocalDB përfshijnë porosi/pagesa, stok, izolim klientësh, administratorë, profile, fotografi dhe datën e dërgesës; raporti gjendet te docs/VERIFICATION.sq.md në backend. Pamja responsive dhe instalimi mbeten për verifikim në pajisje reale.

Rikthimi i fjalëkalimit, verifikimi i emailit, MFA dhe njoftimet email/SMS/push ende nuk janë implementuar. Për hostim, backup, ruajtjen e fotografive dhe konfigurimin e biznesit ndiqni README-n e backend-it.
