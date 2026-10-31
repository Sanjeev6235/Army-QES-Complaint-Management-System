import { Clock, UserCheck, Wrench, CheckCircle2 } from 'lucide-react';

const config = {
  'Pending':     { cls: 'badge-pending',   Icon: Clock,        dot: 'bg-amber-400' },
  'Assigned':    { cls: 'badge-assigned',  Icon: UserCheck,    dot: 'bg-blue-400' },
  'In Progress': { cls: 'badge-progress',  Icon: Wrench,       dot: 'bg-orange-400' },
  'Completed':   { cls: 'badge-completed', Icon: CheckCircle2, dot: 'bg-army-400' },
};

export default function StatusBadge({ status }) {
  const cfg = config[status] || config['Pending'];
  const { cls, Icon, dot } = cfg;
  return (
    <span className={cls}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot} inline-block`} />
      {status}
    </span>
  );
}
