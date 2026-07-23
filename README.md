# Constellation 🩺✨

> **Cross-System Clinical Decision-Support for Digital Twins**  
> *Built for the Ontomorph Hackathon.*

Constellation reads a patient's digital twin across every body system simultaneously, maps multi-organ clinical observations to Human Phenotype Ontology (HPO) terms via the **HOLON Clinical Knowledge API**, scores cross-system patterns against rare/atypical condition profiles, and presents clinicians with an explainable differential diagnosis paired with live-monitored confirmation plans.

---

## 🌟 The Core Insight

In modern medicine, single-specialty views fail patients with multi-system conditions. A cardiologist sees hypertrophic cardiomyopathy, a nephrologist sees unexplained proteinuria, a neurologist notes burning peripheral pain, and a dermatologist treats angiokeratoma. **No single department connects the dots.**

Constellation's entire value proposition is **uncovering patterns across separate body systems that no single-specialty view would catch alone.**

---

## 🚀 Key Features & Capabilities

- **Cross-System Event Lanes**: Interactive visualization plotting findings across 10 distinct anatomical systems (*Cardiovascular, Nervous, Renal, Hepatic, Ocular, Dermatological, Skeletal, Pulmonary, Endocrine, Hematological*).
- **HOLON Clinical Knowledge API Integration**: Translates ICD-10 codes, LOINC lab identifiers, and clinical observations directly to standardized HPO phenotype terms (`HP:0001714`, `HP:0000083`, etc.).
- **Live Interactive Finding Logger**: Clinicians can log observations on-the-fly using real-time concept search with autocomplete powered by HOLON's clinical vocabulary database.
- **Weighted Multi-System Scoring**: Differential algorithm evaluating phenotype overlap, cross-system spread, and pathognomonic diagnostic weights.
- **Explainable Reasoning Trace**: Every match is accompanied by a transparent audit trail detailing matched symptoms, missing expected signs, and system coverage percentages.
- **Dynamic Monitoring Plans**: Recommends specific diagnostic tests (e.g. Enzyme activity assays, LOINC-coded lab panels) with age- and sex-adjusted normal reference ranges.
- **Mobile-First & Bedside Ready**: Fully responsive mobile UI with vertical stacked system lanes, 44px+ touch targets, dynamic viewport height sheets (`dvh`), and WhatsApp clinician sharing.

---

## 📁 Clinical Case Studies

Constellation includes built-in clinical case studies for testing and live demonstrations:

| Patient Name | Profile | Systems Affected | Target Profile | Initial State |
| :--- | :--- | :--- | :--- | :--- |
| **James Okafor** (38y M) | Heart, kidney, nerve, & skin signs | Cardiovascular, Renal, Nervous, Dermatological | **Fabry Disease** | Clean slate (Interactive Demo) |
| **Priya Mehta** (27y F) | Liver damage, tremors, & eye rings | Hepatic, Nervous, Ocular | **Wilson Disease** | Clean slate (Interactive Demo) |
| **David Müller** (45y M) | Dyspnea, uveitis, & skin lesions | Pulmonary, Ocular, Dermatological, Hepatic | **Sarcoidosis** | Pre-loaded Case Study |
| **Sophie Tremblay** (22y F) | Aortic root dilation & lens dislocation | Cardiovascular, Skeletal, Ocular | **Marfan Syndrome** | Pre-loaded Case Study |

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: React 19, TypeScript, Vite 6, Tailwind CSS v4
- **SDK & Data Layer**: `@ontomorph/dtp-sdk` (`v0.1.2`)
- **Ontology API**: HOLON Clinical Knowledge API (`https://holon.ontomorph.com`)
- **State Management**: React Context (`TwinContext`) with dynamic re-scoring pipeline
- **PWA Capabilities**: `vite-plugin-pwa`, Workbox Service Worker, Web App Manifest
- **Design System**: Space Grotesk (Headlines), IBM Plex Sans (Body), IBM Plex Mono (Codes), Tailored Dark-Mode Palette (`#0F1B1E` Ink, `#4FD1C5` Signal Teal)

```
src/
├── components/          # Reusable UI & Visualizations
│   ├── DifferentialCard.tsx   # Ranked match card with score gauge
│   ├── Header.tsx             # Responsive header & connection badge
│   ├── LogFindingModal.tsx    # HOLON concept search & finding logger
│   ├── MonitoringPlan.tsx     # Diagnostic test table & reference ranges
│   ├── PWAInstallBanner.tsx   # Safe-area aware PWA banner
│   ├── ReasoningTrace.tsx     # Explainable evidence breakdown
│   ├── ScoreGauge.tsx         # Animated SVG score ring
│   ├── SystemLanes.tsx        # Responsive body system visualization
│   └── ThreadAnimation.tsx    # Diagnostic pattern thread animation
├── context/
│   └── TwinContext.tsx        # Central digital twin state & DTP integration
├── lib/
│   ├── bodySystem.ts          # HPO term to body system lane mapping
│   ├── candidates.ts          # Condition profiles & phenotype rulesets
│   ├── ontomorph.ts           # DTP SDK & HOLON client abstraction wrapper
│   └── scoring.ts             # Differential scoring engine
└── pages/
    ├── Home.tsx               # Patient dashboard & system lanes
    ├── Results.tsx            # Ranked differential list & connected findings
    ├── MatchDetail.tsx        # Deep dive reasoning trace & monitoring plan
    └── LiveView.tsx           # Real-time event streaming dashboard
```

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- Node.js `v18.0.0` or higher
- npm `v9.0.0` or higher

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/daodudestiny56-netizen/constellation.git
cd constellation
npm install
```

### 3. Environment Variables
Create a `.env` file in the root directory (or copy from `.env.example`):
```env
VITE_DTP_KEY=dtp_test_demo_key
VITE_HOLON_KEY=holon_8243c9049f0fe24cad5954e2b07e7db76e66769e597b44d5d1aea44e7bdd4d65
VITE_HOLON_API_URL=https://holon.ontomorph.com
VITE_APP_URL=http://localhost:5173
```

### 4. Run Development Server
Start Vite dev server with hot module replacement:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
Validate TypeScript types and generate the production bundle & PWA service worker:
```bash
npm run build
```

---

## 🔬 How the Differential Engine Works

1. **Event Ingestion**: Digital twin events or user-logged observations are collected as clinical codes (ICD-10 / LOINC).
2. **HPO Mapping**: Codes are translated via `dtp.holon.mappings.translate()` into HPO phenotype terms (`HP:XXXXXXX`).
3. **Anatomical Routing**: Terms are routed to 1 of 10 body system lanes based on anatomical organ hierarchy.
4. **Pattern Scoring**:
   $$\text{Score} = \text{Base Match Score} + \text{System Coverage Bonus} + \text{Pathognomonic Weight}$$
5. **Explainable Output**: Matches are ranked with confidence percentages, detailed reasoning traces, and lab verification plans.

---

## 📜 License & Compliance

Developed for the Ontomorph Hackathon. Powered by `@ontomorph/dtp-sdk` and the HOLON Clinical Knowledge API.
