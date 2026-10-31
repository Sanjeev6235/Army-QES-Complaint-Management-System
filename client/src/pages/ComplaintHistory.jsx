import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import ComplaintCard from '../components/complaints/ComplaintCard';

const STATUSES = ['', 'Pending', 'Assigned', 'In Progress', 'Completed'];
const CATEGORIES = ['', 'Water', 'Electricity', 'Furniture', 'Infrastructure', 'Other'];
const PRIORITIES = ['', 'Low', 'Medium', 'High'];

export default function ComplaintHistory() {
  const [complaints, setComplaints] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', priority: '', search: '' });
  const [page, setPage] = useState(1);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 9 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/complaints', { params });
      setComplaints(res.data.complaints);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);

  const handleFilter = (key, val) => {
    setFilters(p => ({ ...p, [key]: val }));
    setPage(1);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">My Complaints</h1>
          <p className="text-stone-500 text-sm mt-1">{pagination.total} total records</p>
        </div>
        <button onClick={fetchComplaints} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input
            className="input-field pl-9"
            placeholder="Search complaints..."
            value={filters.search}
            onChange={e => handleFilter('search', e.target.value)}
          />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <select className="input-field text-sm" value={filters.status} onChange={e => handleFilter('status', e.target.value)}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
          </select>
          <select className="input-field text-sm" value={filters.category} onChange={e => handleFilter('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
          </select>
          <select className="input-field text-sm" value={filters.priority} onChange={e => handleFilter('priority', e.target.value)}>
            {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-stone-900 rounded-xl animate-pulse" />)}
        </div>
      ) : complaints.length ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map(c => <ComplaintCard key={c._id} complaint={c} />)}
          </div>
          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Prev</button>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`px-3 py-1.5 text-sm rounded-lg font-display ${p === page ? 'bg-army-700 text-white' : 'btn-secondary'}`}>
                  {p}
                </button>
              ))}
              <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      ) : (
        <div className="card text-center py-16">
          <Filter size={40} className="text-stone-700 mx-auto mb-3" />
          <p className="text-stone-500 font-display tracking-wide">No complaints found</p>
          <p className="text-stone-600 text-sm mt-1">Try adjusting your filters</p>
        </div>
      )}
    </div>
  );
}
