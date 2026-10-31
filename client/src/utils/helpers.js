export const getStatusBadge = (status) => {
  const map = {
    'Pending':     'badge-pending',
    'Assigned':    'badge-assigned',
    'In Progress': 'badge-progress',
    'Completed':   'badge-completed',
  };
  return map[status] || 'badge-pending';
};

export const getPriorityColor = (priority) => {
  const map = {
    'High':   'text-red-400 bg-red-900/30 border-red-800/50',
    'Medium': 'text-amber-400 bg-amber-900/30 border-amber-800/50',
    'Low':    'text-army-400 bg-army-900/30 border-army-800/50',
  };
  return map[priority] || '';
};

export const getCategoryIcon = (category) => {
  const map = {
    'Water':          '💧',
    'Electricity':    '⚡',
    'Furniture':      '🪑',
    'Infrastructure': '🏗️',
    'Other':          '🔧',
  };
  return map[category] || '📋';
};

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric'
  });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
};

export const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};
