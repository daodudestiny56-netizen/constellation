import { useTwin } from '../context/TwinContext';

type Props = {
  onNavigate?: (route: string) => void;
};

export function Header({ onNavigate }: Props) {
  const { isConnected, twin, reset } = useTwin();

  const handleLogoClick = () => {
    if (onNavigate) {
      onNavigate('landing');
    } else {
      window.location.hash = '#/';
    }
  };

  const handleAppClick = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.hash = '#/app';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-ink/90 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
        <button
          onClick={handleLogoClick}
          className="flex items-center gap-2.5 flex-shrink-0 cursor-pointer group text-left"
        >
          <div className="w-8 h-8 rounded-lg bg-signal/20 flex items-center justify-center group-hover:scale-105 transition-transform">
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
          <h1 className="font-display text-base sm:text-lg font-semibold tracking-tight text-text-primary group-hover:text-signal transition-colors">
            Constellation
          </h1>
        </button>

        {isConnected && twin ? (
          <div className="flex items-center gap-2.5 min-w-0 flex-shrink truncate">
            <div className="flex items-center gap-1.5 text-xs text-text-muted truncate">
              <span className="w-2 h-2 rounded-full bg-signal animate-pulse flex-shrink-0" />
              <span className="font-mono text-xs truncate max-w-[110px] sm:max-w-[180px] text-text-primary">
                {twin.name}
              </span>
            </div>
            <button
              onClick={reset}
              className="min-h-[44px] px-3 flex items-center justify-center text-xs text-text-muted hover:text-flag transition-colors rounded-lg hover:bg-flag-dim flex-shrink-0 active:scale-95 cursor-pointer"
              aria-label="Disconnect patient"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={handleAppClick}
            className="min-h-[38px] px-3.5 rounded-xl bg-signal/15 text-signal font-semibold text-xs hover:bg-signal/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Launch Clinical App</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </header>
  );
}
