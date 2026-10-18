# Government SchemeMatch AI

## What is included

- A SQLite database seeded with 50 farmer-focused Indian government schemes, missions and related programmes.
- Hindi and English names, short explanations, eligibility guidance, official portal links and source links.
- Farmer opt-in profiles for state, district, crops and interests.
- In-app alerts stored in SQLite and refreshed by the page every 20 seconds.
- A key-protected admin portal for publishing bilingual schemes, uploading MP4/WebM explainers (up to 50 MB), and reviewing farmer registration-help requests.
- Admin request actions: approve, reject, or mark assistance complete after the team has helped the farmer on the official portal.
- Registration-help requests are stored in SQLite and contain only contact/location/crop details; the prototype explicitly does not collect Aadhaar or bank credentials.
- Scheme information in the main KisanPulse guide and the Gemini scheme explainer.

The catalogue is a selected reference set, not a verified “latest 50 launches” feed. The public myScheme directory is a discovery catalogue, and the official sources reviewed for this prototype do not provide a launch-ordered feed/API that can reliably notify on every new announcement. A team member must confirm the announcement at its official source and publish it in the Admin form. SMS, WhatsApp and browser push are not connected.

## Run in PowerShell

Use Node.js 22.13 or newer (the project was checked with Node 24):

```powershell
npm install
npm run dev:full
```

Open the Vite address shown in the terminal, normally `http://localhost:3000`. The scheme API runs at `http://localhost:3001`, and SQLite creates `server/data/kisanpulse.sqlite` on first start. Stop both processes with **Ctrl+C**.

## Enable the admin portal

Create/keep a private `ADMIN_API_KEY` value in the ignored `.env` file. It must be an active line, without `#` at the start. Restart the app after changing it:

```powershell
npm run dev:full
```

Open **Government Schemes → Admin portal**, enter the admin key, and use the scheme, video, and request sections. Publishing a scheme requires both languages and HTTPS official links. Uploads are stored under `server/uploads/`, which is ignored by Git.

The key is not written to the database. `.env`, the local SQLite file, and uploaded videos are ignored by Git. Registration requests are a prototype workflow: approval is not government approval, and an admin must separately complete any real application on the official portal. This local server is not suitable for public deployment without real user accounts, HTTPS, secure storage/retention rules, and access controls.

## Sources and accuracy

The seed uses official Government of India portals and PIB releases, including the PIB’s farmer-scheme overview and releases for PM Dhan-Dhaanya Krishi Yojana and the Mission for Aatmanirbharta in Pulses. Some programme details and eligibility change by state, season or application window; use the linked official source before applying. Entries without a confirmed launch/announcement date leave that field blank.
