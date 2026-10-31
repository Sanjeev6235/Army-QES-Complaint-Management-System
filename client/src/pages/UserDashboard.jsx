import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Wrench, CheckCircle2, PlusCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatCard from '../components/common/StatCard';
import ComplaintCard from '../components/complaints/ComplaintCard';

export default function UserDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/user-stats').then(r => {
      setStats(r.data.stats);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-stone-500 text-sm mt-1 font-mono">
            Quarter {user?.quarterNumber || 'N/A'} • {user?.unit || 'No unit set'}
          </p>
        </div>
        <Link to="/complaint/new" className="btn-primary flex items-center gap-2">
          <PlusCircle size={16} /> New Complaint
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FileText}     label="Total"       value={stats?.total}      color="stone" />
        <StatCard icon={Clock}        label="Pending"     value={stats?.pending}    color="amber" />
        <StatCard icon={Wrench}       label="In Progress" value={stats?.inProgress} color="orange" />
        <StatCard icon={CheckCircle2} label="Completed"   value={stats?.completed}  color="army" />
      </div>

      {/* Recent complaints */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-stone-300 tracking-wide uppercase text-sm">Recent Complaints</h2>
        <Link to="/complaints" className="flex items-center gap-1 text-army-400 hover:text-army-300 text-sm">
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-28 bg-stone-900 rounded-xl animate-pulse" />)}
        </div>
      ) : stats?.recent?.length ? (
        <div className="space-y-3">
          {stats.recent.map(c => <ComplaintCard key={c._id} complaint={c} />)}
        </div>
      ) : (
        <div className="card text-center py-12">
          <FileText size={40} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 font-display tracking-wide">No complaints yet</p>
          <Link to="/complaint/new" className="btn-primary inline-flex items-center gap-2 mt-4">
            <PlusCircle size={15} /> File First Complaint
          </Link>
        </div>
      )}
    </div>
  );
}
