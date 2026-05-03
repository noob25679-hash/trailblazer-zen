import { useEffect, useState } from 'react';
import HikeHubLoader from '@/components/HikeHubLoader';
import logo from '@/assets/hikehub-logo.jpg';

export default function Home() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <main className="min-h-dvh w-full flex flex-col items-center justify-center bg-background">
        <HikeHubLoader size={180} label="Loading HikeHub" />
      </main>
    );
  }

  return (
    <main className="min-h-dvh w-full flex flex-col bg-background text-foreground">
      <header className="px-6 pt-10 pb-6 flex items-center gap-3">
        <img
          src={logo}
          alt="HikeHub logo"
          className="w-12 h-12 rounded-xl object-cover shadow-sm"
        />
        <div>
          <h1 className="font-display text-3xl tracking-[2px] leading-none">HIKEHUB</h1>
          <p className="font-mono text-[10px] tracking-[3px] uppercase text-muted-foreground mt-1">
            Trails · Logs · Community
          </p>
        </div>
      </header>

      <section className="flex-1 px-6 pt-4 pb-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <img
          src={logo}
          alt="HikeHub mountain emblem"
          className="w-44 h-44 rounded-3xl object-cover shadow-lg mb-8"
        />
        <h2 className="font-display text-5xl tracking-[1.5px] leading-tight text-foreground">
          Find your next trail.
        </h2>
        <p className="text-base text-muted-foreground mt-4 leading-relaxed">
          A calmer place for hikers — discover routes, log treks, and share peaks
          with friends.
        </p>

        <div className="flex gap-3 mt-8 w-full">
          <button className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-mono text-xs tracking-[2px] uppercase shadow-md transition-transform active:scale-[0.97]">
            Get Started
          </button>
          <button className="flex-1 py-3 rounded-full border border-border bg-card text-foreground font-mono text-xs tracking-[2px] uppercase">
            Sign In
          </button>
        </div>
      </section>

      <footer className="px-6 pb-6 text-center font-mono text-[10px] tracking-[2px] uppercase text-muted-foreground">
        v0 · UI Preview
      </footer>
    </main>
  );
}
