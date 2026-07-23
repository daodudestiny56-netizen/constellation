import { useState } from 'react';
import { useTwin } from '../context/TwinContext';
import { SystemLanes } from '../components/SystemLanes';
import { LogFindingModal } from '../components/LogFindingModal';
import { DEMO_PATIENTS, type DemoPatient } from '../lib/ontomorph';

type Props = {
  onNavigate: (route: string) => void;
};

export function Home({ onNavigate }: Props) {
  const {
    isConnecting, isConnected, twin, connectionError,
    events, eventsBySystem,
    isAnalyzing,
    connect, addFinding, runConstellation, reset,
  } = useTwin();

  const [customToken, setCustomToken] = useState('');
  const [showCustomToken, setShowCustomToken] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);

  const handleSelectPatient = async (patientId: string) => {
    await connect(patientId);
  };

  const handleCustomConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customToken.trim()) {
      await connect(customToken.trim());
    }
  };

  const handleRunConstellation = async () => {
    await runConstellation();
    onNavigate('results');
  };

  return (
    <div className="flex-1 flex flex-col">
      {!isConnected ? (
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
          {/* Header & Branding */}
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-signal/10 border border-signal/20 flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="1.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="4" r="1.5" />
                <circle cx="4" cy="12" r="1.5" />
                <circle cx="20" cy="12" r="1.5" />
                <circle cx="12" cy="20" r="1.5" />
                <circle cx="7" cy="7" r="1" />
                <circle cx="17" cy="7" r="1" />
                <circle cx="7" cy="17" r="1" />
                <circle cx="17" cy="17" r="1" />
                <line x1="12" y1="6" x2="12" y2="10" />
                <line x1="6" y1="12" x2="10" y2="12" />
                <line x1="14" y1="12" x2="18" y2="12" />
                <line x1="12" y1="14" x2="12" y2="18" />
              </svg>
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight">
              Constellation
            </h2>
            <p className="text-text-muted text-sm leading-relaxed">
              Cross-system clinical intelligence. Select a patient dashboard to uncover hidden patterns spanning separate body systems.
            </p>
          </div>

          {/* Demo Patient Dashboards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-base text-text-primary">
                Select Patient Dashboard
              </h3>
              <span className="text-xs text-text-muted">4 Case Studies Available</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEMO_PATIENTS.map((patient: DemoPatient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient.id)}
                  disabled={isConnecting}
                  className="card text-left p-5 hover:bg-surface-raised transition-all cursor-pointer border border-hairline hover:border-signal/50 group flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-display font-semibold text-lg text-text-primary group-hover:text-signal transition-colors">
                          {patient.name}
                        </h4>
                        <p className="text-xs text-text-muted font-mono">
                          {patient.age}y / {patient.sex} • ID: {patient.id}
                        </p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-signal-dim text-signal border border-signal/20">
                        {patient.expectedTopMatch}
                      </span>
                    </div>

                    <p className="text-sm text-text-muted line-clamp-2">
                      {patient.summary}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {patient.primarySystems.map((sys) => (
                        <span
                          key={sys}
                          className="px-2 py-0.5 rounded text-xs bg-surface-raised text-text-muted border border-hairline/50"
                        >
                          {sys}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-hairline/50 flex items-center justify-between text-xs text-signal font-medium group-hover:translate-x-1 transition-transform">
                    <span>Open Patient Twin Dashboard</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Custom DTP Grant Token Section */}
          <div className="pt-4 border-t border-hairline space-y-4">
            <button
              onClick={() => setShowCustomToken(!showCustomToken)}
              className="flex items-center gap-2 text-xs text-text-muted hover:text-signal transition-colors mx-auto"
            >
              <span>{showCustomToken ? '▲ Hide Live Grant Token Login' : '▼ Connect with Custom DTP Grant Token'}</span>
            </button>

            {showCustomToken && (
              <form onSubmit={handleCustomConnect} className="max-w-md mx-auto space-y-3 p-4 card">
                <label htmlFor="grant-token" className="block text-xs font-medium text-text-muted">
                  Custom DTP Grant Token
                </label>
                <input
                  id="grant-token"
                  type="text"
                  value={customToken}
                  onChange={(e) => setCustomToken(e.target.value)}
                  placeholder="Paste JWT grant token from DTP..."
                  className="w-full px-4 py-2.5 rounded-xl bg-surface border border-hairline text-text-primary font-mono text-xs placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                />

                {connectionError && (
                  <div className="px-3 py-2 rounded-lg bg-flag-dim text-flag text-xs">
                    {connectionError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isConnecting || !customToken.trim()}
                  className="w-full py-2.5 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isConnecting ? 'Connecting to DTP SDK...' : 'Connect Live Twin'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Connected — Lane View & Patient Dashboard */
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
          {/* Patient Info Header */}
          <div className="card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center text-signal font-display font-bold text-lg">
                {twin?.name ? twin.name.charAt(0) : 'P'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display text-xl font-bold text-text-primary">
                    {twin?.name || 'Connected Patient'}
                  </h2>
                  {twin?.age ? (
                    <span className="text-xs text-text-muted font-mono">
                      ({twin.age}y / {twin.sex})
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-text-muted mt-0.5">
                  ID: <span className="font-mono text-text-primary">{twin?.id}</span> • {events.length} findings across {Object.keys(eventsBySystem).length} body systems
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* + Log a Finding Button */}
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-signal text-ink font-semibold text-xs hover:bg-signal/90 transition-all shadow-md shadow-signal/20"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Log Finding
              </button>

              <button
                onClick={reset}
                className="px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline text-text-muted text-xs hover:text-text-primary hover:border-signal/50 transition-colors"
              >
                Switch Patient
              </button>
            </div>
          </div>

          {/* System lanes */}
          <div className="card overflow-hidden">
            <SystemLanes eventsBySystem={eventsBySystem} />
          </div>

          {/* Event legend */}
          <div className="flex flex-wrap gap-4 text-xs text-text-muted px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
              Patient observation / finding
            </div>
          </div>

          {/* Run Constellation CTA */}
          <div className="flex justify-center pt-4">
            <button
              onClick={handleRunConstellation}
              disabled={isAnalyzing || events.length === 0}
              className="group relative px-8 py-4 rounded-2xl bg-signal text-ink font-display font-bold text-lg hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-signal/20 hover:shadow-signal/30"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-3">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Looking for patterns across all systems...
                </span>
              ) : (
                <span className="flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="12" cy="20" r="1.5" />
                    <line x1="12" y1="6" x2="12" y2="10" />
                    <line x1="6" y1="12" x2="10" y2="12" />
                    <line x1="14" y1="12" x2="18" y2="12" />
                    <line x1="12" y1="14" x2="12" y2="18" />
                  </svg>
                  Find What's Connected
                </span>
              )}

              {!isAnalyzing && (
                <span className="absolute inset-0 rounded-2xl border-2 border-signal/30 animate-ping opacity-20 pointer-events-none" />
              )}
            </button>
          </div>
        </div>
      )}

      {/* Log Finding Modal */}
      <LogFindingModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAddFinding={addFinding}
      />
    </div>
  );
}
