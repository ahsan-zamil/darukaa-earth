import React from 'react';
import { useAuth } from '../../context/useAuth';
import { Globe, Bell, Search, LogOut, User as UserIcon } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="h-16 bg-[#0e1913] border-b border-[#1d3326] sticky top-0 z-40 flex items-center justify-between px-6">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-900/30">
          <Globe className="w-6 h-6 text-white animate-pulse" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-wide flex items-center gap-1.5">
            Darukaa<span className="text-emerald-400">.Earth</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">
            Carbon & Biodiversity Intelligence
          </p>
        </div>
      </div>

      {/* Quick Search */}
      <div className="hidden md:flex items-center relative w-72">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <input
          type="text"
          placeholder="Search projects, sites..."
          className="w-full pl-9 pr-4 py-1.5 text-xs bg-[#121f17] border border-[#1d3326] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        <button
          className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          title="Notifications"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-3 border-l border-[#1d3326]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-700/40 border border-emerald-500/30 flex items-center justify-center text-emerald-300 font-semibold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
            </div>
            <div className="hidden sm:block text-left">
              <div className="text-xs font-semibold text-white leading-tight">{user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-emerald-400 font-medium">{user?.role || 'Admin'}</div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
