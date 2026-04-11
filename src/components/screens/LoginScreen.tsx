import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { lovable } from '@/integrations/lovable/index';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { showToast, setGuestMode } = useApp();
  const [tab, setTab] = useState<'signin' | 'register' | 'forgot'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const doSignIn = async () => {
    setError('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    showToast('🏔️ Welcome back!');
  };

  const doRegister = async () => {
    setError('');
    if (!name || !email || !password || !confirmPw) { setError('Please fill in all fields.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name } },
    });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    showToast('📧 Check your email to verify your account!');
  };

  const doForgotPassword = async () => {
    setError('');
    if (!email) { setError('Please enter your email.'); return; }
    if (!email.includes('@')) { setError('Please enter a valid email.'); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    showToast('📧 Check your email for a password reset link!');
  };

  const doGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    const result = await lovable.auth.signInWithOAuth('google', {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError(result.error instanceof Error ? result.error.message : 'Google sign-in failed');
      setLoading(false);
      return;
    }
    if (result.redirected) return;
    setLoading(false);
    showToast('🏔️ Welcome!');
  };

  const doGuest = () => {
    setGuestMode(true);
    showToast('👋 Browsing as guest — sign in to save your progress!');
  };

  return (
    <div className="fixed inset-0 z-[9000] flex flex-col items-center overflow-y-auto" style={{ background: '#061a0e' }}>
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
        {tab !== 'forgot' && (
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
        )}

        {/* Error */}
        {error && (
          <div className="w-full px-3.5 py-2.5 rounded-lg mb-4 font-mono text-[10px] tracking-[0.5px]"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {tab === 'forgot' ? (
          <>
            <div className="w-full text-center mb-6">
              <span className="text-[28px] block mb-2">🔑</span>
              <h2 className="font-mono text-[13px] tracking-[2px] text-primary uppercase font-bold">Reset Password</h2>
              <p className="font-mono text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Enter your email and we'll send you a reset link
              </p>
            </div>
            <AuthField label="Email" icon="✉️" value={email} onChange={setEmail} type="email" placeholder="you@example.com"
              onKeyDown={e => e.key === 'Enter' && doForgotPassword()} />
            <button onClick={doForgotPassword} disabled={loading}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-4 disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link →'}
            </button>
            <button onClick={() => { setTab('signin'); setError(''); }}
              className="bg-transparent border-none cursor-pointer font-mono text-[11px] tracking-[1px] text-primary/60 hover:text-primary transition-colors">
              ← Back to Sign In
            </button>
          </>
        ) : tab === 'signin' ? (
          <>
            <AuthField label="Email" icon="✉️" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <AuthField label="Password" icon="🔒" value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && doSignIn()} showToggle onToggle={() => setShowPw(!showPw)} />

            <div className="w-full flex justify-end mb-4 -mt-2">
              <button onClick={() => { setTab('forgot'); setError(''); }}
                className="bg-transparent border-none cursor-pointer font-mono text-[10px] tracking-[1px] text-primary/50 hover:text-primary transition-colors">
                Forgot password?
              </button>
            </div>

            <button onClick={doSignIn} disabled={loading}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-4 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>

            {/* Divider */}
            <div className="w-full flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Google Sign-In */}
            <button onClick={doGoogleSignIn} disabled={loading}
              className="w-full py-3.5 rounded-xl font-mono text-[12px] tracking-[1px] font-semibold cursor-pointer transition-all active:scale-[0.98] mb-3 disabled:opacity-50 flex items-center justify-center gap-3 border-none"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Continue with Google
            </button>

            {/* Guest */}
            <button onClick={doGuest}
              className="w-full py-3 rounded-xl font-mono text-[11px] tracking-[1.5px] uppercase cursor-pointer transition-all active:scale-[0.98] border-none"
              style={{ background: 'transparent', color: 'rgba(34,197,94,0.5)', border: '1px solid rgba(34,197,94,0.15)' }}>
              Continue as Guest 👤
            </button>
          </>
        ) : (
          <>
            <AuthField label="Your Name" icon="🥾" value={name} onChange={setName} placeholder="Trail Blazer" />
            <AuthField label="Email" icon="✉️" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <AuthField label="Password" icon="🔒" value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} placeholder="Min. 8 characters"
              showToggle onToggle={() => setShowPw(!showPw)} />
            <AuthField label="Confirm Password" icon="🔒" value={confirmPw} onChange={setConfirmPw} type="password" placeholder="Repeat password"
              onKeyDown={e => e.key === 'Enter' && doRegister()} />

            <button onClick={doRegister} disabled={loading}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-4 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account →'}
            </button>

            {/* Divider */}
            <div className="w-full flex items-center gap-3 mb-4">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="font-mono text-[9px] tracking-[2px] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>

            {/* Google Sign-Up */}
            <button onClick={doGoogleSignIn} disabled={loading}
              className="w-full py-3.5 rounded-xl font-mono text-[12px] tracking-[1px] font-semibold cursor-pointer transition-all active:scale-[0.98] mb-3 disabled:opacity-50 flex items-center justify-center gap-3 border-none"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Sign up with Google
            </button>

            {/* Guest */}
            <button onClick={doGuest}
              className="w-full py-3 rounded-xl font-mono text-[11px] tracking-[1.5px] uppercase cursor-pointer transition-all active:scale-[0.98] border-none"
              style={{ background: 'transparent', color: 'rgba(34,197,94,0.5)', border: '1px solid rgba(34,197,94,0.15)' }}>
              Continue as Guest 👤
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
