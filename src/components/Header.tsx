import { useTwin } from '../context/TwinContext';

export function Header() {
  const { isConnected, twin, reset } = useTwin();

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-signal/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="5" cy="12" r="1.5" />
              <circle cx="19" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
              <line x1="12" y1="7" x2="12" y2="10" />
              <line x1="7" y1="12" x2="10" y2="12" />
              <line x1="14" y1="12" x2="17" y2="12" />
              <line x1="12" y1="14" x2="12" y2="18" />
            </svg>
          </div>
          <h1 className="font-display text-base sm:text-lg font-semibold tracking-tight text-text-primary">
            Constellation
          </h1>
        </div>

        {isConnected && twin && (
          <div className="flex items-center gap-2.5 min-w-0 flex-shrink truncate">
            <div className="flex items-center gap-1.5 text-xs text-text-muted truncate">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse flex-shrink-0" />
              <span className="font-mono text-xs truncate max-w-[110px] sm:max-w-[180px] text-text-primary">
                {twin.name}
              </span>
            </div>
            <button
              onClick={reset}
              className="min-h-[44px] px-3 flex items-center justify-center text-xs text-text-muted hover:text-flag transition-colors rounded-lg hover:bg-flag-dim flex-shrink-0 active:scale-95"
              aria-label="Disconnect patient"
            >
              Disconnect
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
