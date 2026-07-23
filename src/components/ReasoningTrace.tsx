import { BODY_SYSTEM_META, type BodySystem } from '../lib/bodySystem';
import type { ScoredCondition } from '../lib/scoring';

type Props = {
  result: ScoredCondition;
};

export function ReasoningTrace({ result }: Props) {
  const { condition, matchedFindings, unmatchedExpected, score } = result;

  // Group matched findings by system
  const findingsBySystem: Record<string, typeof matchedFindings> = {};
  for (const f of matchedFindings) {
    if (!findingsBySystem[f.system]) findingsBySystem[f.system] = [];
    findingsBySystem[f.system].push(f);
  }

  // Get unmatched labels from condition profile
  const unmatchedLabels = condition.phenotypeProfile
    .filter((p) => unmatchedExpected.includes(p.hpoId))
    .map((p) => ({ hpoId: p.hpoId, label: p.label, frequency: p.frequency }));

  return (
    <div className="space-y-4">
      {/* Score explanation */}
      <div className="card-raised">
        <div className="flex items-center gap-2 mb-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="2" strokeLinecap="round">
            <path d="M9 12l2 2 4-4" />
            <circle cx="12" cy="12" r="10" />
          </svg>
          <h4 className="font-display font-semibold text-sm text-signal">How We Calculated This</h4>
        </div>
        <p className="text-sm text-text-muted leading-relaxed">
          We looked at the known symptoms of <span className="text-text-primary font-medium">{condition.name}</span> and
          checked how many appear in this patient's records.
          This patient has <span className="text-signal font-mono">{matchedFindings.length}</span> out of{' '}
          <span className="font-mono text-text-primary">{condition.phenotypeProfile.length}</span> known
          symptoms ({Math.round(score * 100)}% match).
        </p>
      </div>

      {/* Matched findings by system */}
      <div>
        <h4 className="font-display font-semibold text-sm text-text-primary mb-3">
          What We Found
        </h4>
        <div className="space-y-2">
          {Object.entries(findingsBySystem).map(([system, findings]) => {
            const meta = BODY_SYSTEM_META[system as BodySystem];
            return (
              <div key={system} className="card-raised">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: meta?.color }}
                  />
                  <span className="text-sm font-medium text-text-primary">{meta?.label}</span>
                  <span className="font-mono text-xs text-signal">{findings.length}</span>
                </div>
                <div className="space-y-1.5 ml-5">
                  {findings.map((f, i) => (
                    <div key={`${f.hpoId}-${i}`} className="flex items-baseline gap-2">
                      <span className="font-mono text-xs text-signal">{f.hpoId}</span>
                      <span className="text-sm text-text-primary">{f.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unmatched expected phenotypes */}
      {unmatchedLabels.length > 0 && (
        <div>
          <h4 className="font-display font-semibold text-sm text-text-muted mb-3">
            Symptoms We Didn't See
          </h4>
          <div className="card-raised opacity-60">
            <div className="space-y-1.5">
              {unmatchedLabels.map((u) => (
                <div key={u.hpoId} className="flex items-baseline gap-2">
                  <span className="font-mono text-xs text-text-muted">{u.hpoId}</span>
                  <span className="text-sm text-text-muted">{u.label}</span>
                  <span className="text-xs text-text-muted/50 font-mono">({u.frequency.replace('_', ' ')})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
