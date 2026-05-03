import { useState } from 'react';
import HikeHubLoader from '@/components/HikeHubLoader';
import logo from '@/assets/hikehub-logo.jpg';
import hero from '@/assets/hikehub-hero.jpg';

type View = 'welcome' | 'login' | 'register';

export default function LoginScreen({ onAuthed }: { onAuthed?: () => void }) {
  const [view, setView] = useState<View>('welcome');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onAuthed?.();
    }, 1200);
  };

  return (
    <div className="min-h-dvh w-full bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] mx-auto">
        {view === 'welcome' && <Welcome onSignIn={() => setView('login')} onCreate={() => setView('register')} />}
        {view === 'login' && (
          <Login
            onBack={() => setView('welcome')}
            onSwitch={() => setView('register')}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
        {view === 'register' && (
          <Register
            onBack={() => setView('welcome')}
            onSwitch={() => setView('login')}
            onSubmit={handleSubmit}
            submitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

/* ---------- Welcome ---------- */
function Welcome({ onSignIn, onCreate }: { onSignIn: () => void; onCreate: () => void }) {
  return (
    <div className="relative rounded-[36px] overflow-hidden shadow-xl h-[640px] flex flex-col justify-end">
      <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(150_38%_18%/0.55)] via-[hsl(150_38%_14%/0.45)] to-[hsl(150_45%_10%/0.85)]" />

      <div className="relative z-10 flex items-center gap-2 p-6 pb-0">
        <img src={logo} alt="HikeHub" className="w-10 h-10 rounded-xl object-cover ring-1 ring-white/20" />
        <span className="font-display tracking-[3px] text-white text-xl">HIKEHUB</span>
      </div>

      <div className="relative z-10 p-7 pt-12">
        <h1 className="font-display text-white text-[44px] leading-[1.05] tracking-[1px]">
          The best app<br />for your trails
        </h1>
        <p className="text-white/80 text-sm mt-3 max-w-[280px] leading-relaxed">
          Discover routes, log treks, and share peaks with a community of hikers.
        </p>

        <button
          onClick={onSignIn}
          className="mt-8 w-full py-3.5 rounded-full bg-white/15 backdrop-blur-md text-white font-mono text-xs tracking-[3px] uppercase border border-white/25 transition-all active:scale-[0.98] hover:bg-white/25"
        >
          Sign In
        </button>
        <button
          onClick={onCreate}
          className="mt-3 w-full py-2 text-white/85 text-sm underline-offset-4 hover:underline"
        >
          Create an account
        </button>
      </div>
    </div>
  );
}

/* ---------- Login ---------- */
function Login({
  onBack,
  onSwitch,
  onSubmit,
  submitting,
}: {
  onBack: () => void;
  onSwitch: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  return (
    <div className="relative rounded-[36px] overflow-hidden shadow-xl bg-card">
      {/* Top hero curve */}
      <div className="relative h-[230px]">
        <img src={hero} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[hsl(150_38%_18%/0.35)]" />
        <button
          onClick={onBack}
          aria-label="Back"
          className="absolute top-5 left-5 w-10 h-10 rounded-full bg-white/90 text-foreground flex items-center justify-center shadow"
        >
          ←
        </button>
        <svg
          viewBox="0 0 420 60"
          preserveAspectRatio="none"
          className="absolute -bottom-px left-0 w-full h-[60px] text-card"
          aria-hidden="true"
        >
          <path d="M0 60 V20 Q140 -10 250 25 T420 18 V60 Z" fill="currentColor" />
        </svg>
      </div>

      <div className="px-7 pb-8 -mt-2">
        <div className="flex flex-col items-center mb-1">
          <img src={logo} alt="" className="w-10 h-10 rounded-lg object-cover mb-2" />
          <h2 className="font-display text-[28px] leading-none tracking-[1.5px] text-primary text-center">
            WELCOME BACK
          </h2>
        </div>
        <p className="text-center text-sm text-muted-foreground mb-6 mt-2">Login to your account</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <Field icon="user" type="email" placeholder="Email" required />
          <Field icon="lock" type="password" placeholder="Password" required toggleable />

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
              <input type="checkbox" className="accent-primary w-4 h-4 rounded" defaultChecked />
              Remember me
            </label>
            <button type="button" className="text-primary font-medium underline-offset-4 hover:underline">
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full py-3.5 rounded-full bg-primary text-primary-foreground font-mono text-xs tracking-[3px] uppercase shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitting ? <HikeHubLoader size={28} /> : 'Login'}
          </button>
        </form>

        <Divider label="Or continue with" />
        <SocialRow />

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <button onClick={onSwitch} className="text-primary font-semibold underline">
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}

/* ---------- Register ---------- */
function Register({
  onBack,
  onSwitch,
  onSubmit,
  submitting,
}: {
  onBack: () => void;
  onSwitch: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
}) {
  return (
    <div className="relative rounded-[36px] overflow-hidden shadow-xl bg-card">
      <div className="flex items-center justify-between p-5">
        <button
          onClick={onBack}
          aria-label="Back"
          className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center"
        >
          ←
        </button>
        <img src={logo} alt="HikeHub" className="w-10 h-10 rounded-xl object-cover" />
      </div>

      <div className="px-7 pb-8">
        <h2 className="font-display text-4xl tracking-[2px] text-primary">REGISTER</h2>
        <p className="text-sm text-muted-foreground mb-6">Create your new account</p>

        <form onSubmit={onSubmit} className="space-y-3">
          <Field icon="user" type="text" placeholder="Full Name" required />
          <Field icon="mail" type="email" placeholder="user@mail.com" required showCheck />
          <Field icon="lock" type="password" placeholder="Password" required toggleable />

          <button
            type="submit"
            disabled={submitting}
            className="mt-5 w-full py-3.5 rounded-full bg-primary text-primary-foreground font-mono text-xs tracking-[3px] uppercase shadow-md transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center"
          >
            {submitting ? <HikeHubLoader size={28} /> : 'Create Account'}
          </button>
        </form>

        <Divider label="Or continue with" />
        <SocialRow />

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{' '}
          <button onClick={onSwitch} className="text-primary font-semibold underline">
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

/* ---------- Shared bits ---------- */
function Field({
  icon,
  type,
  placeholder,
  required,
  toggleable,
  showCheck,
}: {
  icon: 'user' | 'lock' | 'mail';
  type: string;
  placeholder: string;
  required?: boolean;
  toggleable?: boolean;
  showCheck?: boolean;
}) {
  const [show, setShow] = useState(false);
  const inputType = toggleable ? (show ? 'text' : 'password') : type;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-secondary/70 border border-border focus-within:border-primary transition-colors">
      <span className="text-muted-foreground w-5 h-5 flex items-center justify-center">
        {icon === 'user' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
          </svg>
        )}
        {icon === 'lock' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 1 1 8 0v4" />
          </svg>
        )}
        {icon === 'mail' && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            <rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 7 9-7" />
          </svg>
        )}
      </span>
      <input
        type={inputType}
        placeholder={placeholder}
        required={required}
        className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
      />
      {toggleable && (
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          className="text-muted-foreground hover:text-foreground"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
            {show ? (
              <><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>
            ) : (
              <><path d="m3 3 18 18" /><path d="M10.6 6.1A10.9 10.9 0 0 1 12 6c6.5 0 10 6 10 6a17.4 17.4 0 0 1-3.2 4M6.6 6.6A17.7 17.7 0 0 0 2 12s3.5 6 10 6c1.6 0 3-.3 4.3-.8" /></>
            )}
          </svg>
        </button>
      )}
      {showCheck && (
        <span className="text-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-4 h-4">
            <path d="M5 12l5 5L20 7" />
          </svg>
        </span>
      )}
    </div>
  );
}

function Divider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

function SocialRow() {
  const Btn = ({ children, label }: { children: React.ReactNode; label: string }) => (
    <button
      type="button"
      aria-label={label}
      className="w-12 h-12 rounded-full bg-secondary border border-border flex items-center justify-center hover:bg-muted transition-colors active:scale-95"
    >
      {children}
    </button>
  );
  return (
    <div className="flex items-center justify-center gap-4">
      <Btn label="Continue with Facebook">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2"><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.5 2.9h-2.3v7A10 10 0 0 0 22 12z"/></svg>
      </Btn>
      <Btn label="Continue with Google">
        <svg viewBox="0 0 24 24" className="w-5 h-5">
          <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.2 1.4-1.6 4-5.4 4-3.3 0-5.9-2.7-5.9-6.1S8.7 5.9 12 5.9c1.8 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.4 14.6 2.5 12 2.5 6.8 2.5 2.6 6.7 2.6 12S6.8 21.5 12 21.5c6.9 0 9.5-4.8 9.5-7.3 0-.5 0-.9-.1-1.3z"/>
        </svg>
      </Btn>
      <Btn label="Continue with Apple">
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor"><path d="M16.4 12.6c0-2.5 2-3.7 2.1-3.8-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.2 1-4 2.4-1.7 3-.4 7.4 1.2 9.8.8 1.2 1.8 2.5 3.1 2.5 1.2 0 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.7-1-2.7-3.9zM14 4.6c.7-.8 1.1-2 1-3.1-1 .1-2.2.7-2.9 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.2-.6 2.9-1.4z"/></svg>
      </Btn>
    </div>
  );
}
