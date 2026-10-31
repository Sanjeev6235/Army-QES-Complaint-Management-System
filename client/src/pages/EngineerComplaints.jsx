import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Eye, Wrench, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/common/StatusBadge';
import { getCategoryIcon, getPriorityColor, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['', 'Assigned', 'In Progress', 'Completed'];

export default function EngineerComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [quickStatus, setQuickStatus] = useState({}); // { [id]: status }
  const [updating, setUpdating] = useState(null);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleQuickUpdate = async (id, status, remark) => {
    setUpdating(id);
    try {
      const fd = new FormData();
      fd.append('status', status);
      await api.put(`/complaints/${id}`, fd);
      toast.success(`Status updated to ${status}`);
      fetchComplaints();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setUpdating(null); }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">Assigned Complaints</h1>
          <p className="text-stone-500 text-sm mt-1">{pagination.total} total tasks</p>
        </div>
        <button onClick={fetchComplaints} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input className="input-field pl-9 text-sm" placeholder="Search complaints..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-field text-sm w-40" value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
      </div>

      {/* Complaints */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4,5].map(i => <div key={i} className="h-28 bg-stone-900 rounded-xl animate-pulse" />)}
        </div>
      ) : complaints.length === 0 ? (
        <div className="card text-center py-14">
          <Wrench size={40} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 font-display tracking-wide">No assigned complaints</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {complaints.map(c => (
              <div key={c._id} className="card border-stone-800 hover:border-stone-700 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xl flex-shrink-0">{getCategoryIcon(c.category)}</span>
                    <div className="min-w-0">
                      <h3 className="font-display font-semibold text-stone-200 tracking-wide truncate">{c.title}</h3>
                      <div className="flex items-center gap-3 mt-0.5">
                        <span className="text-xs font-mono text-stone-500">#{c._id.slice(-6).toUpperCase()}</span>
                        <span className="text-xs text-stone-500">Quarter: {c.location}</span>
                        <span className="text-xs text-stone-500">By: {c.createdBy?.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(c.priority)}`}>
                      {c.priority}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                </div>

                <p className="text-sm text-stone-400 mt-2 line-clamp-2">{c.description}</p>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800">
                  <span className="text-xs text-stone-600 font-mono">{formatDate(c.createdAt)}</span>

                  <div className="flex items-center gap-2">
                    {/* Quick status update */}
                    {c.status !== 'Completed' && (
                      <div className="flex items-center gap-1.5">
                        {c.status === 'Assigned' && (
                          <button
                            onClick={() => handleQuickUpdate(c._id, 'In Progress')}
                            disabled={updating === c._id}
                            className="text-xs px-2.5 py-1 bg-orange-900/40 text-orange-300 border border-orange-800/50 rounded-lg hover:bg-orange-900/60 transition-colors font-display tracking-wide disabled:opacity-50"
                          >
                            {updating === c._id ? '...' : 'Start Work'}
                          </button>
                        )}
                        {c.status === 'In Progress' && (
                          <button
                            onClick={() => handleQuickUpdate(c._id, 'Completed')}
                            disabled={updating === c._id}
                            className="text-xs px-2.5 py-1 bg-army-900/40 text-army-300 border border-army-800/50 rounded-lg hover:bg-army-900/60 transition-colors font-display tracking-wide disabled:opacity-50"
                          >
                            {updating === c._id ? '...' : 'Mark Complete'}
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      onClick={() => navigate(`/complaints/${c._id}`)}
                      className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-200 px-2.5 py-1 bg-stone-800 rounded-lg transition-colors"
                    >
                      <Eye size={11} /> Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
              <span className="text-sm text-stone-400 font-display">Page {page} of {pagination.pages}</span>
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
