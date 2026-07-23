
import { useTwin } from '../context/TwinContext';

export function Header() {
  const { isConnected, twin, reset } = useTwin();

  return (
    <header className="sticky top-0 z-50 bg-ink/80 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
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
              <line x1="12" y1="14" x2="12" y2="17" />
            </svg>
          </div>
          <h1 className="font-display text-lg font-semibold tracking-tight text-text-primary">
            Constellation
          </h1>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-3">
          {isConnected && twin && (
            <>
              <div className="hidden sm:flex items-center gap-2 text-sm text-text-muted">
                <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                <span className="font-mono text-xs">{twin.name}</span>
              </div>
              <button
                onClick={reset}
                className="text-xs text-text-muted hover:text-flag transition-colors px-2 py-1 rounded hover:bg-flag-dim"
              >
                Disconnect
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
