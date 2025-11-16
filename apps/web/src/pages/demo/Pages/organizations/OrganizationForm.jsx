import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiServices } from '../../services/api';

const OrganizationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    country: '',
    email: '',
    phone: ''
  });

  const createMutation = useMutation({
    mutationFn: apiServices.organizations.create,
    onSuccess: () => {
      alert('Organization created successfully!');
      window.location.href = '/organizations';
    },
    onError: (error) => {
      alert('Error creating organization: ' + error.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Create Organization</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sector</label>
          <select
            name="sector"
            value={formData.sector}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select Sector</option>
            <option value="healthcare">Healthcare</option>
            <option value="finance">Finance</option>
            <option value="technology">Technology</option>
            <option value="government">Government</option>
            <option value="education">Education</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Country</label>
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <a
            href="/organizations"
            className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </a>
          <button
            type="submit"
            disabled={createMutation.isLoading}
            className="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {createMutation.isLoading ? 'Creating...' : 'Create Organization'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrganizationForm;

