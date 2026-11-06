# Testimi me një adresë Ngrok

Rrjedha: `HTTPS Ngrok → Vite :5173 → /api, /media, /health → ASP.NET Core :5080`.
Frontend-i përdor klientin ekzistues me URL relative dhe cookie/CSRF në të njëjtin origin. Nuk nevojitet CORS shtesë.

Hap tre terminale PowerShell:

1. Backend (ose nis projektin FoodSales.Api me F5 në Visual Studio):

```powershell
cd C:\Users\Administrator\source\repos\adrianmehaj\food-sales-api
dotnet run --project src/FoodSales.Api --launch-profile FoodSales.Api
```

2. React:

```powershell
cd C:\Users\Administrator\Desktop\food-sales-web
npm run dev
```

3. Ngrok, vetëm nëse tuneli ekzistues është ndalur:

```powershell
ngrok http 5173 --url https://agreeing-shuffling-shield.ngrok-free.dev
```

- Publik: https://agreeing-shuffling-shield.ngrok-free.dev/?oferta=1
- Lokal: http://127.0.0.1:5173/?oferta=1
- Swagger lokal: http://localhost:5080/swagger/index.html

Swagger bllokohet në Vite. Ngrok duhet të drejtojë te porta 5173. Vite pranon vetëm host-in publik të përcaktuar dhe host-et lokale të lejuara nga Vite.

Rinis backend-in pas ndryshimit të Program.cs. Në Development, backend-i pranon vetëm X-Forwarded-Proto nga loopback, për të njohur HTTPS dhe për të vendosur cookie Secure kur kërkesa vjen nga domain-i publik. Konfigurimi i prodhimit mbetet i veçantë.

Mbaji React, backend-in dhe Ngrok aktivë gjatë testimit në telefon. Ndryshimet e React në development nuk kërkojnë rihapjen e tunelit. Nëse Ngrok shfaq faqen paralajmëruese në browser, vazhdo me butonin e tij për të hapur aplikacionin.
