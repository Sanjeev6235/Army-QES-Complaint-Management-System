export default function StatCard({ icon: Icon, label, value, color = 'army', sub }) {
  const colorMap = {
    army:   { bg: 'bg-army-900/40',   border: 'border-army-800/40',   text: 'text-army-300',   icon: 'bg-army-800/60' },
    amber:  { bg: 'bg-amber-900/30',  border: 'border-amber-800/40',  text: 'text-amber-300',  icon: 'bg-amber-900/60' },
    blue:   { bg: 'bg-blue-900/30',   border: 'border-blue-800/40',   text: 'text-blue-300',   icon: 'bg-blue-900/60' },
    orange: { bg: 'bg-orange-900/30', border: 'border-orange-800/40', text: 'text-orange-300', icon: 'bg-orange-900/60' },
    red:    { bg: 'bg-red-900/30',    border: 'border-red-800/40',    text: 'text-red-300',    icon: 'bg-red-900/60' },
    stone:  { bg: 'bg-stone-900',     border: 'border-stone-800',     text: 'text-stone-300',  icon: 'bg-stone-800' },
  };
  const c = colorMap[color] || colorMap.army;

  return (
    <div className={`rounded-xl p-4 border ${c.bg} ${c.border} flex items-center gap-4`}>
      <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
        <Icon size={20} className={c.text} />
      </div>
      <div>
        <div className={`font-display text-2xl font-bold ${c.text}`}>{value ?? '—'}</div>
        <div className="text-xs text-stone-500 font-display tracking-wide uppercase">{label}</div>
        {sub && <div className="text-xs text-stone-600 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
