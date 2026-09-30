# Digi-Support 🇮🇳

> **Digital Government Services & Scholarship Assistant for Everyone, Especially Senior Citizens**  
> Built for the Digi-Support Hackathon MVP.

---

## 🌟 Highlights & Features

1. **Elderly-Friendly Accessible UI**
   - **Big Font & High Contrast Mode**: One-tap toggle (`🔤 A+`) in the navbar with persistent state across sessions.
   - Large typography (18px base, 22px in big-font mode), high-contrast palettes, generous touch targets (≥48px), and visible focus rings.
   - Fully responsive design with mobile hamburger menu and quick access.

2. **Module 1 — Registration Checklists (`/checklist`)**
   - Expanded catalog of **20 essential Indian public & welfare services** (Senior Citizen Card, Old Age Pension IGNOAPS, Ayushman Bharat Health Card, UDID Disability Card, Ration Card, PAN Card, Aadhaar Update, Legal Heir Certificate, Caste Certificate, Domicile Certificate, Birth/Death Certificates, PM Kisan, E-Shram, PM Ujjwala LPG, Passport, Driving Licence, Voter ID, Marriage Registration, and Income Certificate).
   - **Smart Multi-Field Search**: Searches by service title OR specific document names (e.g. searching "bank" or "medical" finds all matching schemes).
   - **Quick Filter Pills**: Instant one-tap filter buttons ("Senior", "Pension", "Health", "Aadhaar", "Certificate", "Card").
   - Interactive document readiness checkboxes with live progress tracking (`3 of 5 ready`).
   - One-click **"Select All" / "Deselect All"** helpers.
   - Instant **PDF Checklist generation** via client-side `jsPDF`.

3. **Module 2 — Scholarship Eligibility Portal (`/scholarships`)**
   - Expanded catalog of **24 central and state scholarships** (NSP, CSSS, PMSS, AICTE Pragati, Saksham, E-Grantz Kerala, C.H. Muhammed Koya, Begum Hazrat Mahal, LIC Golden Jubilee, etc.).
   - Interactive filter by **Annual Income**, **Category** (General, OBC, SC, ST, Minority), and **Education Level**.
   - Instant visual qualification badges: **Eligible ✅** vs. **Not Eligible ❌**.
   - Filter tabs: *All Schemes*, *Eligible Only*, *Not Eligible*.
   - Direct official application portal links.

4. **Module 3 — Conversational AI Form Filling (`/voice`)**
   - **Split-Screen Interactive UI**: Left column features an interactive conversational chat & voice interface with Digi-Sahaayak; right column displays a live, dynamically-updating official government application preview.
   - **Conversational Entity Extraction**: Citizen speaks or types naturally in English, Malayalam, Hindi, or Tamil (e.g., *"I need an Income Certificate, my name is Radhakrishnan, age 62 from Aluva"*), and the AI automatically extracts structured application data.
   - **Dual AI Engine Architecture**: Powered by Google's **Gemini 2.0 Flash** via `/api/chat` with a zero-dependency **Smart Local NLP Extractor fallback** ensuring 100% uptime on stage with or without an API key.
   - **Voice Input Integration**: Tap-to-speak via Web Speech API with interim live speech typing and speech-to-intent parsing.
   - **Direct Field Editing**: Citizens can click any field on the live application card to manually correct spelling or values.
   - **Official Application PDF Export**: Generates an official, pre-filled government application form complete with applicant details table, checklist of supporting documents to attach, citizen declaration, and signature line via `jsPDF`.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **UI Library**: [React 19](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF)
- **Voice Recognition**: Standard Browser [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- **State & Data**: Local JSON data + React client state (zero external database required for instant hackathon deployment)

---

## 📁 Project File Structure

```text
digi/
├── .eslintrc.json              # ESLint core configuration
├── next-env.d.ts               # Next.js TypeScript definitions
├── next.config.mjs             # Next.js runtime configuration
├── package.json                # Project dependencies and scripts
├── postcss.config.mjs          # Tailwind CSS PostCSS plugin configuration
├── tsconfig.json               # TypeScript compiler options
└── src/
    ├── app/
    │   ├── globals.css         # Tailwind v4 styles, high-contrast & big-font variables
    │   ├── layout.tsx          # Root layout with header, main container, and footer
    │   ├── page.tsx            # Home page with hero & quick-action cards
    │   ├── checklist/
    │   │   └── page.tsx        # Module 1: Document checklist & PDF exporter
    │   ├── scholarships/
    │   │   └── page.tsx        # Module 2: 24 scholarships & eligibility checker
    │   └── voice/
    │       └── page.tsx        # Module 3: Web Speech API voice form & PDF generator
    ├── components/
    │   └── Navbar.tsx          # Sticky navigation bar with mobile menu & A+ toggle
    ├── data/
    │   ├── scholarships.json   # 24 Indian scholarships with eligibility criteria
    │   └── services.json       # 20 government services with document requirements
    └── types/
        └── speech.d.ts         # TypeScript declarations for Web Speech API
```

---

## 🚀 How to Run Locally

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (LTS v24 is installed)
- **npm**: v9+ (npm v11+ installed)

### 2. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser (Google Chrome or Microsoft Edge recommended for Web Speech API).

### 3. Build for Production
```bash
npm run build
npm run start
```

### 4. Run Linter & Type Check
```bash
npm run lint
npx tsc --noEmit
```

---

## 🎙️ Note on Testing the Voice Feature
The **Web Speech API** requires a **secure context** (either `http://localhost:*` or an `https://` domain).
- When testing on your laptop/desktop, open `http://localhost:3000/voice` directly.
- When testing on a mobile device on your local Wi-Fi, use an HTTPS tunnel (e.g. `ngrok http 3000` or Cloudflare tunnel) or use Chrome port forwarding via USB debugging (`chrome://inspect`) so the browser treats the origin as `localhost`.
