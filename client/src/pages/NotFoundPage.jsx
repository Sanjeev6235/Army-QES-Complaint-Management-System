import { useNavigate } from 'react-router-dom';
import { Shield, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-stone-950 flex items-center justify-center p-4">
      <div className="text-center">
        <Shield size={60} className="text-stone-700 mx-auto mb-4" />
        <div className="font-display text-8xl font-bold text-stone-800 tracking-widest mb-2">404</div>
        <h1 className="font-display text-2xl font-bold text-stone-400 tracking-wide uppercase mb-2">
          Access Denied
        </h1>
        <p className="text-stone-600 mb-6 font-mono text-sm">
          The requested resource does not exist or has been moved.
        </p>
        <button onClick={() => navigate(-1)} className="btn-primary flex items-center gap-2 mx-auto">
          <ArrowLeft size={15} /> Go Back
        </button>
      </div>
    </div>
  );
}
