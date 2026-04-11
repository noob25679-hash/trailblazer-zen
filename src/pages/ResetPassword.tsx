import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('type=recovery')) {
      setIsRecovery(true);
    }
    // Listen for PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const doReset = async () => {
    setError('');
    if (!password || !confirmPw) { setError('Please fill in both fields.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (password !== confirmPw) { setError('Passwords do not match.'); return; }
    setLoading(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (authError) { setError(authError.message); return; }
    setSuccess(true);
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <div className="fixed inset-0 z-[9000] flex flex-col items-center justify-center" style={{ background: '#061a0e' }}>
      <div className="w-full max-w-[400px] px-6 flex flex-col items-center">
        <span className="text-[48px] mb-4">🔑</span>
        <h1 className="font-display text-[32px] tracking-[4px] text-primary mb-2">RESET PASSWORD</h1>

        {!isRecovery ? (
          <p className="font-mono text-[12px] text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Invalid or expired reset link. Please request a new one.
          </p>
        ) : success ? (
          <div className="text-center">
            <p className="font-mono text-[13px] text-primary mb-2">✅ Password updated!</p>
            <p className="font-mono text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>Redirecting...</p>
          </div>
        ) : (
          <div className="w-full mt-6">
            {error && (
              <div className="w-full px-3.5 py-2.5 rounded-lg mb-4 font-mono text-[10px]"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                {error}
              </div>
            )}
            <div className="w-full mb-4">
              <label className="font-mono text-[9px] tracking-[2px] text-primary uppercase block mb-2 font-semibold">New Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full py-3.5 px-4 rounded-xl bg-transparent text-[15px] text-white outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <div className="w-full mb-6">
              <label className="font-mono text-[9px] tracking-[2px] text-primary uppercase block mb-2 font-semibold">Confirm Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat password" onKeyDown={e => e.key === 'Enter' && doReset()}
                className="w-full py-3.5 px-4 rounded-xl bg-transparent text-[15px] text-white outline-none"
                style={{ border: '1px solid rgba(255,255,255,0.1)', fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <button onClick={doReset} disabled={loading}
              className="w-full py-4 bg-primary border-none rounded-xl font-mono text-[13px] tracking-[2px] uppercase text-black font-bold cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Updating...' : 'Set New Password →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
