type Props = {
  score: number; // 0–1
  size?: number;
  strokeWidth?: number;
  label?: string;
};

export function ScoreGauge({ score, size = 72, strokeWidth = 5, label }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score);
  const percentage = Math.round(score * 100);

  // Color based on score
  const getColor = () => {
    if (score >= 0.7) return 'var(--color-signal)';
    if (score >= 0.4) return 'var(--color-flag)';
    return 'var(--color-text-muted)';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-hairline)"
          strokeWidth={strokeWidth}
        />
        {/* Score arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out, stroke 0.3s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none"
          style={{ fontSize: size * 0.28, color: getColor() }}
        >
          {percentage}%
        </span>
        {label && (
          <span className="text-text-muted mt-0.5" style={{ fontSize: size * 0.12 }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
