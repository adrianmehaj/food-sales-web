<p align="center">
  <img src="public/brand-mark.svg" width="88" alt="Logoja e Tryezës" />
</p>

# Tryeza — Produkte Bio

**Dyqan online dhe panel administrimi për shitjen e produkteve ushqimore.**

Ndërfaqe në shqip për klientë dhe administratorë, e përshtatur për kompjuter, telefon dhe instalim si PWA. Katalogu, porositë online, shitjet manuale dhe historiku financiar përdorin të njëjtin backend.

[Backend-i](https://github.com/adrianmehaj/food-sales-api) · [Arkitektura](ARCHITECTURE.md) · [Testimi me Ngrok](NGROK.md) · [Licenca](LICENSE)

## Teknologjitë

| Pjesa                  | Teknologjia                                              |
| ---------------------- | -------------------------------------------------------- |
| Ndërfaqja              | React 19 dhe TypeScript me kontroll strikt               |
| Zhvillimi dhe ndërtimi | Vite 7                                                   |
| Navigimi               | React Router                                             |
| Ikonat                 | Lucide                                                   |
| Raportet               | jsPDF, AutoTable dhe ExcelJS, të ngarkuara sipas nevojës |
| PWA                    | Web App Manifest dhe service worker i aplikacionit       |
| Shërbimet              | ASP.NET Core 10 dhe SQL Server, në projektin backend     |

## Funksionaliteti

### Për klientët

- Katalog me kategori, kërkim, oferta dhe faqe me detajet e produktit.
- Banera me disa fotografi, kalim automatik çdo 2.5 sekonda dhe navigim me shigjeta.
- Shportë me hap sasie 0.5 për kilogramë/litra dhe 1 për copë; mesazh kur tejkalohet stoku.
- Porosi pa llogari ose me llogari personale.
- Dërgesë në adresë me datë të dëshiruar ose marrje vetë.
- Profil, porosi, pagesa, borxhe dhe njoftime brenda platformës, sipas llogarisë së hyrë.

### Për administratorët

- Pasqyrë me shitjet, arkëtimet, borxhin dhe porositë në pritje.
- Kërkim klientësh sipas emrit ose telefonit nga pjesa e sipërme e panelit.
- Produkte, stok, fotografi, banera dhe oferta me datë fillimi/përfundimi.
- Llogaritje e dyanshme e ofertës: përqindje zbritjeje ose çmim final.
- Regjistrim i shitjeve manuale, ndryshim i peshës përfundimtare dhe menaxhim i porosive.
- Pagesa të plota, të pjesshme dhe pagesa të mëvonshme me miratim të borxhit.
- Raporte për klientët dhe eksport në PDF/Excel.
- Shtim i administratorëve nga llogaria e një administratori ekzistues.

## Nisja lokale

### Parakushtet

- Node.js 22.12 ose më i ri dhe npm.
- Backend-i i konfiguruar dhe aktiv në `http://localhost:5080`.

Nga dosja e frontend-it:

```powershell
npm ci
npm run dev
```

Hapni [aplikacionin lokal](http://127.0.0.1:5173). Faqja e ofertave hapet në `/?oferta=1`.

Vite përcjell `/api`, `/media` dhe `/health` te backend-i. Klienti HTTP përdor URL relative, cookie të sesionit dhe token CSRF; nuk kërkohet konfigurim shtesë CORS për këtë rrjedhë.

## Komandat

| Komanda                                    | Qëllimi                                                                    |
| ------------------------------------------ | -------------------------------------------------------------------------- |
| `npm run dev`                              | Nis Vite për zhvillim lokal.                                               |
| `npm run build`                            | Kontrollon TypeScript-in dhe ndërton frontend-in/PWA-në në `dist/`.        |
| `npm run format:check`                     | Kontrollon formatimin e kodit.                                             |
| `npm run format`                           | Formaton kodin me Prettier.                                                |
| `npm run preview`                          | Shërben build-in lokal; API-ja duhet siguruar veçmas në të njëjtin origin. |
| `npm run package:api -- ../food-sales-api` | Ndërton aplikacionin dhe e kopjon te backend-i i zgjedhur.                 |

Për të kopjuar build-in në një checkout të backend-it:

```powershell
npm run build
node scripts/copy-to-api.mjs ../food-sales-api
```

Zëvendësoni argumentin e fundit me vendndodhjen reale të backend-it. Në mungesë argumenti, skripti përdor `FOODSALES_API_PATH`, nëse është vendosur, ose dosjen fqinje `../food-sales-api`. Për publikim të kombinuar, backend-i ofron edhe `scripts/Publish-App.ps1`.

## Struktura e projektit

```text
src/
  app/                 Navigimi, layout-et dhe cikli i PWA-së
  features/
    account/           Hyrja, profili dhe sesioni
    admin/             Pasqyra, produktet, klientët dhe shitjet
    cart/              Shporta dhe formulari i porosisë
    catalog/           Produktet, ofertat dhe detajet
    notifications/     Njoftimet brenda platformës
    reports/           Raportet dhe komponentët financiarë
  shared/              Klienti HTTP, kontratat, formularët dhe eksportet
  styles/              Stilet e ndara sipas përgjegjësisë dhe rendit të kaskadës
  assets/              Fontet lokale
public/                Logoja, ikonat, manifesti dhe service worker
scripts/               Paketimi dhe gjenerimi i ikonave
```

Katalogu ngarkohet menjëherë; faqet e tjera dhe paneli i adminit ngarkohen sipas navigimit me `React.lazy`. Formulari i klientit ripërdoret nga checkout-i dhe shitja manuale, pa varësi mes faqeve.

Për rregullat e zgjerimit dhe përgjegjësitë e moduleve shihni [ARCHITECTURE.md](ARCHITECTURE.md).

## PWA dhe përdorimi në telefon

Emri i aplikacionit është **Tryeza - Produkte Bio**. Për testim të instalimit përdorni build-in production, HTTPS dhe backend funksional.

- **iPhone:** Safari → Share → Add to Home Screen.
- **Android:** Chrome → menyja ⋮ → Add to Home screen / Install.
- **Përditësimet:** versioni i ri aktivizohet me butonin **Përditëso**. Ndryshimi i ikonës së instaluar mund të kërkojë heqjen dhe rishtimin e aplikacionit.

Service worker regjistrohet vetëm në build production. Ai parapërgatit vetëm shell-in, fontet dhe asetet fillestare nga manifesti i Vite. Faqet e tjera ruhen pasi vizitohen; një faqe e pavizituar mund të mos hapet offline. Kërkesat e API-së, porositë dhe pagesat nuk ruhen në cache. Aplikacioni nuk regjistron porosi ose pagesa offline. Shporta ruhet lokalisht në pajisje.

## Raportimi financiar

Shitjet dhe arkëtimet paraqiten veçmas. Porositë në pritje nuk trajtohen si shitje të përfunduara. Backend-i mbetet burimi përfundimtar për çmimet, stokun, autorizimin dhe totalet.

Eksportet PDF/Excel lexojnë të gjitha faqet deri në 5,000 rreshta për listë; tejkalimi i kufirit raportohet, pa shkurtim të heshtur. PDF mbështet shkronjat shqipe përmes fontit Lato.

## Publikimi

Frontend-i mund të ndërtohet si asete statike. Për konfigurimin ekzistues të autentikimit, shërbeni ndërfaqen dhe API-në nga i njëjti origin: përmes ASP.NET Core ose një reverse proxy të konfiguruar.

Hostimi i skedarëve statikë nuk siguron automatikisht ASP.NET Core apo SQL Server. Për shërbim të plotë nevojiten gjithashtu backend-i, databaza, HTTPS dhe ruajtja e qëndrueshme e fotografive. Ngrok është për testimin e instalimit lokal, jo zëvendësim për hostim të qëndrueshëm.

## Kontrolli i ndryshimeve

```powershell
npm run format:check
npm run build
```

Workflow-i [Frontend CI](.github/workflows/ci.yml) ekzekuton `npm ci`, kontrollin e formatimit dhe build-in për push në `main` dhe pull request. Nuk kërkon kredenciale ose databazë.

Kontrolloni rrjedhat e ndryshuara në desktop dhe në telefon. Build-i nuk zëvendëson verifikimin në pajisje reale. Ky projekt nuk përmban ende një suitë të automatizuar testimi end-to-end.

Funksione ende të papërfshira: rikthimi i fjalëkalimit, verifikimi i emailit, MFA dhe njoftimet email/SMS/push jashtë platformës.

## Licenca

Kodi shpërndahet sipas [licencës MIT](LICENSE). Fonti Lato shoqërohet me [licencën OFL](public/licenses/OFL-Lato.txt); varësitë mbajnë licencat e tyre përkatëse.
