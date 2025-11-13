import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Edit, Trash2, Shield, Key, Mail, Phone, Building } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n';
import ArabicTextEngine from '../../components/Arabic/ArabicTextEngine';
import { AnimatedCard, AnimatedButton, CulturalLoadingSpinner } from '../../components/Animation/InteractiveAnimationToolkit';
import DataTable from '../../components/common/DataTable';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import apiService from '../../services/apiEndpoints';

const UserManagementPage = () => {
  const { t, language, changeLanguage, isRTL } = useI18n();
  const { canCreate, canAccessModule } = useRolePermissions();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);


  // Calculate real user metrics from fetched data
  const userMetrics = [
    {
      name: 'إجمالي المستخدمين',
      nameEn: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'blue',
      change: '+0'
    },
    {
      name: 'المستخدمون النشطون',
      nameEn: 'Active Users',
      value: users.filter(u => u.status === 'active').length,
      icon: UserCheck,
      color: 'green',
      change: '+0'
    },
    {
      name: 'المستخدمون المعطلون',
      nameEn: 'Inactive Users',
      value: users.filter(u => u.status === 'inactive').length,
      icon: UserX,
      color: 'red',
      change: '+0'
    },
    {
      name: 'المستخدمون الجدد',
      nameEn: 'New Users',
      value: users.filter(u => {
        const created = new Date(u.created_at || u.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length,
      icon: UserPlus,
      color: 'orange',
      change: '+0'
    }
  ];

  // Module access check removed - allow all users

  // Table columns configuration
  const columns = [
    {
      key: 'name',
      label: t('users.fields.firstName'),
      render: (value, item) => (
        <div className="flex items-center">
          <div className="h-10 w-10 flex-shrink-0">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-sm font-medium text-blue-600">
                {(language === 'ar' ? item.firstNameAr : item.firstName)?.charAt(0)}
              </span>
            </div>
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900">
              {language === 'ar' 
                ? `${item.firstNameAr} ${item.lastNameAr}`
                : `${item.firstName} ${item.lastName}`
              }
            </div>
            <div className="text-sm text-gray-500">
              {item.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: t('users.fields.role'),
      filterable: true,
      render: (value, item) => (
        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
          {language === 'ar' ? item.roleAr : item.role}
        </span>
      )
    },
    {
      key: 'organization',
      label: t('users.fields.organization'),
      filterable: true,
      render: (value, item) => (
        <div className="flex items-center text-sm text-gray-900">
          <Building className="h-4 w-4 mr-2 text-gray-400" />
          {language === 'ar' ? item.organizationAr : item.organization}
        </div>
      )
    },
    {
      key: 'status',
      label: t('users.fields.status'),
      type: 'status',
      filterable: true
    },
    {
      key: 'lastLogin',
      label: t('users.fields.lastLogin'),
      type: 'date'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, [language]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.users.getAll();
      setUsers(response.data?.data || response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleColor = (role) => {
    if (role.toLowerCase().includes('manager') || role.includes('مدير')) {
      return 'bg-purple-100 text-purple-800';
    } else if (role.toLowerCase().includes('analyst') || role.includes('محلل')) {
      return 'bg-blue-100 text-blue-800';
    } else if (role.toLowerCase().includes('auditor') || role.includes('مدقق')) {
      return 'bg-green-100 text-green-800';
    }
    return 'bg-gray-100 text-gray-800';
  };

  // Action handlers
  const handleAction = (actionName, actionData) => {
    switch (actionName) {
      case 'create':
        setShowAddUser(true);
        break;
      case 'edit':
        console.log('Edit user:', actionData.resourceId);
        // Implement edit functionality
        break;
      case 'delete':
        handleDeleteUser(actionData.resourceId);
        break;
      case 'view':
        console.log('View user:', actionData.resourceId);
        // Implement view functionality
        break;
      default:
        console.log('Unknown action:', actionName, actionData);
    }
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm(t('common.messages.confirmDelete'))) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleStatusToggle = (userId) => {
    setUsers(users.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <CulturalLoadingSpinner culturalStyle="modern" />
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ fontFamily: language === 'ar' ? 'Amiri, Noto Sans Arabic, sans-serif' : 'Inter, sans-serif' }}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <ArabicTextEngine
            animated={true}
            personalityType="professional"
            style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a202c', marginBottom: '8px' }}
          >
            {language === 'ar' ? 'إدارة المستخدمين' : 'User Management'}
          </ArabicTextEngine>
          <ArabicTextEngine
            personalityType="casual"
            style={{ fontSize: '16px', color: '#4a5568' }}
          >
            {language === 'ar' ? 'إدارة حسابات المستخدمين والصلاحيات' : 'Manage user accounts and permissions'}
          </ArabicTextEngine>
        </div>

        <div className="flex items-center space-x-4">
          <AnimatedButton
            variant="primary"
            culturalStyle="modern"
            style={{ backgroundColor: '#667eea' }}
            onClick={() => setShowAddUser(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            <ArabicTextEngine personalityType="casual">
              {language === 'ar' ? 'مستخدم جديد' : 'New User'}
            </ArabicTextEngine>
          </AnimatedButton>
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userMetrics.map((metric, index) => (
          <AnimatedCard key={index} hover3D={false} culturalPattern={true}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    <ArabicTextEngine personalityType="casual">
                      {language === 'ar' ? metric.name : metric.nameEn}
                    </ArabicTextEngine>
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                  <p className="text-sm text-green-600 mt-1">{metric.change} this month</p>
                </div>
                <div className={`p-3 rounded-full bg-${metric.color}-100`}>
                  <metric.icon className={`h-6 w-6 text-${metric.color}-600`} />
                </div>
              </div>
            </div>
          </AnimatedCard>
        ))}
      </div>

      {/* Users Table */}
      <AnimatedCard hover3D={false} culturalPattern={true}>
        <div className="p-6">
          {/* Enhanced Data Table with Bulk Operations */}
          <DataTable
            data={users}
            columns={columns}
            resource="users"
            onAction={handleAction}
            onRefresh={loadUsers}
            loading={loading}
            emptyMessage={t('users.noUsersFound')}
            searchable={true}
            filterable={true}
            sortable={true}
            selectable={true}
            pagination={true}
            pageSize={10}
          />
        </div>
      </AnimatedCard>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <AnimatedCard hover3D={false} culturalPattern={true}>
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <ArabicTextEngine
                  personalityType="professional"
                  style={{ fontSize: '18px', fontWeight: '600', color: '#1a202c' }}
                >
                  {language === 'ar' ? 'إضافة مستخدم جديد' : 'Add New User'}
                </ArabicTextEngine>
                <button
                  onClick={() => setShowAddUser(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الاسم الأول' : 'First Name'}
                  </label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'اسم العائلة' : 'Last Name'}
                  </label>
                  <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {language === 'ar' ? 'الدور' : 'Role'}
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                    <option value="">{language === 'ar' ? 'اختر الدور' : 'Select Role'}</option>
                    <option value="manager">{language === 'ar' ? 'مدير' : 'Manager'}</option>
                    <option value="analyst">{language === 'ar' ? 'محلل' : 'Analyst'}</option>
                    <option value="auditor">{language === 'ar' ? 'مدقق' : 'Auditor'}</option>
                  </select>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button
                    onClick={() => setShowAddUser(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {language === 'ar' ? 'إضافة' : 'Add User'}
                  </button>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default UserManagementPage;
