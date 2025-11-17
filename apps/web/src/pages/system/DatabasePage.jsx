import React from 'react';
import { Link } from 'react-router-dom';
import { Database, Users, Building2, Shield, FileText, Activity, Table } from 'lucide-react';

const DatabasePage = () => {
  const commonTables = [
    { name: 'users', label: 'Users', icon: Users, description: 'User accounts and profiles' },
    { name: 'organizations', label: 'Organizations', icon: Building2, description: 'Organization and tenant data' },
    { name: 'roles', label: 'Roles & Permissions', icon: Shield, description: 'Role-based access control' },
    { name: 'assessments', label: 'Assessments', icon: FileText, description: 'GRC assessment records' },
    { name: 'frameworks', label: 'Frameworks', icon: Database, description: 'Compliance frameworks' },
    { name: 'audit_logs', label: 'Audit Logs', icon: Activity, description: 'System audit trail' }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Database Management</h1>
          <p className="text-gray-600">View and manage database tables with the Universal Table Viewer</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {commonTables.map((table) => {
            const Icon = table.icon;
            return (
              <Link
                key={table.name}
                to={`/app/tables/${table.name}`}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
                      <Icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{table.label}</h3>
                      <p className="text-sm text-gray-500">{table.description}</p>
                    </div>
                  </div>
                  <Table className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">View Table</span>
                  <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                    →
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <Table className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">Universal Table Viewer</h3>
          </div>
          <p className="text-blue-700 mb-4">
            Access any database table with advanced filtering, sorting, search, and export capabilities. 
            The table viewer provides real-time data with proper access controls and tenant isolation.
          </p>
          <div className="flex gap-3">
            <Link
              to="/app/tables/users"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Browse Users
            </Link>
            <Link
              to="/app/tables/organizations"
              className="px-4 py-2 bg-white text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors text-sm font-medium"
            >
              Browse Organizations
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabasePage;