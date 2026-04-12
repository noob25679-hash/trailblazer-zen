import { useState, useEffect } from 'react';
import { AppProvider, useApp } from '@/context/AppContext';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import LoginScreen from '@/components/screens/LoginScreen';
import FeedScreen from '@/components/screens/FeedScreen';
import MapScreen from '@/components/screens/MapScreen';
import SavedScreen from '@/components/screens/SavedScreen';
import LogsScreen from '@/components/screens/LogsScreen';
import ProfileScreen from '@/components/screens/ProfileScreen';
import SensorsScreen from '@/components/screens/SensorsScreen';
import RankScreen from '@/components/screens/RankScreen';
import ShopScreen from '@/components/screens/ShopScreen';
import CameraScreen from '@/components/screens/CameraScreen';
import LogModal from '@/components/modals/LogModal';
import StartTrekModal from '@/components/modals/StartTrekModal';
import DesktopSidebar from '@/components/DesktopSidebar';
import { SidebarProvider } from '@/components/ui/sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

function DashboardInner() {
  const { screen, setScreen, isLoggedIn, isTracking, trackName, guestMode } = useApp();
  const [showLogModal, setShowLogModal] = useState(false);
  const [logPrefill, setLogPrefill] = useState('');
  const [showStartModal, setShowStartModal] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const onOpenLog = (e: Event) => {
      setLogPrefill((e as CustomEvent).detail || '');
      setShowLogModal(true);
    };
    const onOpenStart = () => setShowStartModal(true);
    window.addEventListener('openLogModal', onOpenLog);
    window.addEventListener('openStartTrek', onOpenStart);
    return () => {
      window.removeEventListener('openLogModal', onOpenLog);
      window.removeEventListener('openStartTrek', onOpenStart);
    };
  }, []);

  if (!isLoggedIn && !guestMode) return <LoginScreen />;

  const screens: Record<string, JSX.Element> = {
    feed: <FeedScreen />,
    map: <MapScreen />,
    saved: <SavedScreen />,
    logs: <LogsScreen />,
    profile: <ProfileScreen />,
    sensors: <SensorsScreen />,
    rank: <RankScreen />,
    shop: <ShopScreen />,
    camera: <CameraScreen />,
  };

  const content = (
    <div className="relative flex-1 h-full">
      {/* Screens */}
      <div className="absolute inset-0" style={isMobile ? { bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))' } : undefined}>
        {Object.entries(screens).map(([key, component]) => (
          <div key={key} className={`absolute inset-0 flex flex-col overflow-hidden ${screen === key ? '' : 'hidden'}`}>
            {component}
          </div>
        ))}
      </div>

      {/* Live tracking banner - mobile only */}
      {isMobile && isTracking && screen !== 'sensors' && (
        <div className="fixed left-0 right-0 z-[999] flex items-center justify-between px-4 py-2 border-t"
          style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px))', background: 'rgba(239,68,68,0.95)', backdropFilter: 'blur(8px)', borderColor: 'rgba(255,255,255,0.2)' }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse-green" />
            <span className="font-mono text-[10px] text-white tracking-[1px]">REC</span>
            <span className="font-mono text-[11px] text-white font-semibold">{trackName}</span>
          </div>
        </div>
      )}

      {/* Camera FAB - mobile only */}
      {isMobile && (
        <button onClick={() => setScreen('camera')}
          className="fixed right-0 z-[998] w-[52px] h-[52px] rounded-l-2xl border-none cursor-pointer flex items-center justify-center bg-gradient-to-br from-primary to-green-dark shadow-[-4px_4px_20px_rgba(34,197,94,0.4)] transition-all"
          style={{ bottom: 'calc(72px + env(safe-area-inset-bottom, 0px) + 80px)' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
        </button>
      )}

      {isMobile && <BottomNav />}
      <Toast />

      {showLogModal && <LogModal onClose={() => setShowLogModal(false)} prefillName={logPrefill} />}
      {showStartModal && <StartTrekModal onClose={() => setShowStartModal(false)} />}
    </div>
  );

  if (isMobile) {
    return <div className="w-full h-full flex flex-col relative">{content}</div>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <DesktopSidebar />
        {content}
      </div>
    </SidebarProvider>
  );
}

export default function Dashboard() {
  return (
    <AppProvider>
      <DashboardInner />
    </AppProvider>
  );
}
