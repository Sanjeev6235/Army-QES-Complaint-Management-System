import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut, User, ChevronDown, CheckCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { timeAgo } from '../../utils/helpers';

export default function Navbar({ onMenuClick }) {
  const { user, logout } = useAuth();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getNotifIcon = (type) => {
    const map = {
      complaint_assigned: '📋',
      status_updated: '🔄',
      complaint_completed: '✅',
      remark_added: '💬',
      complaint_created: '🆕',
    };
    return map[type] || '🔔';
  };

  return (
    <header className="h-14 bg-stone-950 border-b border-stone-800/60 flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden text-stone-400 hover:text-white p-1">
          <Menu size={20} />
        </button>
        <div className="hidden sm:block">
          <span className="font-display text-xs tracking-widest text-stone-500 uppercase">
            Army Quarter Engineering Services
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(v => !v); setProfileOpen(false); }}
            className="relative p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-army-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 w-80 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-in">
              <div className="flex items-center justify-between px-4 py-3 border-b border-stone-800">
                <span className="font-display font-bold text-stone-200 tracking-wide">Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-army-400 hover:text-army-300">
                    <CheckCheck size={12} /> Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-stone-500 text-sm">No notifications</div>
                ) : notifications.map(n => (
                  <div
                    key={n._id}
                    onClick={() => {
                      markRead(n._id);
                      if (n.complaint) navigate(`/complaints/${n.complaint._id || n.complaint}`);
                      setNotifOpen(false);
                    }}
                    className={`px-4 py-3 border-b border-stone-800/50 cursor-pointer hover:bg-stone-800/50 transition-colors ${!n.isRead ? 'bg-army-950/30' : ''}`}
                  >
                    <div className="flex gap-2">
                      <span className="text-base flex-shrink-0">{getNotifIcon(n.type)}</span>
                      <div className="min-w-0">
                        <p className={`text-sm leading-tight ${!n.isRead ? 'text-stone-200' : 'text-stone-400'}`}>
                          {n.message}
                        </p>
                        <p className="text-xs text-stone-600 mt-0.5 font-mono">{timeAgo(n.createdAt)}</p>
                      </div>
                      {!n.isRead && <div className="w-1.5 h-1.5 bg-army-400 rounded-full flex-shrink-0 mt-1.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(v => !v); setNotifOpen(false); }}
            className="flex items-center gap-2 px-3 py-1.5 text-stone-400 hover:text-stone-100 hover:bg-stone-800 rounded-lg transition-colors"
          >
            <div className="w-7 h-7 bg-army-800 rounded-full flex items-center justify-center">
              <span className="font-display text-army-300 text-xs font-bold">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="hidden sm:block text-sm font-semibold">{user?.name?.split(' ')[0]}</span>
            <ChevronDown size={14} />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-12 w-48 bg-stone-900 border border-stone-700 rounded-xl shadow-2xl z-50 overflow-hidden animate-slide-in">
              <div className="px-4 py-3 border-b border-stone-800">
                <p className="text-sm font-semibold text-stone-200">{user?.name}</p>
                <p className="text-xs text-stone-500 capitalize">{user?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-stone-800 transition-colors"
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
