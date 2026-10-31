import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Wrench, Clock, CheckCircle2, ArrowRight, UserCheck } from 'lucide-react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import ComplaintCard from '../components/complaints/ComplaintCard';

export default function EngineerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/engineer-stats')
      .then(r => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">Engineer Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1 font-mono">
            {user?.serviceNumber ? `SVC# ${user.serviceNumber}` : user?.name} • {user?.unit || 'No unit'}
          </p>
        </div>
        <Link to="/engineer/complaints" className="btn-primary flex items-center gap-2 text-sm">
          <Wrench size={14} /> View Tasks
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={Wrench}       label="Total Assigned" value={stats?.total}      color="stone" />
        <StatCard icon={UserCheck}    label="Assigned"       value={stats?.assigned}   color="blue" />
        <StatCard icon={Clock}        label="In Progress"    value={stats?.inProgress} color="orange" />
        <StatCard icon={CheckCircle2} label="Completed"      value={stats?.completed}  color="army" />
      </div>

      {/* Completion rate */}
      {stats?.total > 0 && (
        <div className="card mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="font-display text-sm text-stone-400 tracking-wide uppercase">Completion Rate</span>
            <span className="font-display font-bold text-army-300 text-lg">
              {Math.round((stats.completed / stats.total) * 100)}%
            </span>
          </div>
          <div className="w-full bg-stone-800 rounded-full h-2.5">
            <div
              className="bg-army-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-stone-600 mt-1.5 font-mono">
            <span>{stats.completed} completed</span>
            <span>{stats.total - stats.completed} remaining</span>
          </div>
        </div>
      )}

      {/* Recent assigned complaints */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-stone-300 tracking-wide uppercase text-sm">Recent Assignments</h2>
        <Link to="/engineer/complaints" className="flex items-center gap-1 text-army-400 hover:text-army-300 text-sm">
          View all <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-stone-900 rounded-xl animate-pulse" />)}
        </div>
      ) : stats?.recent?.length ? (
        <div className="space-y-3">
          {stats.recent.map(c => <ComplaintCard key={c._id} complaint={c} />)}
        </div>
      ) : (
        <div className="card text-center py-14">
          <Wrench size={40} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 font-display tracking-wide">No complaints assigned yet</p>
          <p className="text-stone-600 text-sm mt-1">Check back after admin assigns tasks</p>
        </div>
      )}
    </div>
  );
}
