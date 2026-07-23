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

  const result = differentialResults[0]; // top match

  // Start streaming on mount
  useEffect(() => {
    if (!isStreaming) {
      startStream();
    }
    return () => {
      stopStream();
    };
  }, []);

  // Re-score when new events arrive
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
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-text-muted">Run an analysis first to see live updates.</p>
          <button onClick={() => onNavigate('home')} className="text-signal text-sm hover:underline">
            ← Back to Overview
          </button>
        </div>
      </div>
    );
  }

  const { condition, score, matchedFindings } = result;

  return (
    <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Back */}
      <button
        onClick={() => onNavigate('results')}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-signal transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to results
      </button>

      {/* Live status bar */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-signal animate-pulse' : 'bg-flag'}`} />
          <span className="font-display font-semibold text-sm">
            {isStreaming ? 'Watching for New Data' : 'Paused'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-text-muted">
          <span className="font-mono">{events.length} events</span>
          <button
            onClick={isStreaming ? stopStream : startStream}
            className="px-3 py-1 rounded-lg bg-surface-raised border border-hairline hover:border-signal/50 transition-colors"
          >
            {isStreaming ? 'Pause' : 'Resume'}
          </button>
        </div>
      </div>

      {/* Score with pulse effect on update */}
      <div
        className={`card flex items-center gap-5 transition-all ${pulseActive ? 'ring-2 ring-signal/50' : ''}`}
      >
        <ScoreGauge score={score} size={80} strokeWidth={5} label="match" />
        <div className="flex-1">
          <h2 className="font-display text-xl font-bold text-text-primary">{condition.name}</h2>
          <p className="text-sm text-text-muted mt-1">
            {matchedFindings.length} of {condition.phenotypeProfile.length} known symptoms found
          </p>
          {pulseActive && (
            <p className="text-xs text-signal mt-2" style={{ animation: 'fade-in 0.3s ease-out' }}>
              ● New data just came in — score updated
            </p>
          )}
        </div>
      </div>

      {/* Reasoning trace */}
      <ReasoningTrace result={result} />

      {/* Monitoring plan */}
      <div className="card">
        <MonitoringPlan
          condition={condition}
          patientAge={twin?.age}
          patientSex={twin?.sex}
        />
      </div>
    </div>
  );
}
