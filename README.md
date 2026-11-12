# Tryeza — Produkte Bio

Aplikacion për porositjen e produkteve ushqimore dhe administrimin e shitjeve. Bashkon porositë online, porositë telefonike dhe shitjet direkte në një sistem, me menaxhim të stokut, pagesave dhe borxheve.

Ndërfaqja është në shqip, e përshtatur për kompjuter dhe telefon, me instalim si PWA në Android dhe iPhone.

[Backend](https://github.com/adrianmehaj/food-sales-api) · [Arkitektura](ARCHITECTURE.md) · [Licenca](LICENSE)

## Teknologjitë

React 19 · TypeScript · Vite 7 · React Router · Lucide · jsPDF · ExcelJS

## Funksionalitetet

- Katalog me kërkim, kategori, oferta dhe detaje të produkteve.
- Shportë dhe porosi me ose pa llogari, me datë dërgese ose marrje vetë.
- Llogari personale me profil, historik porosish, pagesa dhe njoftime.
- Panel administrimi për produktet, stokun, klientët, banerat dhe shitjet manuale.
- Pasqyrë e shitjeve, arkëtimeve dhe borxheve, me raporte PDF/Excel.

## Nisja lokale

Nevojiten Node.js 22.12+ dhe backend-i aktiv në `http://localhost:5080`. Instalimi i backend-it përshkruhet në [repository-n përkatës](https://github.com/adrianmehaj/food-sales-api#nisja-lokale).

Nga dosja e frontend-it:

```powershell
npm ci
npm run dev
```

Aplikacioni hapet në [http://127.0.0.1:5173](http://127.0.0.1:5173).

Vite përcjell `/api`, `/media` dhe `/health` te backend-i. Klienti HTTP përdor URL relative, cookie sesioni dhe CSRF në të njëjtin origin.

## Organizimi

```text
src/
  app/          Navigimi, layout-et dhe përditësimet PWA
  features/     Account, admin, cart, catalog, notifications, reports
  shared/       Klienti HTTP, kontratat dhe komponentët e përbashkët
  styles/       Stilet dhe përshtatjet për ekranet
  assets/       Asetet lokale
public/         Ikonat, manifesti dhe service worker
scripts/        Ndërtimi dhe paketimi
```

Faqet dytësore dhe bibliotekat e eksportit ngarkohen sipas nevojës. Backend-i kontrollon autorizimin, çmimet, stokun dhe totalet. Për përgjegjësitë e moduleve shihni [arkitekturën](ARCHITECTURE.md).

## Build dhe publikim

```powershell
npm run format:check
npm run build
```

Build-i gjenerohet në `dist/`. Për ta paketuar me ASP.NET Core:

```powershell
npm run package:api -- ../food-sales-api
```

Argumenti përcakton vendndodhjen e backend-it. Në prodhim, ndërfaqja dhe API-ja shërbehen nga i njëjti origin, përmes ASP.NET Core ose një reverse proxy.

[Frontend CI](.github/workflows/ci.yml) kontrollon formatimin dhe build-in në push dhe pull request. Aktualisht nuk përfshihet një suitë testesh end-to-end.

## PWA

Instalimi kërkon build production dhe HTTPS. Në iPhone përdoret Safari → Share → Add to Home Screen; në Android, opsioni Install / Add to Home screen në shfletues.

Service worker ruan asetet e aplikacionit; faqet shtesë ruhen pasi vizitohen. Porositë, pagesat dhe kërkesat e API-së kërkojnë lidhje me rrjetin. Për testim nga telefoni gjatë zhvillimit shihni [udhëzimin Ngrok](NGROK.md).

## Licenca

[MIT](LICENSE). Fonti Lato për raportet shoqërohet me [licencën OFL](public/licenses/OFL-Lato.txt).
