import { useEffect, useState } from 'react';
import HikeHubLoader from '@/components/HikeHubLoader';
import LoginScreen from '@/components/screens/LoginScreen';
import FypScreen from '@/components/screens/FypScreen';

export default function Home() {
  const [booting, setBooting] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setBooting(false), 1800);
    return () => clearTimeout(t);
  }, []);

  if (booting) {
    return (
      <main className="min-h-dvh w-full flex flex-col items-center justify-center bg-background">
        <HikeHubLoader size={180} label="HikeHub" />
      </main>
    );
  }

  if (!authed) return <LoginScreen onAuthed={() => setAuthed(true)} />;

  return <FypScreen onSignOut={() => setAuthed(false)} />;
}
