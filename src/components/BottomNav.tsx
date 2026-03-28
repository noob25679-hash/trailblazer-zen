import { useApp } from '@/context/AppContext';

type NavScreen = 'feed' | 'map' | 'rank' | 'profile';

export default function BottomNav() {
  const { screen, setScreen, isTracking } = useApp();

  const navItems: { id: NavScreen; label: string; icon: JSX.Element }[] = [
    {
      id: 'feed',
      label: 'Discover',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7" strokeWidth={2}>
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" opacity={0.8} />
        </svg>
      ),
    },
    {
      id: 'map',
      label: 'Map',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7" strokeWidth={2}>
          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
          <line x1="8" y1="2" x2="8" y2="18" />
          <line x1="16" y1="6" x2="16" y2="22" />
        </svg>
      ),
    },
    {
      id: 'rank',
      label: 'Ranks',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7" strokeWidth={2}>
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
          <polyline points="17 6 23 6 23 12" />
        </svg>
      ),
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-7 h-7" strokeWidth={2}>
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
  ];

  const handleCenterPress = () => {
    if (isTracking) {
      setScreen('sensors');
    } else {
      // Open start trek modal - handled by parent
      window.dispatchEvent(new CustomEvent('openStartTrek'));
    }
  };

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-[1000] flex items-center justify-around backdrop-blur-xl border-t border-border-bright"
      style={{
        height: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        background: 'rgba(8,13,8,0.96)',
      }}
    >
      {navItems.slice(0, 2).map(item => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-[1px] uppercase font-semibold transition-colors ${
            screen === item.id ? 'text-primary' : 'text-text-dim'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}

      {/* Center button */}
      <button
        onClick={handleCenterPress}
        className={`w-14 h-14 rounded-full border-none cursor-pointer flex items-center justify-center mb-2 transition-transform active:scale-[0.92] ${
          isTracking
            ? 'bg-gradient-to-br from-destructive to-red-800 shadow-[0_0_24px_rgba(239,68,68,0.6)]'
            : 'bg-gradient-to-br from-primary to-green-dark shadow-[0_0_24px_rgba(34,197,94,0.5)]'
        }`}
      >
        {isTracking ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-6 h-6">
            <rect x="6" y="6" width="12" height="12" rx="2" fill="white" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} className="w-6 h-6">
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>

      {navItems.slice(2).map(item => (
        <button
          key={item.id}
          onClick={() => setScreen(item.id)}
          className={`flex flex-col items-center gap-1 px-4 py-2 bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-[1px] uppercase font-semibold transition-colors ${
            screen === item.id ? 'text-primary' : 'text-text-dim'
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </nav>
  );
}
