import { useEffect, useState } from 'react';
import HikeHubLoader from '@/components/HikeHubLoader';
import LoginScreen from '@/components/screens/LoginScreen';
import logo from '@/assets/hikehub-logo.jpg';

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

  return (
    <main className="min-h-dvh w-full flex flex-col items-center justify-center bg-background text-foreground p-6 text-center">
      <img src={logo} alt="" className="w-20 h-20 rounded-2xl object-cover mb-4 shadow" />
      <h1 className="font-display text-4xl tracking-[2px]">WELCOME TO HIKEHUB</h1>
      <p className="text-muted-foreground mt-2">Your trails dashboard goes here next.</p>
      <button
        onClick={() => setAuthed(false)}
        className="mt-6 px-5 py-2 rounded-full border border-border text-sm"
      >
        Sign out
      </button>
    </main>
  );
}
