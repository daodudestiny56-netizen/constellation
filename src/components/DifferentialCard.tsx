import { ScoreGauge } from './ScoreGauge';
import { BODY_SYSTEM_META, type BodySystem } from '../lib/bodySystem';
import type { ScoredCondition } from '../lib/scoring';

type Props = {
  result: ScoredCondition;
  rank: number;
  onClick?: () => void;
  animationDelay?: number;
};

export function DifferentialCard({ result, rank, onClick, animationDelay = 0 }: Props) {
  const { condition, score, matchedFindings, systemCoverage } = result;

  // Count findings per system
  const findingsBySystem: Record<string, number> = {};
  for (const f of matchedFindings) {
    findingsBySystem[f.system] = (findingsBySystem[f.system] || 0) + 1;
  }

  return (
    <button
      onClick={onClick}
      className="card w-full text-left p-4 sm:p-5 hover:bg-surface-raised transition-colors cursor-pointer group active:scale-[0.99]"
      style={{
        animation: `card-enter 0.4s ease-out ${animationDelay}s both`,
      }}
      aria-label={`${condition.name} — ${Math.round(score * 100)}% match`}
    >
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Rank badge */}
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-ink flex items-center justify-center border border-hairline mt-0.5">
          <span className="font-mono text-xs text-text-muted">{rank}</span>
        </div>

        {/* Score gauge */}
        <div className="flex-shrink-0">
          <ScoreGauge score={score} size={52} strokeWidth={4} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1 flex-wrap">
            <h3 className="font-display font-semibold text-base text-text-primary group-hover:text-signal transition-colors truncate">
              {condition.name}
            </h3>
            <span className="font-mono text-xs text-text-muted flex-shrink-0">{condition.id}</span>
          </div>

          <p className="text-xs sm:text-sm text-text-muted mb-3 line-clamp-2 leading-relaxed">
            {condition.description}
          </p>

          {/* System coverage dots */}
          <div className="flex flex-wrap gap-2">
            {condition.systems.map((sys) => {
              const meta = BODY_SYSTEM_META[sys as BodySystem];
              const count = findingsBySystem[sys] || 0;
              const hasMatch = systemCoverage[sys] > 0;

              return (
                <div
                  key={sys}
                  className="flex items-center gap-1.5 text-xs bg-surface-raised/40 px-2 py-0.5 rounded-full border border-hairline/30"
                  title={`${meta?.label}: ${count} symptom(s) found`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${hasMatch ? 'bg-signal' : 'bg-text-muted/40'}`}
                  />
                  <span className={hasMatch ? 'text-text-primary font-medium' : 'text-text-muted'}>
                    {meta?.label}
                  </span>
                  {count > 0 && (
                    <span className="font-mono text-signal font-semibold">{count}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Arrow */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          className="text-text-muted group-hover:text-signal transition-colors flex-shrink-0 mt-1 hidden sm:block"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}
