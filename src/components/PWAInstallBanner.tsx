import { useEffect, useState } from 'react';

export function PWAInstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed
    if (localStorage.getItem('constellation-pwa-dismissed')) {
      setDismissed(true);
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('constellation-pwa-dismissed', 'true');
  };

  if (dismissed || !deferredPrompt) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 z-50 card flex items-center gap-3 shadow-lg shadow-ink/50"
      style={{ animation: 'card-enter 0.3s ease-out' }}
      role="banner"
    >
      <div className="w-10 h-10 rounded-lg bg-signal/20 flex items-center justify-center flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-signal)" strokeWidth="2" strokeLinecap="round">
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

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary">Install Constellation</p>
        <p className="text-xs text-text-muted">Add to your home screen for quick access</p>
      </div>

      <div className="flex gap-1 flex-shrink-0">
        <button
          onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg bg-signal text-ink text-xs font-semibold hover:bg-signal/90 transition-colors"
        >
          Install
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
          aria-label="Dismiss install prompt"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
