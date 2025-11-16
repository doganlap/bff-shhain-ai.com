import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiService from '@/services/apiEndpoints';
import { toast } from 'sonner';
import { CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';

const OrganizationDetails = () => {
  const { id } = useParams();
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');

  const fetchOrganizationDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.organizations.getById(id);
      if (response?.data?.success && response.data.data) {
        setOrganization(response.data.data);
      } else {
        toast.error('Organization not found');
      }
    } catch (error) {
      console.error('Error fetching organization details:', error);
      toast.error('Failed to load organization details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrganizationDetails();
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, [id, fetchOrganizationDetails]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CulturalLoadingSpinner culturalStyle="modern" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600">
          {language === 'ar' ? 'لم يتم العثور على المنظمة' : 'Organization not found'}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{organization?.name}</h1>
        <p className="text-gray-600">{organization?.description}</p>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Organization Information</h3>
        </div>
        <div className="border-t border-gray-200">
          <dl>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Sector</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization?.sector || 'Not specified'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Country</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization?.country || 'Not specified'}
              </dd>
            </div>
            <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization?.email || 'Not specified'}
              </dd>
            </div>
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {organization?.phone || 'Not specified'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-6">
        <a
          href="/organizations"
          className="bg-gray-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-gray-700"
        >
          Back to Organizations
        </a>
      </div>
    </div>
  );
};

export default OrganizationDetails;

