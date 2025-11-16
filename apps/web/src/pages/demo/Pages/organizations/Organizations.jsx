import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiServices } from '@/services/api';

const Organizations = () => {
  const { data: organizations, isLoading, error } = useQuery({
    queryKey: ['organizations'],
    queryFn: () => apiServices.organizations.getAll()
  });

  if (isLoading) return <div className="p-4">Loading organizations...</div>;

  const items = organizations?.data ?? [];

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-4 rounded-lg p-4 bg-blue-50 border border-blue-200">
        <p className="text-sm text-blue-800">
          Tips: Create organizations, then assign licenses and users. Use Edit to update details, and Delete to remove.
        </p>
      </div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">Organizations</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your organizations with sector-based intelligence.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <a
            href="/organizations/new"
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            Add Organization
          </a>
        </div>
      </div>
      
      {error && (
        <div className="mt-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error loading organizations</h3>
              <div className="mt-2 text-sm text-red-700">
                Please try again later. If the problem persists, contact support.
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-col">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Sector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Country
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {items.length === 0 ? (
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500" colSpan={4}>
                    No organizations found.
                  </td>
                </tr>
              ) : items.map((org) => (
                <tr key={org.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {org.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.sector || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {org.country || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <a
                      href={`/organizations/${org.id}`}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View
                    </a>
                    <a
                      href={`/organizations/${org.id}/edit`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </a>
                    <button
                      onClick={() => {
                        if (confirm('Delete this organization?')) {
                          apiServices.organizations.delete(org.id).then(() => {
                            window.location.reload();
                          }).catch(() => {
                            alert('Failed to delete organization');
                          });
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Organizations;

