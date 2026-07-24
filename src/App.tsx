import { useState, useCallback } from 'react';
import { TwinProvider } from './context/TwinContext';
import { Header } from './components/Header';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { Results } from './pages/Results';
import { MatchDetail } from './pages/MatchDetail';
import { LiveView } from './pages/LiveView';

type Route =
  | { page: 'landing' }
  | { page: 'home' }
  | { page: 'results' }
  | { page: 'match'; index: number }
  | { page: 'live' };

function parseRoute(hash: string): Route {
  const path = hash.replace('#/', '').replace('#', '');
  if (path.startsWith('match/')) {
    const index = parseInt(path.split('/')[1], 10);
    return { page: 'match', index: isNaN(index) ? 0 : index };
  }
  if (path === 'results') return { page: 'results' };
  if (path === 'live') return { page: 'live' };
  if (path === 'app' || path === 'home') return { page: 'home' };
  return { page: 'landing' };
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute(window.location.hash));

  const navigate = useCallback((target: string) => {
    window.location.hash = `#/${target}`;
    const newRoute = parseRoute(`#/${target}`);
    setRoute(newRoute);
    window.scrollTo(0, 0);
  }, []);

  window.onhashchange = () => {
    setRoute(parseRoute(window.location.hash));
  };

  return (
    <TwinProvider>
      <div className="min-h-dvh flex flex-col bg-ink">
        <Header onNavigate={navigate} currentPage={route.page} />
        <main className="flex-1 flex flex-col">
          {route.page === 'landing' && <LandingPage onNavigate={navigate} />}
          {route.page === 'home' && <Home onNavigate={navigate} />}
          {route.page === 'results' && <Results onNavigate={navigate} />}
          {route.page === 'match' && <MatchDetail matchIndex={route.index} onNavigate={navigate} />}
          {route.page === 'live' && <LiveView onNavigate={navigate} />}
        </main>
        <PWAInstallBanner />
      </div>
    </TwinProvider>
  );
}

export default App;
