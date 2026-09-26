import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, CheckCheck, Search, Settings as SettingsIcon, Building2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationsApi } from '../../services/api';
import { Badge } from '../ui/Badge';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await notificationsApi.getAll({ limit: 10 });
      if (res.data?.success) {
        setNotifications(res.data.notifications || []);
        setUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-zoho-border px-6 flex items-center justify-between z-30 shrink-0 select-none shadow-zoho">
      {/* Left: Organization / Hub Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
          <Building2 className="w-3.5 h-3.5 text-zoho-red" />
          <span>StockSense Main Warehouse</span>
        </div>
      </div>

      {/* Center: Zoho Style Top Search Input */}
      <div className="hidden md:flex items-center gap-2 bg-slate-100 px-3.5 py-1.5 rounded-full border border-slate-200 text-slate-500 text-xs w-80 focus-within:ring-2 focus-within:ring-zoho-red/20 focus-within:border-zoho-red">
        <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <input
          type="text"
          placeholder="Search items, SKU, orders..."
          className="bg-transparent text-slate-800 placeholder-slate-400 focus:outline-none w-full text-xs font-medium"
        />
        <kbd className="font-mono text-[9px] bg-white px-1.5 py-0.5 rounded text-slate-500 border border-slate-200">⌘K</kbd>
      </div>

      {/* Right: Notifications, Settings & User Profile */}
      <div className="flex items-center gap-3">
        <Link
          to="/settings"
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg relative transition-colors focus:outline-none"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-zoho-red text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-zoho-border py-2 z-50 animate-in fade-in duration-200 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 bg-slate-50">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800 text-xs">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-50 text-zoho-red text-[10px] px-2 py-0.5 rounded font-bold border border-rose-200">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-xs text-zoho-red hover:underline font-medium flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-xs font-medium">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-3.5 transition-colors hover:bg-slate-50 flex items-start justify-between gap-3 ${
                        !n.isRead ? 'bg-rose-50/30' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <p className="text-xs font-bold text-slate-800">{n.title}</p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                        <p className="text-[10px] font-mono text-slate-400 mt-1">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!n.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(n.id)}
                          className="p-1 text-slate-400 hover:text-emerald-600 rounded"
                          title="Mark read"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="h-5 w-px bg-slate-200" />

        <div className="flex items-center gap-2">
          <Badge variant={user?.role || 'STAFF'} />
          <span className="text-xs font-semibold text-slate-700 hidden sm:inline">{user?.name}</span>
        </div>
      </div>
    </header>
  );
};
