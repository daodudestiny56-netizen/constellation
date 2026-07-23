import { useMemo, useRef } from 'react';
import { useTwin } from '../context/TwinContext';
import { SystemLanes } from '../components/SystemLanes';
import { DifferentialCard } from '../components/DifferentialCard';

type Props = {
  onNavigate: (route: string) => void;
};

export function Results({ onNavigate }: Props) {
  const { differentialResults, eventsBySystem, analysisComplete } = useTwin();
  const markerPositions = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Top 3 results
  const topResults = differentialResults.slice(0, 3);

  // Highlighted event IDs (from top match)
  const highlightedEventIds = useMemo(() => {
    const ids = new Set<string>();
    if (topResults.length > 0) {
      for (const finding of topResults[0].matchedFindings) {
        if (finding.sourceEventId) ids.add(finding.sourceEventId);
      }
    }
    return ids;
  }, [topResults]);

  if (!analysisComplete || differentialResults.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-text-muted">No results yet. Run an analysis first.</p>
          <button
            onClick={() => onNavigate('home')}
            className="text-signal text-sm hover:underline"
          >
            ← Back to Patient Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <button
        onClick={() => onNavigate('home')}
        className="flex items-center gap-1.5 text-sm text-text-muted hover:text-signal transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
        Back to overview
      </button>

      {/* System lanes with highlighted matches */}
      <div className="card overflow-hidden relative">
        <div className="flex items-center gap-2 mb-3 px-1">
          <h3 className="font-display text-sm font-semibold text-text-muted">Connected Findings</h3>
          <div className="flex-1 h-px bg-hairline" />
          <span className="text-xs text-signal font-mono">{highlightedEventIds.size} findings linked</span>
        </div>
        <SystemLanes
          eventsBySystem={eventsBySystem}
          highlightedEventIds={highlightedEventIds}
          markerPositions={markerPositions}
        />
        <div className="flex flex-wrap gap-4 text-xs text-text-muted mt-3 px-1 border-t border-hairline/40 pt-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-signal" />
            Matched finding signal
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-text-muted" />
            Other patient observation
          </div>
        </div>
      </div>

      {/* Results header */}
      <div>
        <h2 className="font-display text-xl font-semibold">Possible Conditions</h2>
        <p className="text-sm text-text-muted mt-0.5">
          Ranked by how well the patient's symptoms match each condition across {Object.keys(eventsBySystem).length} body systems
        </p>
      </div>

      {/* Differential cards */}
      <div className="space-y-3">
        {topResults.map((result, i) => (
          <DifferentialCard
            key={result.condition.id}
            result={result}
            rank={i + 1}
            animationDelay={i * 0.15}
            onClick={() => onNavigate(`match/${i}`)}
          />
        ))}
      </div>

      {/* Additional matches (collapsed) */}
      {differentialResults.length > 3 && (
        <div className="card-raised opacity-50">
          <p className="text-xs text-text-muted text-center">
            {differentialResults.length - 3} more conditions scored lower
          </p>
        </div>
      )}

      <div className="text-xs text-text-muted/60 text-center py-4 border-t border-hairline">
        How it works: we check how many of each condition's known symptoms appear in this patient.
        More common symptoms count more toward the score.
      </div>
    </div>
  );
}
