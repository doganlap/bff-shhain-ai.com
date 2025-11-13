import React from 'react';

const SimplePage = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Simple Test Page</h1>
      <p className="text-gray-600">This page should work without any complex imports.</p>
      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-blue-800">✅ If you can see this, the basic routing is working!</p>
      </div>
    </div>
  );
};

export default SimplePage;
