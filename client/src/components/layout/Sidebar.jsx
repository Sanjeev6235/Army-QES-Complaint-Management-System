import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText, PlusCircle, Users, Settings,
  Wrench, ClipboardList, Shield, X, Star
} from 'lucide-react';

const navItems = {
  user: [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/complaint/new', icon: PlusCircle, label: 'New Complaint' },
    { to: '/complaints', icon: ClipboardList, label: 'My Complaints' },
  ],
  engineer: [
    { to: '/engineer/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/engineer/complaints', icon: Wrench, label: 'Assigned Complaints' },
  ],
  admin: [
    { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/complaints', icon: FileText, label: 'All Complaints' },
    { to: '/admin/users', icon: Users, label: 'Manage Users' },
    { to: '/complaint/new', icon: PlusCircle, label: 'New Complaint' },
  ],
};

const roleColors = {
  user: 'text-blue-400',
  engineer: 'text-amber-400',
  admin: 'text-army-400',
};

const roleLabels = {
  user: 'Soldier / Resident',
  engineer: 'Engineer',
  admin: 'Administrator',
};

export default function Sidebar({ onClose }) {
  const { user } = useAuth();
  if (!user) return null;

  const items = navItems[user.role] || [];

  return (
    <div className="w-64 h-full bg-stone-950 border-r border-stone-800/60 flex flex-col">
      {/* Logo */}
      <div className="p-5 border-b border-stone-800/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-army-700 rounded-lg flex items-center justify-center">
              <Shield size={20} className="text-army-200" />
            </div>
            <div>
              <div className="font-display font-bold text-army-300 text-sm tracking-widest">ARMY QES</div>
              <div className="text-xs text-stone-500 font-mono">Engineering Services</div>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-stone-400 hover:text-white">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 mx-3 my-3 rounded-lg bg-stone-900 border border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-army-800 flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-army-300 text-sm">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-stone-200 text-sm truncate">{user.name}</div>
            <div className={`text-xs font-display tracking-wide ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </div>
          </div>
        </div>
        {user.serviceNumber && (
          <div className="mt-2 text-xs font-mono text-stone-500">
            SVC# {user.serviceNumber}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        <div className="text-xs font-display text-stone-600 tracking-widest uppercase px-3 py-1 mb-2">
          Navigation
        </div>
        {items.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={16} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-stone-800/60">
        <div className="text-xs text-stone-600 text-center font-mono">
          QES v1.0 — CLASSIFIED
        </div>
      </div>
    </div>
  );
}
