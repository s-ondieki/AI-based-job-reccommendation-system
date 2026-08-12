import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Briefcase, 
  Sparkles, 
  Target, 
  BookOpen, 
  Map, 
  BookmarkCheck, 
  Send, 
  ShieldCheck, 
  Layers, 
  GraduationCap, 
  Users, 
  BarChart3,
  Settings
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const seekerLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/recommendations', label: 'AI Match Hub', icon: Sparkles },
    { to: '/profile', label: 'My Profile', icon: User },
    { to: '/resume', label: 'Resume Extractor', icon: FileText },
    { to: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { to: '/skill-gap', label: 'Skill Gap Analysis', icon: Target },
    { to: '/learning', label: 'Learning Center', icon: BookOpen },
    { to: '/roadmap', label: 'Career Roadmap', icon: Map },
    { to: '/applications', label: 'Applications Tracker', icon: Send },
    { to: '/saved-jobs', label: 'Saved Jobs', icon: BookmarkCheck }
  ];

  const adminLinks = [
    { to: '/admin', label: 'Admin Dashboard', icon: ShieldCheck },
    { to: '/admin/jobs', label: 'Manage Jobs', icon: Briefcase },
    { to: '/admin/skills', label: 'Skill Dictionary', icon: Layers },
    { to: '/admin/learning', label: 'Learning Resources', icon: GraduationCap },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/analytics', label: 'AI Evaluation & Analytics', icon: BarChart3 }
  ];

  const links = user.role === 'admin' ? adminLinks : seekerLinks;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-4rem)] p-4">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 px-3">
        {user.role === 'admin' ? 'Administration' : 'Job Seeker Workspace'}
      </div>

      <nav className="space-y-1 flex-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="pt-4 border-t border-slate-800 mt-auto">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
              isActive
                ? 'bg-blue-600/20 text-blue-400'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>System Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}
