import { useEffect, useState } from 'react';
import type { PhenotypeMatch } from '../lib/scoring';

type Props = {
  matchedFindings: PhenotypeMatch[];
  markerPositions: Map<string, { x: number; y: number }>;
  targetY: number;
  targetX: number;
  active: boolean;
  onComplete?: () => void;
};

export function ThreadAnimation({ matchedFindings, markerPositions, targetY, targetX, active, onComplete }: Props) {
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (active) {
      const timer = setTimeout(() => {
        setDrawn(true);
        onComplete?.();
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setDrawn(false);
    }
  }, [active, onComplete]);

  if (!active || matchedFindings.length === 0) return null;

  return (
    <svg
      className="hidden sm:block absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 10 }}
      aria-hidden="true"
    >
      <defs>
        <filter id="thread-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {matchedFindings.map((finding, i) => {
        const pos = markerPositions.get(finding.sourceEventId || '');
        if (!pos) return null;

        const startX = pos.x;
        const startY = pos.y;
        const endX = targetX;
        const endY = targetY;

        // Curved path from marker to target
        const midX = (startX + endX) / 2;
        const cp1X = startX + (midX - startX) * 0.4;
        const cp1Y = startY;
        const cp2X = endX - (endX - midX) * 0.4;
        const cp2Y = endY;

        const pathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

        // Approximate path length for dash animation
        const pathLength = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) * 1.4;

        return (
          <path
            key={`thread-${finding.hpoId}-${i}`}
            d={pathD}
            fill="none"
            stroke="var(--color-signal)"
            strokeWidth="1.5"
            strokeDasharray={pathLength}
            strokeDashoffset={drawn ? 0 : pathLength}
            opacity={drawn ? 0.8 : 0}
            filter="url(#thread-glow)"
            style={{
              transition: `stroke-dashoffset 0.7s ease-out ${i * 0.08}s, opacity 0.3s ease ${i * 0.04}s`,
            }}
          />
        );
      })}
    </svg>
  );
}
