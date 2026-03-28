import { useState } from 'react';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { setIsLoggedIn, setUserName, showToast } = useApp();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  const doSignIn = () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    const stored = JSON.parse(localStorage.getItem('trekr_account') || 'null');
    if (!stored || stored.email !== email || stored.password !== password) {
      setError('Incorrect email or password.'); return;
    }
    setUserName(stored.name);
    setIsLoggedIn(true);
    showToast(`🏔️ Welcome back, ${stored.name}!`);
  };

  const doRegister = () => {
    setError('');
    if (!name || !email || !password || !confirmPw) { setError('Please fill in all fields.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    localStorage.setItem('trekr_account', JSON.stringify({ name, email, password }));
    setUserName(name);
    setIsLoggedIn(true);
    showToast(`🎉 Account created! Welcome, ${name}!`);
  };

  const continueAsGuest = () => {
    setUserName('Guest Trekker');
    setIsLoggedIn(true);
    showToast('🎒 Continuing as guest');
  };

  return (
    <div className="fixed inset-0 z-[9000] flex flex-col items-center overflow-y-auto" style={{ background: '#061a0e' }}>
      {/* Grid background */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(34,197,94,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,197,94,0.04) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative z-10 w-full max-w-[420px] px-6 pt-[60px] pb-12 flex flex-col items-center">
        {/* Logo */}
        <div className="text-center mb-10">
          <span className="text-[60px] block mb-1 leading-none">🏔️</span>
          <div className="font-display text-[56px] tracking-[8px] text-primary leading-none" style={{ textShadow: '0 0 40px rgba(34,197,94,0.5)' }}>
            TREKR
          </div>
          <div className="font-mono text-[10px] tracking-[3px] mt-2 uppercase" style={{ color: 'rgba(34,197,94,0.65)' }}>
            Discover &nbsp;·&nbsp; Explore &nbsp;·&nbsp; Conquer
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex w-full rounded-xl p-1 gap-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(34,197,94,0.2)' }}>
          <button
            onClick={() => { setTab('signin'); setError(''); }}
            className={`flex-1 py-3 rounded-lg font-mono text-[11px] tracking-[1.5px] uppercase font-semibold cursor-pointer transition-all border-none ${
              tab === 'signin' ? 'bg-primary text-black' : 'bg-transparent'
            }`}
            style={{ color: tab !== 'signin' ? 'rgba(34,197,94,0.45)' : undefined }}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setError(''); }}
            className={`flex-1 py-3 rounded-lg font-mono text-[11px] tracking-[1.5px] uppercase font-semibold cursor-pointer transition-all border-none ${
              tab === 'register' ? 'bg-primary text-black' : 'bg-transparent'
            }`}
            style={{ color: tab !== 'register' ? 'rgba(34,197,94,0.45)' : undefined }}
          >
            Create Account
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full px-3.5 py-2.5 rounded-lg mb-4 font-mono text-[10px] tracking-[0.5px]"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {tab === 'signin' ? (
          <>
            <button onClick={() => showToast('🔗 Google sign-in coming soon!')}
              className="w-full py-4 rounded-xl cursor-pointer flex items-center justify-center gap-3 text-[15px] text-white font-medium transition-all border-none mb-5 active:opacity-80"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>
            <div className="w-full flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <AuthField label="Email" icon="✉️" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <AuthField label="Password" icon="🔒" value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && doSignIn()} showToggle onToggle={() => setShowPw(!showPw)} />

            <button className="self-start font-mono text-[10px] tracking-[1px] text-primary underline bg-transparent border-none cursor-pointer mb-6 uppercase p-0"
              onClick={() => showToast('📧 Password reset coming soon!')}>Forgot Password?</button>

            <button onClick={doSignIn}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-5">
              Sign In →
            </button>

            <div className="w-full flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <button onClick={continueAsGuest}
              className="w-full py-3.5 bg-transparent rounded-xl cursor-pointer font-mono text-[11px] tracking-[1.5px] uppercase transition-all active:opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.35)' }}>
              🎒 &nbsp; Continue as Guest
            </button>
          </>
        ) : (
          <>
            <button onClick={() => showToast('🔗 Google sign-in coming soon!')}
              className="w-full py-4 rounded-xl cursor-pointer flex items-center justify-center gap-3 text-[15px] text-white font-medium transition-all border-none mb-5 active:opacity-80"
              style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Sign up with Google
            </button>
            <div className="w-full flex items-center gap-3 mb-5">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-mono text-[10px] tracking-[1px]" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            <AuthField label="Your Name" icon="🥾" value={name} onChange={setName} placeholder="Trail Blazer" />
            <AuthField label="Email" icon="✉️" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <AuthField label="Password" icon="🔒" value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
              showToggle onToggle={() => setShowPw(!showPw)} />
            <AuthField label="Confirm Password" icon="🔒" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat password"
              onKeyDown={e => e.key === 'Enter' && doRegister()} />

            <button onClick={doRegister}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-5">
              Create Account →
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AuthField({ label, icon, value, onChange, type = 'text', placeholder = '', onKeyDown, showToggle, onToggle }: {
  label: string; icon: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; onKeyDown?: (e: React.KeyboardEvent) => void;
  showToggle?: boolean; onToggle?: () => void;
}) {
  return (
    <div className="w-full mb-4">
      <label className="font-mono text-[9px] tracking-[2px] text-primary uppercase block mb-2 font-semibold">{label}</label>
      <div className="relative flex items-center rounded-xl overflow-hidden transition-colors"
        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="px-3.5 text-[16px] flex-shrink-0 opacity-55">{icon}</span>
        <input
          type={type} value={value} onChange={e => onChange(e.target.value)}
          placeholder={placeholder} onKeyDown={onKeyDown}
          className="flex-1 py-3.5 pr-3.5 bg-transparent border-none outline-none text-[15px] text-white"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        />
        {showToggle && (
          <button onClick={onToggle} className="px-3.5 bg-transparent border-none cursor-pointer text-[16px] opacity-45 flex-shrink-0">👁</button>
        )}
      </div>
    </div>
  );
}
