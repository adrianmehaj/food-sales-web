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

## Zgjerimi dhe funksionet e reja

Struktura e plotë dhe rregullat e zgjerimit janë te [ARCHITECTURE.md](ARCHITECTURE.md). Faqet janë ndarë nga komponentët dhe gjendja sipas funksionit. Raportet dhe njoftimet kanë modulet e tyre. Përdorni npm run format:check për stilin e kodit dhe npm run build për TypeScript/PWA.

Ofertat fillojnë me karusel reklamash (fotografi të shumëfishta, ndërrim çdo 5 sekonda, shigjeta dhe ndalim). Hero shfaqet vetëm te produktet. Produktet kanë faqe detajesh dhe shtim në shportë me reagim të përkohshëm. Klienti pas hyrjes ridrejtohet te produktet; llogaria ka skeda të veçanta për porositë dhe profilin.

Admini ka Raportet & borxhet, raport për secilin klient, historik porosish/pagesash dhe PDF/Excel. Eksportet lexojnë të gjitha faqet deri në 5,000 rreshta për listë dhe nuk shkurtojnë në heshtje rezultatet më të mëdha. PDF përdor Lato për shkronjat shqipe; licenca është public/licenses/OFL-Lato.txt. Bibliotekat e eksportit ngarkohen veçmas kur kërkohen.

Zilja e njoftimeve rifreskohet çdo 15 sekonda gjatë përdorimit të platformës, për porositë e reja dhe konfirmimet me datë. Njoftimet janë private për klientin; adminët marrin njoftimet e porosive të reja. SMS/email/push jashtë platformës mbeten jashtë këtij implementimi.

Përditësimet PWA kontrollohen gjatë rikthimit në aplikacion dhe çdo minutë kur është aktiv, me updateViaCache none. Versioni i ri aktivizohet nga përdoruesi me Përditëso për të ruajtur formularët në proces. Linku Quick Tunnel nuk ndryshon për çdo build; ndryshon kur krijohet një tunel i ri. Në iPhone hapni linkun aktual në Safari, rifreskojeni dhe pastaj rihapni PWA-në. Karuseli ka vetëm shigjeta të tejdukshme, rotacion 5 sekonda dhe crossfade 1.2 sekonda me fotografinë e mëparshme poshtë; preferenca reduced-motion respektohet.
