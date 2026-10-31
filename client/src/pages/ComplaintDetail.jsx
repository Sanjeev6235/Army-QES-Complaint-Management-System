import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, User, AlertTriangle, MessageSquare, Camera, Send, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import StatusBadge from '../components/common/StatusBadge';
import { getCategoryIcon, getPriorityColor, formatDateTime, timeAgo } from '../utils/helpers';
import toast from 'react-hot-toast';

const ENGINEER_STATUSES = ['In Progress', 'Completed'];
const ADMIN_STATUSES = ['Pending', 'Assigned', 'In Progress', 'Completed'];

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState(null);
  const [engineers, setEngineers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [remark, setRemark] = useState('');
  const [selectedEngineer, setSelectedEngineer] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [afterImages, setAfterImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [imageModal, setImageModal] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/complaints/${id}`);
        setComplaint(res.data.complaint);
        setSelectedStatus(res.data.complaint.status);
      } catch { toast.error('Failed to load complaint'); }
      finally { setLoading(false); }
    };
    fetchData();
    if (user.role === 'admin') {
      api.get('/users/engineers').then(r => setEngineers(r.data.engineers)).catch(() => {});
    }
  }, [id, user.role]);

  const handleUpdate = async () => {
    setSubmitting(true);
    try {
      const fd = new FormData();
      if (remark.trim()) fd.append('remark', remark);
      if (user.role === 'admin' && selectedEngineer) fd.append('assignedTo', selectedEngineer);
      if (user.role === 'engineer' && selectedStatus) fd.append('status', selectedStatus);
      if (user.role === 'admin' && selectedStatus !== complaint.status && !selectedEngineer) fd.append('status', selectedStatus);
      afterImages.forEach(img => fd.append('afterImages', img));

      const res = await api.put(`/complaints/${id}`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setComplaint(res.data.complaint);
      setRemark('');
      setAfterImages([]);
      toast.success('Complaint updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally { setSubmitting(false); }
  };

  if (loading) return (
    <div className="max-w-3xl mx-auto space-y-4">
      {[1,2,3].map(i => <div key={i} className="h-28 bg-stone-900 rounded-xl animate-pulse" />)}
    </div>
  );

  if (!complaint) return (
    <div className="text-center py-20 text-stone-500">Complaint not found</div>
  );

  const canUpdate = user.role === 'admin' || (user.role === 'engineer' && complaint.assignedTo?._id === user._id);

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => navigate(-1)} className="text-stone-400 hover:text-white">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-lg font-bold text-stone-100 tracking-wide">{complaint.title}</h1>
          <p className="text-xs font-mono text-stone-500">#{complaint._id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={complaint.status} /></div>
      </div>

      {/* Main info */}
      <div className="card mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">{getCategoryIcon(complaint.category)}</span>
          <span className="font-display text-stone-300 tracking-wide">{complaint.category}</span>
          <span className={`ml-auto flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(complaint.priority)}`}>
            <AlertTriangle size={10} /> {complaint.priority}
          </span>
        </div>

        <p className="text-stone-300 text-sm leading-relaxed mb-4">{complaint.description}</p>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-stone-400">
            <MapPin size={13} className="text-stone-600" />
            <span>Quarter {complaint.location}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <Calendar size={13} className="text-stone-600" />
            <span>{formatDateTime(complaint.createdAt)}</span>
          </div>
          <div className="flex items-center gap-2 text-stone-400">
            <User size={13} className="text-stone-600" />
            <span>{complaint.createdBy?.name}</span>
          </div>
          {complaint.assignedTo && (
            <div className="flex items-center gap-2 text-army-400">
              <User size={13} className="text-army-600" />
              <span>Assigned: {complaint.assignedTo.name}</span>
            </div>
          )}
        </div>
      </div>

      {/* Before images */}
      {complaint.images?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-display text-sm font-bold text-stone-400 tracking-widest uppercase mb-3">Submitted Images</h3>
          <div className="flex flex-wrap gap-2">
            {complaint.images.map((img, i) => (
              <img key={i} src={img.path} alt="complaint" onClick={() => setImageModal(img.path)}
                className="w-24 h-24 object-cover rounded-lg border border-stone-700 cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </div>
        </div>
      )}

      {/* After images */}
      {complaint.afterImages?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-display text-sm font-bold text-army-500 tracking-widest uppercase mb-3">After Repair Images</h3>
          <div className="flex flex-wrap gap-2">
            {complaint.afterImages.map((img, i) => (
              <img key={i} src={img.path} alt="after repair" onClick={() => setImageModal(img.path)}
                className="w-24 h-24 object-cover rounded-lg border border-army-800 cursor-pointer hover:opacity-80 transition-opacity" />
            ))}
          </div>
        </div>
      )}

      {/* Remarks */}
      {complaint.remarks?.length > 0 && (
        <div className="card mb-4">
          <h3 className="font-display text-sm font-bold text-stone-400 tracking-widest uppercase mb-3 flex items-center gap-2">
            <MessageSquare size={14} /> Remarks ({complaint.remarks.length})
          </h3>
          <div className="space-y-3">
            {complaint.remarks.map((r, i) => (
              <div key={i} className="bg-stone-800/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-stone-400">{r.addedBy?.name} <span className="text-stone-600 capitalize">({r.addedBy?.role})</span></span>
                  <span className="text-xs text-stone-600 font-mono">{timeAgo(r.addedAt)}</span>
                </div>
                <p className="text-sm text-stone-300">{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Update panel for admin/engineer */}
      {canUpdate && (
        <div className="card border-army-900/50">
          <h3 className="font-display text-sm font-bold text-army-400 tracking-widest uppercase mb-4">Update Complaint</h3>

          <div className="space-y-3">
            {/* Admin: assign engineer */}
            {user.role === 'admin' && (
              <div>
                <label className="label">Assign Engineer</label>
                <select className="input-field" value={selectedEngineer} onChange={e => setSelectedEngineer(e.target.value)}>
                  <option value="">Select engineer</option>
                  {engineers.map(eng => (
                    <option key={eng._id} value={eng._id}>{eng.name} — {eng.unit || 'No unit'}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Status update */}
            <div>
              <label className="label">Update Status</label>
              <select className="input-field" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                {(user.role === 'admin' ? ADMIN_STATUSES : ENGINEER_STATUSES).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Remark */}
            <div>
              <label className="label">Add Remark</label>
              <textarea rows={3} className="input-field resize-none" placeholder="Add a remark or update..."
                value={remark} onChange={e => setRemark(e.target.value)} />
            </div>

            {/* After images (engineer) */}
            {user.role === 'engineer' && (
              <div>
                <label className="label">Upload After-Repair Images</label>
                <label className="flex items-center gap-2 cursor-pointer text-sm text-stone-400 hover:text-stone-200 bg-stone-800 border border-stone-700 rounded-lg px-4 py-2.5 transition-colors w-fit">
                  <Camera size={15} /> Choose images
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={e => setAfterImages(Array.from(e.target.files))} />
                </label>
                {afterImages.length > 0 && (
                  <p className="text-xs text-army-400 mt-1">{afterImages.length} file(s) selected</p>
                )}
              </div>
            )}

            <button onClick={handleUpdate} disabled={submitting} className="btn-primary flex items-center gap-2 w-full justify-center">
              {submitting ? 'Updating...' : <><Send size={14} /> Submit Update</>}
            </button>
          </div>
        </div>
      )}

      {/* Image modal */}
      {imageModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setImageModal(null)}>
          <img src={imageModal} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}
    </div>
  );
}
