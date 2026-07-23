import { useState, useEffect } from 'react';
import { BODY_SYSTEM_META, type BodySystem } from '../lib/bodySystem';
import type { ScoredCondition } from '../lib/scoring';
import { createDTP, type PhenotypeMatchResponse } from '../lib/ontomorph';

type Props = {
  result: ScoredCondition;
};

export function PhenotypeRadar({ result }: Props) {
  const { condition, matchedFindings, systemCoverage } = result;
  const [phenotypeData, setPhenotypeData] = useState<PhenotypeMatchResponse | null>(null);
  const [activeTooltip, setActiveTooltip] = useState<{ system: string; findingName: string } | null>(null);

  // Active body systems with patient findings (Dynamic Axis Count)
  const activeSystems = (Object.keys(systemCoverage) as BodySystem[]).filter(
    (sys) => systemCoverage[sys] > 0
  );

  const numAxes = Math.max(activeSystems.length, 3); // Minimum 3 axes for valid polygon

  useEffect(() => {
    const dtp = createDTP();
    const fetchPhenotypeMatch = async () => {
      // Map HPO IDs to concept numbers for API
      const termsA = matchedFindings.map((f) => parseInt(f.hpoId.replace('HP:', ''), 10)).filter((n) => !isNaN(n));
      const termsB = condition.phenotypeProfile.map((p) => parseInt(p.hpoId.replace('HP:', ''), 10)).filter((n) => !isNaN(n));

      const response = await dtp.holon.phenotype.match(termsA, termsB);
      setPhenotypeData(response);
    };
    fetchPhenotypeMatch();
  }, [condition, matchedFindings]);

  // Radar geometry calculations
  const center = 140;
  const radius = 90;

  const getCoordinates = (index: number, valueRatio: number) => {
    const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
    const x = center + radius * valueRatio * Math.cos(angle);
    const y = center + radius * valueRatio * Math.sin(angle);
    return { x, y };
  };

  // Generate polygon points
  const patientPoints = activeSystems.map((sys, i) => {
    const coverage = systemCoverage[sys] || 0.4;
    const { x, y } = getCoordinates(i, coverage);
    return `${x},${y}`;
  }).join(' ');

  const candidatePoints = activeSystems.map((_, i) => {
    const { x, y } = getCoordinates(i, 0.95);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card p-4 sm:p-6 space-y-4 border border-hairline relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-semibold text-base text-text-primary">
            Phenotype Fingerprint Comparison
          </h3>
          <p className="text-xs text-text-muted">
            {activeSystems.length}-Axis Organ Alignment • HOLON Match Score: {phenotypeData ? Math.round(phenotypeData.normalizedScore * 100) : '--'}%
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-signal" />
            <span className="text-text-primary font-medium">Patient</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-dashed border-text-muted" />
            <span className="text-text-muted">Target Profile</span>
          </div>
        </div>
      </div>

      {/* SVG Radar Chart Container */}
      <div className="flex justify-center items-center py-2 relative">
        <svg width="280" height="280" viewBox="0 0 280 280" className="overflow-visible">
          {/* Background Concentric Circles */}
          {[0.25, 0.5, 0.75, 1].map((level) => (
            <circle
              key={level}
              cx={center}
              cy={center}
              r={radius * level}
              fill="none"
              stroke="var(--color-hairline)"
              strokeWidth="1"
              strokeDasharray={level === 1 ? 'none' : '3 3'}
              opacity="0.4"
            />
          ))}

          {/* Axes Lines */}
          {activeSystems.map((sys, i) => {
            const { x, y } = getCoordinates(i, 1);
            return (
              <line
                key={`axis-${sys}`}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth="1.2"
                opacity="0.6"
              />
            );
          })}

          {/* Candidate Reference Polygon */}
          <polygon
            points={candidatePoints}
            fill="none"
            stroke="var(--color-text-muted)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            opacity="0.6"
          />

          {/* Patient Fingerprint Polygon */}
          <polygon
            points={patientPoints}
            fill="var(--color-signal-glow)"
            stroke="var(--color-signal)"
            strokeWidth="2"
            opacity="0.9"
            className="transition-all duration-500"
          />

          {/* Axis Vertices & Labels */}
          {activeSystems.map((sys, i) => {
            const coverage = systemCoverage[sys] || 0.4;
            const pt = getCoordinates(i, coverage);
            const labelPt = getCoordinates(i, 1.2);
            const meta = BODY_SYSTEM_META[sys];
            const matchedFinding = matchedFindings.find((f) => f.system === sys);

            return (
              <g key={`vertex-${sys}`}>
                {/* Vertex Circle */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="var(--color-signal)"
                  stroke="var(--color-ink)"
                  strokeWidth="2"
                  className="cursor-pointer hover:scale-125 transition-transform"
                  onMouseEnter={() =>
                    setActiveTooltip({
                      system: meta?.label || sys,
                      findingName: matchedFinding ? matchedFinding.label : 'Active observation',
                    })
                  }
                  onMouseLeave={() => setActiveTooltip(null)}
                  onClick={() =>
                    setActiveTooltip({
                      system: meta?.label || sys,
                      findingName: matchedFinding ? matchedFinding.label : 'Active observation',
                    })
                  }
                />

                {/* System Label */}
                <text
                  x={labelPt.x}
                  y={labelPt.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--color-text-primary)"
                  style={{ fontFamily: 'var(--font-body)', fontSize: '10px', fontWeight: 600 }}
                >
                  {meta?.label || sys}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover/Tap Tooltip Overlay */}
        {activeTooltip && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-surface-raised border border-hairline shadow-lg text-xs z-10 text-center animate-fade-in">
            <span className="font-semibold text-signal">{activeTooltip.system}:</span>{' '}
            <span className="text-text-primary">{activeTooltip.findingName}</span>
          </div>
        )}
      </div>

      <p className="text-[11px] text-text-muted text-center">
        Hover or tap vertices to view specific HOLON phenotype matches per organ system.
      </p>
    </div>
  );
}
