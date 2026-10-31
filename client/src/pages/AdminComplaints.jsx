import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, Trash2, Eye, RefreshCw } from 'lucide-react';
import api from '../utils/api';
import StatusBadge from '../components/common/StatusBadge';
import { getCategoryIcon, getPriorityColor, formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const STATUSES = ['', 'Pending', 'Assigned', 'In Progress', 'Completed'];
const CATEGORIES = ['', 'Water', 'Electricity', 'Furniture', 'Infrastructure', 'Other'];

export default function AdminComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [engineers, setEngineers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category: '', search: '' });
  const [page, setPage] = useState(1);
  const [assignModal, setAssignModal] = useState(null); // complaint id
  const [selectedEng, setSelectedEng] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters, page, limit: 10 };
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const [cr, er] = await Promise.all([
        api.get('/complaints', { params }),
        api.get('/users/engineers')
      ]);
      setComplaints(cr.data.complaints);
      setPagination(cr.data.pagination);
      setEngineers(er.data.engineers);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleAssign = async () => {
    if (!selectedEng) return toast.error('Please select an engineer');
    setAssigning(true);
    try {
      const fd = new FormData();
      fd.append('assignedTo', selectedEng);
      await api.put(`/complaints/${assignModal}`, fd);
      toast.success('Engineer assigned successfully!');
      setAssignModal(null);
      setSelectedEng('');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Assignment failed');
    } finally { setAssigning(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this complaint?')) return;
    try {
      await api.delete(`/complaints/${id}`);
      toast.success('Complaint deleted');
      fetchData();
    } catch (err) { toast.error('Delete failed'); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">All Complaints</h1>
          <p className="text-stone-500 text-sm mt-1">{pagination.total} total records</p>
        </div>
        <button onClick={fetchData} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input className="input-field pl-9 text-sm" placeholder="Search..."
            value={filters.search} onChange={e => { setFilters(p => ({...p, search: e.target.value})); setPage(1); }} />
        </div>
        <select className="input-field text-sm w-36" value={filters.status}
          onChange={e => { setFilters(p => ({...p, status: e.target.value})); setPage(1); }}>
          {STATUSES.map(s => <option key={s} value={s}>{s || 'All Status'}</option>)}
        </select>
        <select className="input-field text-sm w-40" value={filters.category}
          onChange={e => { setFilters(p => ({...p, category: e.target.value})); setPage(1); }}>
          {CATEGORIES.map(c => <option key={c} value={c}>{c || 'All Categories'}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/50">
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Complaint</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Category</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Priority</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Status</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Filed By</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Assigned To</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Date</th>
                <th className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({length:5}).map((_, i) => (
                  <tr key={i} className="border-b border-stone-800/50">
                    {Array.from({length:8}).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-stone-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : complaints.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-stone-500">No complaints found</td></tr>
              ) : complaints.map(c => (
                <tr key={c._id} className="border-b border-stone-800/30 hover:bg-stone-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-stone-200 truncate max-w-36">{c.title}</div>
                    <div className="text-xs font-mono text-stone-600">#{c._id.slice(-6).toUpperCase()}</div>
                  </td>
                  <td className="px-4 py-3 text-stone-400">
                    {getCategoryIcon(c.category)} {c.category}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(c.priority)}`}>
                      {c.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{c.createdBy?.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col items-start gap-1">
                      <span className="text-army-400 text-xs">{c.assignedTo?.name || 'Unassigned'}</span>
                      {c.status !== 'Completed' && (
                        <button onClick={() => { setAssignModal(c._id); setSelectedEng(c.assignedTo?._id || ''); }}
                          className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300">
                          <UserCheck size={11} /> {c.assignedTo ? 'Reassign' : 'Assign'}
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs font-mono">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => navigate(`/complaints/${c._id}`)}
                        className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-700 rounded transition-colors">
                        <Eye size={13} />
                      </button>
                      <button onClick={() => handleDelete(c._id)}
                        className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-700 rounded transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-stone-800">
            <button disabled={page === 1} onClick={() => setPage(p=>p-1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
            <span className="text-sm text-stone-400 font-display">Page {page} of {pagination.pages}</span>
            <button disabled={page === pagination.pages} onClick={() => setPage(p=>p+1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 w-full max-w-sm animate-slide-in">
            <h3 className="font-display font-bold text-stone-200 tracking-wide mb-4">Assign Engineer</h3>
            <select className="input-field mb-4" value={selectedEng} onChange={e => setSelectedEng(e.target.value)}>
              <option value="">Select an engineer</option>
              {engineers.map(e => (
                <option key={e._id} value={e._id}>{e.name} — {e.unit || 'No unit'}</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleAssign} disabled={assigning} className="btn-primary flex-1">
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
