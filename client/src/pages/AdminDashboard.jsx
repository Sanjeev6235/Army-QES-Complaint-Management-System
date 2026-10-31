import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Clock, Users, Wrench, CheckCircle2, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../utils/api';
import StatCard from '../components/common/StatCard';
import ComplaintCard from '../components/complaints/ComplaintCard';

const PIE_COLORS = ['#5d8a1e', '#f59e0b', '#3b82f6', '#f97316', '#6b7280'];
const BAR_COLOR = '#5d8a1e';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-sm">
      <p className="text-stone-300 font-semibold">{label}</p>
      <p className="text-army-400">{payload[0].value} complaints</p>
    </div>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/stats').then(r => setStats(r.data.stats)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = stats?.monthlyTrend?.map(d => ({
    name: monthNames[d._id.month - 1],
    count: d.count
  })) || [];

  const pieData = stats?.categoryStats?.map(c => ({ name: c._id, value: c.count })) || [];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">Admin Dashboard</h1>
          <p className="text-stone-500 text-sm mt-1">System overview & analytics</p>
        </div>
        <Link to="/complaint/new" className="btn-primary flex items-center gap-2 text-sm">
          <FileText size={14} /> New Complaint
        </Link>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={FileText}     label="Total"        value={stats?.totalComplaints}    color="stone" />
        <StatCard icon={Clock}        label="Pending"      value={stats?.pendingComplaints}  color="amber" />
        <StatCard icon={AlertTriangle} label="In Progress" value={stats?.inProgressComplaints} color="orange" />
        <StatCard icon={CheckCircle2} label="Completed"    value={stats?.completedComplaints} color="army" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <StatCard icon={UserCheck}    label="Assigned"     value={stats?.assignedComplaints} color="blue" />
        <StatCard icon={Users}        label="Users"        value={stats?.totalUsers}         color="stone" />
        <StatCard icon={Wrench}       label="Engineers"    value={stats?.totalEngineers}     color="stone" />
        <div className="rounded-xl p-4 border bg-stone-900 border-stone-800 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-stone-800 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-army-400" />
          </div>
          <div>
            <div className="font-display text-2xl font-bold text-army-300">
              {stats?.totalComplaints ? Math.round((stats.completedComplaints / stats.totalComplaints) * 100) : 0}%
            </div>
            <div className="text-xs text-stone-500 font-display tracking-wide uppercase">Resolution Rate</div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Monthly trend */}
        <div className="card">
          <h3 className="font-display font-bold text-stone-300 tracking-wide uppercase text-sm mb-4">Monthly Trend</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" tick={{ fill: '#78716c', fontSize: 11, fontFamily: 'Rajdhani' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#78716c', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-44 flex items-center justify-center text-stone-600 text-sm">No data yet</div>
          )}
        </div>

        {/* Category breakdown */}
        <div className="card">
          <h3 className="font-display font-bold text-stone-300 tracking-wide uppercase text-sm mb-4">By Category</h3>
          {pieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <PieChart width={140} height={140}>
                <Pie data={pieData} cx={65} cy={65} innerRadius={35} outerRadius={60} dataKey="value" strokeWidth={0}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-2 flex-1">
                {pieData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-stone-400">{item.name}</span>
                    </div>
                    <span className="font-bold text-stone-300 font-display">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-44 flex items-center justify-center text-stone-600 text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent complaints */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display font-bold text-stone-300 tracking-wide uppercase text-sm">Recent Complaints</h2>
        <Link to="/admin/complaints" className="flex items-center gap-1 text-army-400 hover:text-army-300 text-sm">
          Manage all <ArrowRight size={13} />
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-stone-900 rounded-xl animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {stats?.recentComplaints?.map(c => <ComplaintCard key={c._id} complaint={c} />)}
        </div>
      )}
    </div>
  );
}
