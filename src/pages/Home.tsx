import { useState } from 'react';
import { useTwin } from '../context/TwinContext';
import { SystemLanes } from '../components/SystemLanes';
import { LogFindingModal } from '../components/LogFindingModal';
import { AddPatientModal } from '../components/AddPatientModal';
import { type DemoPatient, getAllPatients, saveCustomPatient, deletePatient } from '../lib/ontomorph';

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

  const [patients, setPatients] = useState<DemoPatient[]>(() => getAllPatients());
  const [customToken, setCustomToken] = useState('');
  const [showCustomToken, setShowCustomToken] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'system' | 'date'>('system');

  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const handleSelectPatient = async (patientId: string) => {
    await connect(patientId);
  };

  const handleAddPatient = async (newPatient: DemoPatient) => {
    saveCustomPatient(newPatient);
    setPatients(getAllPatients());
    await connect(newPatient.id);
  };

  const handleDeletePatient = (patientId: string, patientName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to remove ${patientName}'s dashboard?`)) {
      deletePatient(patientId);
      setPatients(getAllPatients());
    }
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
    <div className="flex-1 flex flex-col pb-[env(safe-area-inset-bottom)]">
      {!isConnected ? (
        <div className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
          {/* Header & Branding */}
          <div className="text-center space-y-2.5 max-w-xl mx-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 mx-auto rounded-2xl bg-signal/10 border border-signal/20 flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="1.5" strokeLinecap="round">
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
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">
              Constellation
            </h2>
            <p className="text-text-muted text-xs sm:text-sm leading-relaxed">
              Cross-system clinical intelligence. Select a patient dashboard or register a new twin to uncover hidden patterns spanning separate body systems.
            </p>
          </div>

          {/* Patient Dashboards */}
          <div className="space-y-3.5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-display font-semibold text-sm sm:text-base text-text-primary">
                Select Patient Dashboard
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-[11px] sm:text-xs text-text-muted hidden sm:inline">
                  {patients.length} Patient Twins
                </span>
                <button
                  onClick={() => setIsAddPatientOpen(true)}
                  className="min-h-[40px] px-3.5 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 transition-all flex items-center gap-1.5 shadow-md shadow-signal/20 active:scale-95 cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add Patient
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
              {patients.map((patient: DemoPatient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient.id)}
                  disabled={isConnecting}
                  className="card text-left p-4 sm:p-5 hover:bg-surface-raised transition-all cursor-pointer border border-hairline hover:border-signal/50 group flex flex-col justify-between active:scale-[0.99]"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-display font-semibold text-base sm:text-lg text-text-primary group-hover:text-signal transition-colors">
                          {patient.name}
                        </h4>
                        <p className="text-xs text-text-muted font-mono mt-0.5">
                          {patient.age}y / {patient.sex} • ID: {patient.id}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-signal-dim text-signal border border-signal/20">
                          {patient.expectedTopMatch}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeletePatient(patient.id, patient.name, e)}
                          className="p-1.5 rounded-lg text-text-muted/60 hover:text-flag hover:bg-flag-dim/40 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer active:scale-95"
                          title={`Delete ${patient.name}`}
                          aria-label={`Delete ${patient.name}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
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

                  <div className="mt-3.5 pt-2.5 border-t border-hairline/50 flex items-center justify-between text-xs text-signal font-medium group-hover:translate-x-0.5 transition-transform min-h-[44px]">
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
          <div className="pt-3 border-t border-hairline space-y-3">
            <button
              onClick={() => setShowCustomToken(!showCustomToken)}
              className="min-h-[44px] flex items-center justify-center gap-2 text-xs text-text-muted hover:text-signal transition-colors mx-auto px-4 cursor-pointer"
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
                  className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-surface border border-hairline text-text-primary font-mono text-xs placeholder:text-text-muted/50 focus:border-signal focus:ring-1 focus:ring-signal transition-colors"
                />

                {connectionError && (
                  <div className="px-3 py-2 rounded-lg bg-flag-dim text-flag text-xs">
                    {connectionError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isConnecting || !customToken.trim()}
                  className="w-full min-h-[44px] py-2.5 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {isConnecting ? 'Connecting to DTP SDK...' : 'Connect Live Twin'}
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* Connected — Lane View & Patient Dashboard */
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
          {/* Patient Info Header */}
          <div className="card p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-signal/10 border border-signal/20 flex items-center justify-center text-signal font-display font-bold text-base sm:text-lg flex-shrink-0">
                {twin?.name ? twin.name.charAt(0) : 'P'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <h2 className="font-display text-lg sm:text-xl font-bold text-text-primary truncate">
                    {twin?.name || 'Connected Patient'}
                  </h2>
                  {twin?.age ? (
                    <span className="text-xs text-text-muted font-mono">
                      ({twin.age}y / {twin.sex})
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-text-muted mt-0.5 truncate">
                  ID: <span className="font-mono text-text-primary">{twin?.id}</span> • {events.length} findings across {Object.keys(eventsBySystem).length} systems
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline/40">
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="hidden sm:flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 transition-all shadow-md shadow-signal/20 active:scale-95 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Log Finding
              </button>

              <button
                onClick={reset}
                className="min-h-[44px] px-3.5 py-2 rounded-xl bg-surface-raised border border-hairline text-text-muted text-xs hover:text-text-primary hover:border-signal/50 transition-colors active:scale-95 cursor-pointer"
              >
                Switch Patient
              </button>
            </div>
          </div>

          {/* View Toggle (By System / By Date) */}
          {events.length > 0 && (
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1 p-1 rounded-xl bg-surface-raised border border-hairline text-xs">
                <button
                  onClick={() => setViewMode('system')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] ${
                    viewMode === 'system' ? 'bg-signal text-ink shadow-sm' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  By System (Lanes)
                </button>
                <button
                  onClick={() => setViewMode('date')}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors min-h-[36px] ${
                    viewMode === 'date' ? 'bg-signal text-ink shadow-sm' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  By Date (Timeline)
                </button>
              </div>
              <span className="text-xs text-text-muted font-mono">{events.length} observations</span>
            </div>
          )}

          {/* System lanes or Empty state or Date Timeline */}
          {events.length === 0 ? (
            <div className="card p-6 sm:p-8 text-center space-y-4 border border-dashed border-hairline/80 bg-surface/40">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-signal/10 text-signal flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h3 className="font-display font-semibold text-base text-text-primary">No clinical findings logged yet</h3>
                <p className="text-xs text-text-muted leading-relaxed">
                  This patient twin starts clean. Log findings live across body systems using the HOLON search to build the clinical pattern.
                </p>
              </div>
              <button
                onClick={() => setIsLogModalOpen(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-signal text-ink font-semibold text-xs hover:bg-signal/90 transition-all shadow-md shadow-signal/20 active:scale-95 cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Log First Finding
              </button>
            </div>
          ) : viewMode === 'system' ? (
            <div className="card p-3 sm:p-5 overflow-hidden">
              <SystemLanes eventsBySystem={eventsBySystem} />
            </div>
          ) : (
            /* Reverse-chronological timeline list */
            <div className="card p-4 sm:p-6 space-y-3">
              <h3 className="font-display font-semibold text-sm text-text-primary mb-2">
                Chronological Finding Log (Most Recent First)
              </h3>
              <div className="space-y-2.5">
                {sortedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3.5 rounded-xl bg-surface-raised border border-hairline/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-signal/15 text-signal uppercase tracking-wider">
                          {evt.system}
                        </span>
                        <span className="font-mono text-text-muted text-[11px]">
                          {evt.timestamp ? new Date(evt.timestamp).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                      <p className="font-medium text-text-primary">{evt.data.display}</p>
                    </div>
                    {evt.data.code && (
                      <span className="font-mono text-[10px] text-text-muted bg-surface px-2 py-1 rounded border border-hairline self-start sm:self-center">
                        {evt.data.vocabulary || 'ICD-10'}: {evt.data.code}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Event legend */}
          {events.length > 0 && (
            <div className="flex flex-wrap gap-4 text-xs text-text-muted px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
                Patient observation / finding
              </div>
            </div>
          )}

          {/* Run Constellation CTA */}
          <div className="flex flex-col items-center pt-2 sm:pt-4 space-y-2">
            <button
              onClick={handleRunConstellation}
              disabled={isAnalyzing || events.length === 0}
              className="w-full sm:w-auto group relative px-6 sm:px-8 min-h-[52px] py-3.5 rounded-2xl bg-signal text-ink font-display font-bold text-base sm:text-lg hover:bg-signal/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-signal/20 hover:shadow-signal/30 active:scale-95 flex items-center justify-center cursor-pointer"
            >
              {isAnalyzing ? (
                <span className="flex items-center gap-2.5">
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Analyzing patterns...
                </span>
              ) : (
                <span className="flex items-center gap-2.5">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="2" />
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="5" cy="12" r="1.5" />
                    <circle cx="19" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                    <line x1="12" y1="6" x2="12" y2="10" />
                    <line x1="7" y1="12" x2="10" y2="12" />
                    <line x1="14" y1="12" x2="17" y2="12" />
                    <line x1="12" y1="14" x2="12" y2="18" />
                  </svg>
                  Find What's Connected
                </span>
              )}

              {!isAnalyzing && events.length > 0 && (
                <span className="absolute inset-0 rounded-2xl border-2 border-signal/30 animate-ping opacity-20 pointer-events-none" />
              )}
            </button>

            {events.length === 0 && (
              <p className="text-center text-xs text-text-muted/60 font-mono">
                Log at least one finding to run pattern matching
              </p>
            )}
          </div>

          {/* Mobile Floating Action Button (FAB) for + Log Finding */}
          <button
            onClick={() => setIsLogModalOpen(true)}
            className="sm:hidden fixed bottom-6 right-4 z-40 w-14 h-14 rounded-full bg-signal text-ink shadow-2xl shadow-signal/40 flex items-center justify-center active:scale-95 border-2 border-ink cursor-pointer"
            aria-label="Log clinical finding"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>
        </div>
      )}

      {/* Log Finding Modal */}
      <LogFindingModal
        isOpen={isLogModalOpen}
        onClose={() => setIsLogModalOpen(false)}
        onAddFinding={addFinding}
      />

      {/* Add Patient Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onAddPatient={handleAddPatient}
      />
    </div>
  );
}
