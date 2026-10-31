import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    serviceNumber: '', unit: '', quarterNumber: '', phone: ''
  });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success('Account created successfully!');
      if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4"
      style={{ backgroundImage: `radial-gradient(ellipse at 20% 50%, rgba(93,138,30,0.1) 0%, transparent 60%)` }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-army-800/50 border border-army-700/50 rounded-2xl mb-3">
            <Shield size={26} className="text-army-400" />
          </div>
          <h1 className="font-display text-2xl font-bold text-stone-100 tracking-widest uppercase">Register</h1>
          <p className="text-sm text-stone-500 mt-1 font-mono">Army QES — New Account</p>
        </div>

        <div className="card">
          {error && (
            <div className="flex items-center gap-2 bg-red-900/30 border border-red-800/50 text-red-300 text-sm px-3 py-2.5 rounded-lg mb-4">
              <AlertCircle size={14} /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="label">Full Name *</label>
                <input name="name" className="input-field" placeholder="Col. Rajesh Kumar" value={form.name} onChange={handleChange} required />
              </div>
              <div className="col-span-2">
                <label className="label">Email *</label>
                <input name="email" type="email" className="input-field" placeholder="email@army.mil" value={form.email} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Password *</label>
                <div className="relative">
                  <input name="password" type={showPwd ? 'text' : 'password'} className="input-field pr-9" placeholder="••••••" value={form.password} onChange={handleChange} required />
                  <button type="button" onClick={() => setShowPwd(v => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-500">
                    {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="label">Confirm Password *</label>
                <input name="confirmPassword" type="password" className="input-field" placeholder="••••••" value={form.confirmPassword} onChange={handleChange} required />
              </div>
              <div>
                <label className="label">Service Number</label>
                <input name="serviceNumber" className="input-field" placeholder="IC-12345" value={form.serviceNumber} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Unit</label>
                <input name="unit" className="input-field" placeholder="7 Inf Bde" value={form.unit} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Quarter No.</label>
                <input name="quarterNumber" className="input-field" placeholder="A-204" value={form.quarterNumber} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Phone</label>
                <input name="phone" className="input-field" placeholder="+91 98765 43210" value={form.phone} onChange={handleChange} />
              </div>
            </div>

            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <p className="text-center text-sm text-stone-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-army-400 hover:text-army-300 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
