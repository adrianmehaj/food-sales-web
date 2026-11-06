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
      state/                   # Gjendja dhe ruajtja lokale e shportës
    account/
      pages/                   # Hyrja, profili dhe porositë personale
      state/                   # Sesioni i llogarisë
    admin/
      pages/                   # Pasqyra, shitjet, produktet, klientët, administratorët
      components/              # Formulari i shitjes manuale
    reports/pages/             # Raportet e klientëve dhe historiku financiar
    notifications/components/  # Zilja dhe kutia private e njoftimeve
  shared/
    api.ts                     # HTTP, cookies, CSRF, anulimi dhe rifreskimi i rolit
    types.ts                   # Kontratat e API-së dhe formatimi i përbashkët
    ui.tsx                     # Dialog, gabime, faqëzim, mesazhe dhe sasi
    forms/                     # Fjalëkalimi, fotografia dhe galeria
    reports/                   # Eksporti PDF/Excel dhe butonat e shkarkimit
  assets/                      # Fotografitë dhe fonti i raporteve
```

## Rregullat e zgjerimit

- Rrugët regjistrohen në app/App.tsx; një faqe përbëhet nga komponentë sipas përgjegjësisë.
- Kodi që i përket një funksioni qëndron brenda features; komponentët e përdorur në disa funksione qëndrojnë në shared.
- Kërkesat kalojnë nga shared/api.ts; një komponent nuk krijon mekanizma të tjerë hyrjeje ose CSRF-je.
- Çmimet, shitjet, pagesat, borxhet dhe autorizimi përfundimtar llogariten/kontrollohen nga backend-i.
- Gjendja e shportës dhe sesionit ndahet përmes provider-ëve të tyre. Të dhënat private nuk ruhen në service-worker cache.
- PDF/Excel ngarkohen në chunks të veçantë kur kërkohet eksporti. Shkarkimet lexojnë faqet e API-së, jo vetëm faqen e dukshme të tabelës; kufiri është 5,000 rreshta për listë.
- Njoftimet rifreskohen çdo 15 sekonda kur platforma është e hapur; nuk janë push jashtë aplikacionit.
- Stilet bazë janë në styles.css, përshtatjet për ekranet në responsive.css dhe dizajni aktual i dyqanit/panelit në experience.css. Mbani rregullat e një komponenti së bashku dhe verifikoni desktop/mobile pas ndryshimit.
- Përdorni TypeScript strict, npm run format:check dhe npm run build para ruajtjes së ndryshimeve.

Për një funksion të ri shtoni dosjen përkatëse te features dhe krijoni nënndarje vetëm kur ekziston përgjegjësi reale; mos shtoni dosje bosh ose abstraksione pa përdorim.
