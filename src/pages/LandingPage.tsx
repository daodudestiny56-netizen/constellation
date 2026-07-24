import { useState } from 'react';
import { DEMO_PATIENTS, type DemoPatient } from '../lib/ontomorph';
import { useTwin } from '../context/TwinContext';
import { BODY_SYSTEM_META } from '../lib/bodySystem';

type Props = {
  onNavigate: (route: string) => void;
};

export function LandingPage({ onNavigate }: Props) {
  const { connect } = useTwin();
  const [activeTab, setActiveTab] = useState<'problem' | 'solution' | 'tech'>('solution');

  const handleLaunchPatient = async (patientId: string) => {
    await connect(patientId);
    onNavigate('home');
  };

  const handleLaunchDashboard = () => {
    onNavigate('home');
  };

  return (
    <div className="flex-1 flex flex-col bg-ink text-text-primary overflow-x-hidden">
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        {/* Glowing Background Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-signal/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[250px] h-[250px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-surface-raised border border-hairline/80 text-xs font-mono text-signal mb-6 animate-fade-in shadow-lg">
          <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
          <span>Built for the Ontomorph Hackathon • Powered by HOLON API</span>
        </div>

        {/* Main Title */}
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight max-w-4xl leading-[1.15] mb-6">
          Uncover Disease Patterns That <span className="gradient-text">Single-Specialty EHRs Miss</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-text-muted max-w-2xl leading-relaxed mb-8 sm:mb-10 font-body">
          A cross-system clinical decision support engine for digital twins. Translating multi-organ observations into standardized phenotype fingerprints to collapse the 7-year diagnostic odyssey into seconds.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md sm:max-w-none">
          <button
            onClick={handleLaunchDashboard}
            className="w-full sm:w-auto min-h-[52px] px-8 py-3.5 rounded-2xl bg-signal text-ink font-display font-bold text-base hover:bg-signal/90 transition-all shadow-xl shadow-signal/25 hover:shadow-signal/40 active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <span>Launch Clinical App</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>

          <a
            href="#case-studies"
            className="w-full sm:w-auto min-h-[52px] px-6 py-3.5 rounded-2xl bg-surface-raised border border-hairline text-text-primary text-sm font-semibold hover:border-signal/50 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polygon points="10 8 16 12 10 16 10 8" />
            </svg>
            <span>Explore Case Studies</span>
          </a>
        </div>

        {/* Animated Visual Diagram Feature */}
        <div className="mt-10 sm:mt-16 w-full max-w-4xl card p-3.5 sm:p-8 border border-hairline/80 relative overflow-hidden bg-surface/80 backdrop-blur-md shadow-2xl">
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-hairline text-[11px] sm:text-xs font-mono text-text-muted">
            <span className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-signal flex-shrink-0" />
              <span className="truncate">ANATOMICAL SYSTEM NETWORK</span>
            </span>
            <span className="text-signal flex-shrink-0 font-semibold">10 SYSTEMS</span>
          </div>

          <div className="py-4 sm:py-8 grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3">
            {Object.entries(BODY_SYSTEM_META).map(([key, meta]) => (
              <div
                key={key}
                className="p-2 sm:p-3 rounded-xl bg-surface-raised/60 border border-hairline/40 flex flex-col items-center text-center space-y-1 hover:border-signal/40 transition-colors min-h-[64px] justify-center"
              >
                <span
                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shadow-sm flex-shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <span className="font-display font-semibold text-[11px] sm:text-xs text-text-primary leading-tight">{meta.label}</span>
                <span className="text-[9px] sm:text-[10px] text-text-muted font-mono">HOLON Linked</span>
              </div>
            ))}
          </div>

          <p className="text-[11px] sm:text-xs text-text-muted text-center pt-2 border-t border-hairline/30 leading-relaxed">
            Simultaneously evaluates observations across Cardiovascular, Renal, Nervous, Hepatic, Ocular, Dermatological, Skeletal, Pulmonary, Endocrine & Hematological lanes.
          </p>
        </div>
      </section>

      {/* ─── METRICS BANNER ─── */}
      <section className="border-y border-hairline bg-surface/50 py-8 sm:py-14 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 text-center">
          <div className="space-y-1">
            <p className="font-display text-2xl sm:text-4xl font-extrabold text-signal">5–7 Years</p>
            <p className="text-[11px] sm:text-sm text-text-muted">Average Diagnostic Delay</p>
          </div>

          <div className="space-y-1">
            <p className="font-display text-2xl sm:text-4xl font-extrabold text-text-primary">7+ Clinics</p>
            <p className="text-[11px] sm:text-sm text-text-muted">Specialty Silos Per Patient</p>
          </div>

          <div className="space-y-1">
            <p className="font-display text-2xl sm:text-4xl font-extrabold text-signal">10 Systems</p>
            <p className="text-[11px] sm:text-sm text-text-muted">Unified Cross-System Engine</p>
          </div>

          <div className="space-y-1">
            <p className="font-display text-2xl sm:text-4xl font-extrabold text-text-primary">100%</p>
            <p className="text-[11px] sm:text-sm text-text-muted">Explainable Audit Trail</p>
          </div>
        </div>
      </section>

      {/* ─── THE SILO PROBLEM VS CONSTELLATION ─── */}
      <section className="py-12 sm:py-24 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8 sm:space-y-12">
        <div className="text-center space-y-2.5 max-w-2xl mx-auto">
          <h2 className="font-display text-2xl sm:text-4xl font-bold tracking-tight">
            Why Multi-System Diseases Are Missed
          </h2>
          <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
            A patient with Fabry disease sees four specialists across four years. Each doctor treats their organ system in isolation. Nobody sees the full constellation.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center w-full">
          <div className="p-1 rounded-xl bg-surface-raised border border-hairline flex flex-col sm:flex-row gap-1 text-xs w-full sm:w-auto">
            <button
              onClick={() => setActiveTab('problem')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[40px] text-center cursor-pointer ${
                activeTab === 'problem' ? 'bg-flag text-white shadow-md' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              The Traditional EHR Silo
            </button>
            <button
              onClick={() => setActiveTab('solution')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[40px] text-center cursor-pointer ${
                activeTab === 'solution' ? 'bg-signal text-ink shadow-md font-semibold' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              The Constellation Approach
            </button>
            <button
              onClick={() => setActiveTab('tech')}
              className={`px-4 py-2.5 rounded-lg font-medium transition-colors min-h-[40px] text-center cursor-pointer ${
                activeTab === 'tech' ? 'bg-surface text-text-primary border border-hairline' : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Platform Architecture
            </button>
          </div>
        </div>

        {/* Tab Content Display */}
        <div className="card p-6 sm:p-8 border border-hairline">
          {activeTab === 'problem' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
              <div className="p-4 rounded-xl bg-surface-raised/50 border border-flag/30 space-y-2">
                <span className="text-xs font-mono text-flag font-semibold">Specialist #1 • Cardiology</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">Cardiomyopathy</h4>
                <p className="text-xs text-text-muted">Notes left ventricular thickening. Prescribes blood pressure management. No cross-department alerts.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised/50 border border-flag/30 space-y-2">
                <span className="text-xs font-mono text-flag font-semibold">Specialist #2 • Nephrology</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">Proteinuria</h4>
                <p className="text-xs text-text-muted">Detects kidney protein leakage. Attributes to idiopathic glomerulonephritis.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised/50 border border-flag/30 space-y-2">
                <span className="text-xs font-mono text-flag font-semibold">Specialist #3 • Neurology</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">Acroparesthesia</h4>
                <p className="text-xs text-text-muted">Diagnoses burning pain in hands & feet as non-specific peripheral neuropathy.</p>
              </div>

              <div className="p-4 rounded-xl bg-surface-raised/50 border border-flag/30 space-y-2">
                <span className="text-xs font-mono text-flag font-semibold">Specialist #4 • Dermatology</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">Angiokeratoma</h4>
                <p className="text-xs text-text-muted">Notes dark skin lesions. Treats as isolated vascular spots. 5 years pass without a unified diagnosis.</p>
              </div>
            </div>
          )}

          {activeTab === 'solution' && (
            <div className="space-y-6 animate-fade-in">
              <div className="p-5 rounded-2xl bg-signal/10 border border-signal/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono text-signal font-semibold uppercase tracking-wider">
                    Constellation Multi-System Fusion
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs bg-signal text-ink font-bold">
                    Fabry Disease • 94% Match
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-text-primary leading-relaxed">
                  Constellation ingests observations across Cardiology, Nephrology, Neurology, and Dermatology, translates them via the HOLON API into standardized HPO terms, and immediately flags the multi-system fingerprint for <strong className="text-signal">Fabry Disease</strong>.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-surface-raised space-y-2 border border-hairline">
                  <h4 className="font-display font-semibold text-sm text-text-primary">1. System Lanes</h4>
                  <p className="text-xs text-text-muted">Visualizes all historical and live clinical findings aligned across body systems.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-raised space-y-2 border border-hairline">
                  <h4 className="font-display font-semibold text-sm text-text-primary">2. Explainable Trace</h4>
                  <p className="text-xs text-text-muted">Shows exact matching symptoms, missing expected signs, and system coverage.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-raised space-y-2 border border-hairline">
                  <h4 className="font-display font-semibold text-sm text-text-primary">3. Safety Shield</h4>
                  <p className="text-xs text-text-muted">Cross-references organ impairment with nephrotoxic/hepatotoxic drug choices.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tech' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs animate-fade-in">
              <div className="p-4 rounded-xl bg-surface-raised space-y-2 border border-hairline">
                <span className="font-mono text-signal">SDK Integration</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">@ontomorph/dtp-sdk</h4>
                <p className="text-text-muted">Operates on grant-scoped digital twin events with live stream subscriptions.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised space-y-2 border border-hairline">
                <span className="font-mono text-signal">Clinical Knowledge</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">HOLON API</h4>
                <p className="text-text-muted">Provides cross-vocabulary translation (ICD-10/LOINC to HPO), drug interactions, and reference ranges.</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-raised space-y-2 border border-hairline">
                <span className="font-mono text-signal">Edge Security</span>
                <h4 className="font-display font-semibold text-sm text-text-primary">Vercel Proxy Layer</h4>
                <p className="text-text-muted">All credentials protected behind serverless endpoints at /api/holon and /api/dtp.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ─── LIVE CASE STUDIES CAROUSEL ─── */}
      <section id="case-studies" className="py-16 sm:py-20 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-hairline pb-4">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Interactive Clinical Case Studies
            </h2>
            <p className="text-xs sm:text-sm text-text-muted mt-1">
              Select any pre-configured case study to launch the twin dashboard live.
            </p>
          </div>
          <button
            onClick={handleLaunchDashboard}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-signal/15 text-signal font-semibold text-xs hover:bg-signal/25 transition-colors self-start sm:self-auto cursor-pointer"
          >
            View All Patients & Add Custom Twin →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DEMO_PATIENTS.map((patient: DemoPatient) => (
            <div
              key={patient.id}
              className="card text-left p-5 hover:border-signal/50 transition-all border border-hairline flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-display font-semibold text-lg text-text-primary group-hover:text-signal transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-xs text-text-muted font-mono mt-0.5">
                      {patient.age}y / {patient.sex} • ID: {patient.id}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-signal-dim text-signal border border-signal/20 flex-shrink-0">
                    {patient.expectedTopMatch}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed">
                  {patient.summary}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {patient.primarySystems.map((sys) => (
                    <span
                      key={sys}
                      className="px-2 py-0.5 rounded text-[11px] bg-surface-raised text-text-muted border border-hairline/50"
                    >
                      {sys}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleLaunchPatient(patient.id)}
                className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-surface-raised hover:bg-signal hover:text-ink text-signal font-semibold text-xs transition-all flex items-center justify-between border border-hairline group-hover:border-signal/40 cursor-pointer"
              >
                <span>Launch Patient Twin Dashboard</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL FOOTER CTA ─── */}
      <footer className="border-t border-hairline bg-surface/40 py-12 px-4 sm:px-6 mt-12">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-signal/20 flex items-center justify-center text-signal">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="5" r="1.5" />
                <circle cx="5" cy="12" r="1.5" />
                <circle cx="19" cy="12" r="1.5" />
                <circle cx="12" cy="19" r="1.5" />
              </svg>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-text-primary">Constellation</p>
              <p className="text-xs text-text-muted">Built for Ontomorph Hackathon 2026</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs text-text-muted">
            <button onClick={handleLaunchDashboard} className="hover:text-signal transition-colors cursor-pointer">
              Launch App
            </button>
            <span>•</span>
            <a href="https://github.com/daodudestiny56-netizen/constellation.git" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">
              GitHub Repository
            </a>
            <span>•</span>
            <a href="https://ontomorph.com" target="_blank" rel="noopener noreferrer" className="hover:text-signal transition-colors">
              Ontomorph DTP
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
