import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'engineer') navigate('/engineer/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4"
      style={{
        backgroundImage: `radial-gradient(ellipse at 30% 20%, rgba(93,138,30,0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 80%, rgba(74,110,23,0.08) 0%, transparent 50%)`
      }}>
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-army-800/50 border border-army-700/50 rounded-2xl mb-4">
            <Shield size={30} className="text-army-400" />
          </div>
          <h1 className="font-display text-3xl font-bold text-stone-100 tracking-widest uppercase">ARMY QES</h1>
          <p className="text-sm text-stone-500 mt-1 font-mono">Quarter Engineering Services</p>
        </div>

        {/* Card */}
        <div className="card border-stone-800">
          <h2 className="font-display text-lg font-bold text-stone-200 tracking-wide mb-5 uppercase">Sign In</h2>

          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 text-red-300 text-sm px-3 py-2.5 rounded-lg mb-4">
              <AlertCircle size={14} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input-field"
                placeholder="soldier@army.mil"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300"
                >
                  {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-2" disabled={loading}>
              {loading ? 'Authenticating...' : 'SIGN IN'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            No account?{' '}
            <Link to="/register" className="text-army-400 hover:text-army-300 font-semibold">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo creds hint */}
        <div className="mt-4 p-3 bg-stone-900/60 border border-stone-800 rounded-lg text-xs text-stone-500 font-mono">
          <p className="text-stone-400 font-semibold mb-1">Demo accounts:</p>
          <p>First registered user → Admin</p>
          <p>Assign engineer role via Admin panel</p>
        </div>
      </div>
    </div>
  );
}
