import { useEffect, useState } from 'react';
import { useTwin } from '../context/TwinContext';
import { ScoreGauge } from '../components/ScoreGauge';
import { ReasoningTrace } from '../components/ReasoningTrace';
import { MonitoringPlan } from '../components/MonitoringPlan';

type Props = {
  onNavigate: (route: string) => void;
};

export function LiveView({ onNavigate }: Props) {
  const {
    differentialResults, twin, events,
    isStreaming, startStream, stopStream,
    runConstellation,
  } = useTwin();

  const [lastEventCount, setLastEventCount] = useState(events.length);
  const [pulseActive, setPulseActive] = useState(false);

  const result = differentialResults[0];

  useEffect(() => {
    if (!isStreaming) {
      startStream();
    }
    return () => {
      stopStream();
    };
  }, []);

  useEffect(() => {
    if (events.length > lastEventCount) {
      setLastEventCount(events.length);
      setPulseActive(true);
      runConstellation();
      const timer = setTimeout(() => setPulseActive(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [events.length, lastEventCount, runConstellation]);

  if (!result) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <p className="text-text-muted text-sm">Run an analysis first to see live updates.</p>
          <button onClick={() => onNavigate('home')} className="min-h-[44px] px-4 text-signal text-sm hover:underline">
            ← Back to Overview
          </button>
        </div>
      </div>
    );
  }

  const { condition, score, matchedFindings } = result;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 space-y-6 pb-[env(safe-area-inset-bottom)]">
      {/* Back */}
      <button
        onClick={() => onNavigate('results')}
        className="min-h-[44px] inline-flex items-center gap-1.5 text-xs sm:text-sm text-text-muted hover:text-signal transition-colors active:scale-95"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to results
      </button>

      {/* Live status bar */}
      <div className="card p-3.5 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-3 h-3 rounded-full flex-shrink-0 ${isStreaming ? 'bg-signal animate-pulse' : 'bg-flag'}`} />
          <span className="font-display font-semibold text-xs sm:text-sm">
            {isStreaming ? 'Watching for New Data' : 'Paused'}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="font-mono">{events.length} events</span>
          <button
            onClick={isStreaming ? stopStream : startStream}
            className="min-h-[44px] px-3.5 flex items-center justify-center rounded-xl bg-surface-raised border border-hairline hover:border-signal/50 transition-colors font-medium active:scale-95"
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Score card */}
      <div
        className={`card p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left transition-all ${
          pulseActive ? 'ring-2 ring-signal/50' : ''
        }`}
      >
        <ScoreGauge score={score} size={76} strokeWidth={5} label="match" />
        <div className="flex-1 min-w-0">
          <h2 className="font-display text-xl sm:text-2xl font-bold text-text-primary">{condition.name}</h2>
          <p className="text-xs sm:text-sm text-text-muted mt-1">
            {matchedFindings.length} of {condition.phenotypeProfile.length} known symptoms found
          </p>
          {pulseActive && (
            <p className="text-xs text-signal mt-2 font-medium" style={{ animation: 'fade-in 0.3s ease-out' }}>
              ● New data just came in — score updated
            </p>
          )}
        </div>
      </div>

      {/* Reasoning trace */}
      <ReasoningTrace result={result} />

      {/* Monitoring plan */}
      <div className="card p-4 sm:p-6">
        <MonitoringPlan
          condition={condition}
          patientAge={twin?.age}
          patientSex={twin?.sex}
        />
      </div>
    </div>
  );
}
