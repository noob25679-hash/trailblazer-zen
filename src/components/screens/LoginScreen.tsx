import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';

export default function LoginScreen() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
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
            <AuthField label="Email" icon="✉️" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <AuthField label="Password" icon="🔒" value={password} onChange={setPassword} type={showPw ? 'text' : 'password'} placeholder="••••••••••"
              onKeyDown={e => e.key === 'Enter' && doSignIn()} showToggle onToggle={() => setShowPw(!showPw)} />

            <button onClick={doSignIn} disabled={loading}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-5 disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign In →'}
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
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] mb-5 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create Account →'}
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
