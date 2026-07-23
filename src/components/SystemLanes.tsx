import { useMemo, useRef, useEffect, useState } from 'react';
import { BODY_SYSTEM_META, type BodySystem } from '../lib/bodySystem';
import type { SystemEvent } from '../context/TwinContext';

type Props = {
  eventsBySystem: Record<string, SystemEvent[]>;
  highlightedEventIds?: Set<string>;
  markerPositions?: React.MutableRefObject<Map<string, { x: number; y: number }>>;
};

const LANE_HEIGHT = 52;
const LANE_PADDING_LEFT = 150;
const LANE_PADDING_RIGHT = 32;
const MARKER_RADIUS = 5;

export function SystemLanes({ eventsBySystem, highlightedEventIds, markerPositions }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(900);
  const [mounted, setMounted] = useState(false);

  // Get active systems (ones with events)
  const activeSystems = useMemo(() => {
    const allSystems = Object.keys(BODY_SYSTEM_META) as BodySystem[];
    return allSystems.filter(
      (sys) => eventsBySystem[sys] && eventsBySystem[sys].length > 0
    );
  }, [eventsBySystem]);

  const svgHeight = activeSystems.length * LANE_HEIGHT + 24;
  const laneWidth = containerWidth - LANE_PADDING_LEFT - LANE_PADDING_RIGHT;

  // Responsive width
  useEffect(() => {
    const el = svgRef.current?.parentElement;
    if (!el) return;
    const obs = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    obs.observe(el);
    setContainerWidth(el.clientWidth);
    return () => obs.disconnect();
  }, []);

  // Trigger mount animation
  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Calculate event positions within a lane
  const getEventX = (events: SystemEvent[], index: number): number => {
    if (events.length <= 1) return LANE_PADDING_LEFT + laneWidth / 2;
    const spacing = laneWidth / (events.length + 1);
    return LANE_PADDING_LEFT + spacing * (index + 1);
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width={containerWidth}
        height={svgHeight}
        viewBox={`0 0 ${containerWidth} ${svgHeight}`}
        className="min-w-[600px]"
        aria-label="Body system event lanes"
        role="img"
      >
        {/* SVG filter for glow effect */}
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {activeSystems.map((system, laneIndex) => {
          const meta = BODY_SYSTEM_META[system];
          const events = eventsBySystem[system] || [];
          const y = laneIndex * LANE_HEIGHT + 32;
          const animDelay = laneIndex * 0.06;

          return (
            <g key={system} role="group" aria-label={`${meta.label} system lane`}>
              {/* System label */}
              <text
                x={LANE_PADDING_LEFT - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-text-muted"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '12px',
                  fontWeight: 500,
                  opacity: mounted ? 1 : 0,
                  transition: `opacity 0.3s ease ${animDelay}s`,
                }}
              >
                {meta.label}
              </text>

              {/* Event count badge */}
              <text
                x={containerWidth - 12}
                y={y + 4}
                textAnchor="end"
                className="fill-text-muted"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '10px',
                  opacity: mounted ? 0.6 : 0,
                  transition: `opacity 0.4s ease ${animDelay + 0.2}s`,
                }}
              >
                {events.length}
              </text>

              {/* Lane line */}
              <line
                x1={LANE_PADDING_LEFT}
                y1={y}
                x2={LANE_PADDING_LEFT + laneWidth}
                y2={y}
                stroke="var(--color-hairline)"
                strokeWidth="1"
                strokeDasharray={mounted ? '0' : '1000'}
                strokeDashoffset={mounted ? '0' : '1000'}
                style={{
                  transition: `stroke-dashoffset 0.5s ease ${animDelay}s`,
                }}
              />

              {/* Event markers */}
              {events.map((evt, evtIndex) => {
                const cx = getEventX(events, evtIndex);
                const isHighlighted = highlightedEventIds?.has(evt.id);

                // Record position for thread animation
                if (markerPositions) {
                  markerPositions.current.set(evt.id, { x: cx, y });
                }

                return (
                  <g key={evt.id}>
                    {/* Highlight ring for matched findings */}
                    {isHighlighted && (
                      <circle
                        cx={cx}
                        cy={y}
                        r={MARKER_RADIUS + 4}
                        fill="none"
                        stroke="var(--color-signal)"
                        strokeWidth="1.5"
                        opacity="0.5"
                        filter="url(#glow)"
                      />
                    )}

                    {/* Main marker */}
                    <circle
                      cx={cx}
                      cy={y}
                      r={MARKER_RADIUS}
                      fill={isHighlighted ? 'var(--color-signal)' : 'var(--color-text-muted)'}
                      opacity={mounted ? 1 : 0}
                      data-event-id={evt.id}
                      data-hpo-id={evt.hpoMapping?.hpoId || ''}
                      style={{
                        transition: `opacity 0.3s ease ${animDelay + 0.1 + evtIndex * 0.05}s`,
                        cursor: 'pointer',
                      }}
                      role="button"
                      aria-label={`${evt.data.display}${evt.hpoMapping ? ` (${evt.hpoMapping.hpoId})` : ''}`}
                    />

                    {/* Tooltip — show on hover via CSS */}
                    <g
                      className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                      style={{ pointerEvents: 'none' }}
                    >
                      <rect
                        x={cx - 80}
                        y={y - 32}
                        width="160"
                        height="22"
                        rx="4"
                        fill="var(--color-surface-raised)"
                        stroke="var(--color-hairline)"
                        strokeWidth="0.5"
                      />
                      <text
                        x={cx}
                        y={y - 17}
                        textAnchor="middle"
                        fill="var(--color-text-primary)"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: '9px' }}
                      >
                        {evt.hpoMapping ? `${evt.hpoMapping.hpoId} — ${evt.hpoMapping.hpoLabel}` : evt.data.display}
                      </text>
                    </g>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
