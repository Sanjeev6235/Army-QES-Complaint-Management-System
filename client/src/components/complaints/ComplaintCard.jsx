import { useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User, AlertTriangle } from 'lucide-react';
import StatusBadge from '../common/StatusBadge';
import { getCategoryIcon, getPriorityColor, formatDate } from '../../utils/helpers';

export default function ComplaintCard({ complaint }) {
  const navigate = useNavigate();

  return (
    <div
      className="card-hover animate-fade-in"
      onClick={() => navigate(`/complaints/${complaint._id}`)}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0">{getCategoryIcon(complaint.category)}</span>
          <div className="min-w-0">
            <h3 className="font-display font-semibold text-stone-200 text-base tracking-wide truncate">
              {complaint.title}
            </h3>
            <span className="text-xs font-mono text-stone-500">#{complaint._id?.slice(-6).toUpperCase()}</span>
          </div>
        </div>
        <StatusBadge status={complaint.status} />
      </div>

      <p className="text-sm text-stone-400 line-clamp-2 mb-3">{complaint.description}</p>

      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-stone-500">
        <span className="flex items-center gap-1">
          <MapPin size={11} /> {complaint.location}
        </span>
        <span className="flex items-center gap-1">
          <Calendar size={11} /> {formatDate(complaint.createdAt)}
        </span>
        {complaint.createdBy && (
          <span className="flex items-center gap-1">
            <User size={11} /> {complaint.createdBy.name}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-stone-500">{complaint.category}</span>
        </div>
        <span className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full border ${getPriorityColor(complaint.priority)}`}>
          <AlertTriangle size={10} /> {complaint.priority}
        </span>
      </div>
    </div>
  );
}
