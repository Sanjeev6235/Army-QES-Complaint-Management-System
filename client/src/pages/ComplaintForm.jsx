import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, AlertTriangle, Send } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const CATEGORIES = ['Water', 'Electricity', 'Furniture', 'Infrastructure', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export default function ComplaintForm() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: '', description: '', category: '', location: user?.quarterNumber || '', priority: 'Medium'
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const handleImages = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) return toast.error('Max 5 images allowed');
    setImages(prev => [...prev, ...files]);
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (idx) => {
    setImages(p => p.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    if (!form.category) errs.category = 'Select a category';
    if (!form.location.trim()) errs.location = 'Quarter number is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      await api.post('/complaints', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Complaint submitted successfully!');
      navigate(user?.role === 'admin' ? '/admin/complaints' : '/complaints');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="page-header">
        <h1 className="section-title">File a Complaint</h1>
        <p className="text-stone-500 text-sm mt-1">Submit your engineering service request</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Title */}
        <div>
          <label className="label">Complaint Title *</label>
          <input name="title" className={`input-field ${errors.title ? 'border-red-700' : ''}`}
            placeholder="e.g. Water leakage in bathroom" value={form.title} onChange={handleChange} />
          {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Category *</label>
            <select name="category" className={`input-field ${errors.category ? 'border-red-700' : ''}`}
              value={form.category} onChange={handleChange}>
              <option value="">Select category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category}</p>}
          </div>
          <div>
            <label className="label">Priority *</label>
            <select name="priority" className="input-field" value={form.priority} onChange={handleChange}>
              {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="label">Quarter Number / Location *</label>
          <input name="location" className={`input-field ${errors.location ? 'border-red-700' : ''}`}
            placeholder="e.g. A-204" value={form.location} onChange={handleChange} />
          {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="label">Description *</label>
          <textarea name="description" rows={4} className={`input-field resize-none ${errors.description ? 'border-red-700' : ''}`}
            placeholder="Describe the problem in detail..." value={form.description} onChange={handleChange} />
          {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
        </div>

        {/* Priority warning */}
        {form.priority === 'High' && (
          <div className="flex items-center gap-2 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2.5">
            <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-red-300 text-xs">High priority complaints are escalated to senior officers.</p>
          </div>
        )}

        {/* Image upload */}
        <div>
          <label className="label">Attach Images (max 5)</label>
          <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-stone-700 rounded-xl cursor-pointer hover:border-army-600 hover:bg-army-950/20 transition-all">
            <Upload size={20} className="text-stone-500 mb-1" />
            <span className="text-xs text-stone-500">Click to upload images</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImages} />
          </label>

          {previews.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-stone-700">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)}
                    className="absolute top-0.5 right-0.5 bg-red-800 rounded-full p-0.5 hover:bg-red-700">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2" disabled={loading}>
            {loading ? 'Submitting...' : <><Send size={15} /> Submit Complaint</>}
          </button>
        </div>
      </form>
    </div>
  );
}
