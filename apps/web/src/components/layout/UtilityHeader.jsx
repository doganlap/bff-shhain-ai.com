import React from 'react';
import { useApp } from '../../context/AppContext';
import { Search, ShieldCheck, Building, UserCircle } from 'lucide-react';

const UtilityHeader = () => {
  const { state } = useApp();
  const { user, currentTenant } = state;

  return (
    <div className="utility-header-glass">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Global Search..."
            className="w-64 pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
          />
        </div>
        <a href="/status" className="flex items-center gap-2 text-sm text-gray-200 hover:text-white transition-colors">
          <ShieldCheck className="w-5 h-5" />
          <span>System Status</span>
        </a>
      </div>
      <div className="flex items-center gap-6">
        {currentTenant && (
          <div className="flex items-center gap-2 text-sm">
            <Building className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-200">{currentTenant.name}</span>
          </div>
        )}
        {user && (
          <div className="flex items-center gap-3">
            <UserCircle className="w-8 h-8 text-white" />
            <div>
              <p className="font-semibold text-white">{user.first_name} {user.last_name}</p>
              <p className="text-xs text-gray-300">{user.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UtilityHeader;
