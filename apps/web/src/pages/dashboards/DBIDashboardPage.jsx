import React from 'react';
import { BarChart3 } from 'lucide-react';

const DBIDashboardPage = () => {
  return (
    <div className="p-6">
      <div className="flex items-center mb-4">
        <BarChart3 className="w-8 h-8 text-blue-600 mr-2" />
        <h1 className="text-3xl font-bold">DBI Dashboard</h1>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Charts Placeholder</h2>
        <p className="text-gray-600">Charts and data visualizations will be displayed here.</p>
      </div>
    </div>
  );
};

export default DBIDashboardPage;
