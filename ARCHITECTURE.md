# Arkitektura e frontend-it

React + TypeScript, me organizim sipas funksioneve të biznesit.

```text
src/
  app/                         # Rrugët, layout-et, navigimi dhe PWA
  features/
    catalog/
      pages/                   # Katalogu, ofertat, detajet e produktit
      components/              # Karuseli dhe shtimi në shportë
    cart/
      pages/                   # Formulari i porosisë
      components/              # Fushat e klientit të ripërdorshme
      state/                   # Gjendja dhe ruajtja lokale e shportës
    account/
      pages/                   # Hyrja, profili dhe porositë personale
      state/                   # Sesioni i llogarisë
    admin/
      pages/                   # Pasqyra, shitjet, produktet, klientët, administratorët
      components/              # Kërkimi i adminit dhe formulari i shitjes manuale
    reports/
      pages/                   # Raportet e klientëve dhe historiku financiar
      components/              # Kartat e përbashkëta financiare
    notifications/components/  # Zilja dhe kutia private e njoftimeve
  shared/
    api.ts                     # HTTP, cookies, CSRF, anulimi dhe rifreskimi i rolit
    types.ts                   # Kontratat e API-së dhe formatimi i përbashkët
    ui.tsx                     # Dialog, gabime, faqëzim, mesazhe dhe sasi
    forms/                     # Fjalëkalimi, fotografia dhe galeria
    reports/                   # Eksporti PDF/Excel dhe butonat e shkarkimit
  styles/                      # Bazat, dyqani, përshtatjet dhe raportet
  assets/                      # Fotografitë dhe fonti i raporteve
```

## Rregullat e zgjerimit

- Rrugët regjistrohen në app/App.tsx me React.lazy për faqet dytësore; Suspense në layout mban navigimin të dukshëm gjatë ngarkimit. një faqe përbëhet nga komponentë sipas përgjegjësisë.
- Kodi që i përket një funksioni qëndron brenda features; komponentët e përdorur në disa funksione qëndrojnë në shared.
- Kërkesat kalojnë nga shared/api.ts; një komponent nuk krijon mekanizma të tjerë hyrjeje ose CSRF-je.
- Çmimet, shitjet, pagesat, borxhet dhe autorizimi përfundimtar llogariten/kontrollohen nga backend-i.
- Gjendja e shportës dhe sesionit ndahet përmes provider-ëve të tyre. Të dhënat private nuk ruhen në service-worker cache.
- PDF/Excel ngarkohen në chunks të veçantë kur kërkohet eksporti. Shkarkimet lexojnë faqet e API-së, jo vetëm faqen e dukshme të tabelës; kufiri është 5,000 rreshta për listë.
- Njoftimet rifreskohen çdo 15 sekonda kur platforma është e hapur; nuk janë push jashtë aplikacionit.
- `styles/index.css` përcakton rendin e stileve: `base` → `responsive` → `experience` → `finance`. Modulet ndajnë bazat, komponentët dhe pamjet; rendi ruan kaskadën ekzistuese. Ndryshoni modulin përkatës në vend të shtimit të override-ve në fund. Media queries mbahen në modulet `breakpoints`.
- Build-i gjeneron manifestin e Vite; `finalize-pwa.mjs` ndjek vetëm varësitë statike të hyrjes. Faqet dinamike dhe eksportet nuk shkarkohen gjatë instalimit, por cache-ohen kur kërkohen.
- Përdorni TypeScript strict, npm run format:check dhe npm run build para ruajtjes së ndryshimeve.

Për një funksion të ri shtoni dosjen përkatëse te features dhe krijoni nënndarje vetëm kur ekziston përgjegjësi reale; mos shtoni dosje bosh ose abstraksione pa përdorim.
