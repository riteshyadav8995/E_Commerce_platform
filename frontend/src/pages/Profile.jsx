import React, { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import api from '../services/api';
import { User, Mail, Shield, Clock } from 'lucide-react';

const Profile = () => {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/profile');
        setProfileData(response.data);
      } catch (error) {
        console.error('Failed to fetch profile', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return <div className="text-center py-10 text-gray-500 dark:text-gray-400">Loading profile...</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg transition-colors">
      <div className="px-4 py-5 sm:px-6 flex items-center border-b border-gray-200 dark:border-gray-700">
        <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center text-primary-600 dark:text-primary-400 mr-4">
          <User className="h-8 w-8" />
        </div>
        <div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">User Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500 dark:text-gray-400">Personal details and role information.</p>
        </div>
      </div>
      <div className="px-4 py-5 sm:p-0">
        <dl className="sm:divide-y sm:divide-gray-200 dark:sm:divide-gray-700">
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <User className="h-4 w-4 mr-2" /> Full name
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:mt-0 sm:col-span-2">{profileData?.name}</dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Mail className="h-4 w-4 mr-2" /> Email address
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:mt-0 sm:col-span-2">{profileData?.email}</dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <User className="h-4 w-4 mr-2" /> Phone number
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:mt-0 sm:col-span-2">{profileData?.phone || 'Not provided'}</dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Shield className="h-4 w-4 mr-2" /> Role
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:mt-0 sm:col-span-2">
              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                {profileData?.role?.name || user?.role}
              </span>
            </dd>
          </div>
          <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-2" /> Member since
            </dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-gray-200 sm:mt-0 sm:col-span-2">
              {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Profile;
