import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Shield,
  Target,
  Users,
  Building2,
  FileText,
  Database,
  Bell,
  Settings,
  Headphones,
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Executive Dashboard', description: 'Unified oversight view', path: '/', icon: LayoutDashboard },
  { id: 'assessments', label: 'Assessments', description: 'Run + monitor initiatives', path: '/assessments', icon: Shield },
  { id: 'frameworks', label: 'Frameworks', description: 'Map controls + evidence', path: '/frameworks', icon: Target },
  { id: 'organizations', label: 'Organizations', description: 'Tenant + entity access', path: '/organizations', icon: Building2 },
  { id: 'users', label: 'User Access', description: 'Roles, SSO & policies', path: '/users', icon: Users },
  { id: 'documents', label: 'Evidence Library', description: 'Bulk upload + AI tagging', path: '/documents', icon: FileText },
  { id: 'database', label: 'Data Operations', description: 'Pipelines + verifications', path: '/database', icon: Database },
  { id: 'notifications', label: 'Notifications', description: 'Alerting & comms hub', path: '/notifications', icon: Bell },
];

const supportLinks = [
  { label: 'Mission Control', detail: 'Live reliability board', action: 'Open Mission Deck', icon: Target },
  { label: 'Priority Support', detail: 'SLA < 2 min', action: 'Contact Control Tower', icon: Headphones },
];

const GlassSidebarEnhanced = () => {
  const location = useLocation();

  const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));

  return (
    <aside className="hidden lg:flex flex-col w-80 bg-white/10 backdrop-blur-2xl border-r border-white/10 text-white min-h-screen p-6 space-y-6">
      <div className="space-y-4">
        <p className="text-sm uppercase tracking-[0.4em] text-purple-200">GRC Command</p>
        <div className="bg-gradient-to-br from-purple-500/40 via-blue-500/40 to-pink-500/40 rounded-3xl p-6 shadow-2xl border border-white/20">
          <p className="text-purple-100 text-sm mb-1">Enterprise Status</p>
          <p className="text-2xl font-bold leading-tight">World-Class</p>
          <p className="text-xs text-purple-200 mt-2">Real-time controls, assessments & alerts synchronized</p>
          <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-purple-50">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
              <p className="text-sm font-semibold">Controls</p>
              <p className="text-lg font-bold">1,284</p>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 border border-white/20">
              <p className="text-sm font-semibold">Assessments</p>
              <p className="text-lg font-bold">342</p>
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <NavLink
              key={item.id}
              to={item.path}
              className={`block rounded-3xl border transition-all duration-300 px-5 py-4 ${
                active
                  ? 'bg-gradient-to-r from-white/90 to-white/60 text-slate-900 border-white'
                  : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10 hover:border-white/30'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl ${
                    active ? 'bg-slate-900/10 text-slate-900' : 'bg-white/10 text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold ${active ? 'text-slate-900' : 'text-white'}`}>{item.label}</p>
                  <p className={`text-xs ${active ? 'text-slate-600' : 'text-white/60'}`}>{item.description}</p>
                </div>
                {active && (
                  <span className="text-xs font-semibold text-slate-500 bg-white/60 rounded-full px-3 py-1">Live</span>
                )}
              </div>
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3">
        {supportLinks.map((link) => {
          const Icon = link.icon;
          return (
            <div key={link.label} className="rounded-3xl border border-white/10 bg-white/5 p-4 flex items-center gap-4">
              <div className="p-2 rounded-2xl bg-white/10">
                <Icon className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{link.label}</p>
                <p className="text-xs text-white/70">{link.detail}</p>
              </div>
              <button className="text-xs font-semibold text-white/80 bg-white/10 px-3 py-1 rounded-full hover:bg-white/20 transition">
                {link.action}
              </button>
            </div>
          );
        })}
      </div>

      <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-4 space-y-2">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>Next Sync Window</span>
          <span>02:00 UTC</span>
        </div>
        <div className="text-lg font-semibold">AI Scheduler Engaged</div>
        <p className="text-xs text-white/70">Real-time escalations routed to command queue</p>
        <div className="flex items-center gap-2 text-xs text-white/70">
          <Settings className="h-4 w-4" />
          Advanced automation and observability active
        </div>
      </div>
    </aside>
  );
};

export default GlassSidebarEnhanced;
