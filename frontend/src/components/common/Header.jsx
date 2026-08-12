import React, { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { LogOut, User as UserIcon, Shield, Bell, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-30 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
            JobMatch AI
          </span>
          <span className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            BIT Final Year Project
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {user && (
          <>
            <div className="hidden sm:flex items-center space-x-3 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/60">
              {user.role === 'admin' ? (
                <Shield className="w-4 h-4 text-emerald-400" />
              ) : (
                <UserIcon className="w-4 h-4 text-blue-400" />
              )}
              <div className="text-sm">
                <p className="font-semibold text-slate-200 leading-none">{user.name}</p>
                <p className="text-xs text-slate-400 capitalize">{user.role} Account</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-red-400 bg-slate-800 hover:bg-slate-800/80 rounded-lg border border-slate-700 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Logout</span>
            </button>
          </>
        )}
      </div>
    </header>
  );
}
