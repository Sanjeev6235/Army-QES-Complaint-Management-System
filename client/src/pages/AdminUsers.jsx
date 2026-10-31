import { useState, useEffect, useCallback } from 'react';
import { Search, UserPlus, Shield, Wrench, User, Trash2, Edit2, X, Check } from 'lucide-react';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';

const ROLES = ['user', 'engineer', 'admin'];

const roleStyle = {
  admin:    'bg-army-900/50 text-army-300 border-army-700/50',
  engineer: 'bg-amber-900/40 text-amber-300 border-amber-700/50',
  user:     'bg-blue-900/40 text-blue-300 border-blue-700/50',
};

const RoleIcon = ({ role }) => {
  if (role === 'admin') return <Shield size={12} />;
  if (role === 'engineer') return <Wrench size={12} />;
  return <User size={12} />;
};

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [editingRole, setEditingRole] = useState(null); // user id
  const [newRole, setNewRole] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'user', serviceNumber: '', unit: '', quarterNumber: '' });
  const [creating, setCreating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      const res = await api.get('/users', { params });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [page, search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleRoleUpdate = async (userId) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      toast.success('Role updated successfully');
      setEditingRole(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Role update failed');
    }
  };

  const handleDeactivate = async (userId, name) => {
    if (!confirm(`Deactivate account of ${name}?`)) return;
    try {
      await api.delete(`/users/${userId}`);
      toast.success('User deactivated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await api.post('/users/create', createForm);
      toast.success('User created successfully');
      setShowCreateModal(false);
      setCreateForm({ name: '', email: '', password: '', role: 'user', serviceNumber: '', unit: '', quarterNumber: '' });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    } finally { setCreating(false); }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="section-title">Manage Users</h1>
          <p className="text-stone-500 text-sm mt-1">{pagination.total} registered accounts</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <UserPlus size={15} /> Create User
        </button>
      </div>

      {/* Filters */}
      <div className="card mb-5 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-500" />
          <input className="input-field pl-9 text-sm" placeholder="Search by name, email, service number..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input-field text-sm w-36" value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-800 bg-stone-900/50">
                {['Name', 'Email', 'Service No.', 'Unit', 'Quarter', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-display text-xs text-stone-500 tracking-widest uppercase whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-stone-800/50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-stone-800 rounded animate-pulse" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-12 text-stone-500">No users found</td></tr>
              ) : users.map(u => (
                <tr key={u._id} className="border-b border-stone-800/30 hover:bg-stone-800/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-stone-800 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-stone-400">{u.name?.charAt(0).toUpperCase()}</span>
                      </div>
                      <span className="font-semibold text-stone-200 whitespace-nowrap">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-stone-400 text-xs">{u.email}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs font-mono">{u.serviceNumber || '—'}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{u.unit || '—'}</td>
                  <td className="px-4 py-3 text-stone-500 text-xs">{u.quarterNumber || '—'}</td>
                  <td className="px-4 py-3">
                    {editingRole === u._id ? (
                      <div className="flex items-center gap-1">
                        <select className="bg-stone-800 border border-stone-700 rounded text-xs px-2 py-1 text-stone-200"
                          value={newRole} onChange={e => setNewRole(e.target.value)}>
                          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <button onClick={() => handleRoleUpdate(u._id)} className="p-1 text-army-400 hover:text-army-300"><Check size={13} /></button>
                        <button onClick={() => setEditingRole(null)} className="p-1 text-stone-500 hover:text-stone-300"><X size={13} /></button>
                      </div>
                    ) : (
                      <button
                        onClick={() => { setEditingRole(u._id); setNewRole(u.role); }}
                        className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border capitalize transition-colors hover:opacity-80 ${roleStyle[u.role]}`}
                        disabled={u._id === currentUser._id}
                      >
                        <RoleIcon role={u.role} /> {u.role}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-3 text-stone-500 text-xs font-mono whitespace-nowrap">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${u.isActive ? 'bg-army-900/40 text-army-300 border-army-700/40' : 'bg-red-900/40 text-red-300 border-red-700/40'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {u._id !== currentUser._id && u.isActive && (
                      <button onClick={() => handleDeactivate(u._id, u.name)}
                        className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-700 rounded transition-colors">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-stone-800">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Prev</button>
            <span className="text-sm text-stone-400 font-display">Page {page} of {pagination.pages}</span>
            <button disabled={page === pagination.pages} onClick={() => setPage(p => p + 1)} className="btn-secondary px-3 py-1.5 text-xs disabled:opacity-40">Next</button>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-6 w-full max-w-md animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-stone-200 tracking-wide text-lg uppercase">Create User</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-stone-500 hover:text-stone-200">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Full Name *</label>
                  <input className="input-field" placeholder="Name" required
                    value={createForm.name} onChange={e => setCreateForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label">Email *</label>
                  <input type="email" className="input-field" placeholder="email@army.mil" required
                    value={createForm.email} onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Password * (minimum 8 characters)</label>
                  <input type="password" className="input-field" placeholder="Create a secure password" required minLength={8}
                    value={createForm.password} onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Role *</label>
                  <select className="input-field" value={createForm.role}
                    onChange={e => setCreateForm(p => ({ ...p, role: e.target.value }))}>
                    {ROLES.map(r => <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Service No.</label>
                  <input className="input-field" placeholder="IC-12345"
                    value={createForm.serviceNumber} onChange={e => setCreateForm(p => ({ ...p, serviceNumber: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Unit</label>
                  <input className="input-field" placeholder="7 Inf Bde"
                    value={createForm.unit} onChange={e => setCreateForm(p => ({ ...p, unit: e.target.value }))} />
                </div>
                <div className="col-span-2">
                  <label className="label">Quarter No.</label>
                  <input className="input-field" placeholder="A-204"
                    value={createForm.quarterNumber} onChange={e => setCreateForm(p => ({ ...p, quarterNumber: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={creating} className="btn-primary flex-1">
                  {creating ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
