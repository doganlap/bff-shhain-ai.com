import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Command,
  Hash,
  User,
  FileText,
  Settings,
  Shield,
  Building,
  BarChart3,
  Target,
  Database,
  Clock,
  ArrowRight,
  Plus,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ArabicTextEngine from '../Arabic/ArabicTextEngine';

const CommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Sample data for search
  const searchData = [
    // Navigation
    {
      id: 'nav-dashboard',
      type: 'page',
      title: 'Dashboard',
      titleAr: 'لوحة التحكم',
      description: 'Overview and metrics',
      descriptionAr: 'نظرة عامة والمقاييس',
      path: '/app/dashboard',
      icon: BarChart3
    },
    {
      id: 'nav-assessments',
      type: 'page',
      title: 'Assessments',
      titleAr: 'التقييمات',
      description: 'Assessment management',
      descriptionAr: 'إدارة التقييمات',
      path: '/app/assessments',
      icon: Shield
    },
    {
      id: 'nav-organizations',
      type: 'page',
      title: 'Organizations',
      titleAr: 'المؤسسات',
      description: 'Organization management',
      descriptionAr: 'إدارة المؤسسات',
      path: '/app/organizations',
      icon: Building
    },
    {
      id: 'nav-frameworks',
      type: 'page',
      title: 'Frameworks',
      titleAr: 'أطر العمل',
      description: 'Compliance frameworks',
      descriptionAr: 'أطر الامتثال',
      path: '/app/frameworks',
      icon: Target
    },
    {
      id: 'nav-controls',
      type: 'page',
      title: 'Controls',
      titleAr: 'الضوابط',
      description: 'Control management',
      descriptionAr: 'إدارة الضوابط',
      path: '/app/controls',
      icon: FileText
    },
    {
      id: 'nav-reports',
      type: 'page',
      title: 'Reports',
      titleAr: 'التقارير',
      description: 'Analytics and reports',
      descriptionAr: 'التحليلات والتقارير',
      path: '/app/reports',
      icon: BarChart3
    },
    {
      id: 'nav-database',
      type: 'page',
      title: 'Database',
      titleAr: 'قاعدة البيانات',
      description: 'Database management',
      descriptionAr: 'إدارة قاعدة البيانات',
      path: '/app/database',
      icon: Database
    },
    {
      id: 'nav-settings',
      type: 'page',
      title: 'Settings',
      titleAr: 'الإعدادات',
      description: 'System settings',
      descriptionAr: 'إعدادات النظام',
      path: '/app/settings',
      icon: Settings
    },

    // Sample content
    {
      id: 'assessment-iso27001',
      type: 'assessment',
      title: 'ISO 27001 Assessment 2024',
      titleAr: 'تقييم آيزو 27001 لعام 2024',
      description: 'Information Security Management System assessment',
      descriptionAr: 'تقييم نظام إدارة أمن المعلومات',
      path: '/app/assessments/iso27001-2024',
      icon: Shield
    },
    {
      id: 'org-techcorp',
      type: 'organization',
      title: 'TechCorp Solutions',
      titleAr: 'حلول تك كورب',
      description: 'Technology company profile',
      descriptionAr: 'ملف شركة التكنولوجيا',
      path: '/app/organizations/techcorp',
      icon: Building
    },
    {
      id: 'framework-nist',
      type: 'framework',
      title: 'NIST Cybersecurity Framework',
      titleAr: 'إطار عمل الأمن السيبراني NIST',
      description: 'Cybersecurity framework by NIST',
      descriptionAr: 'إطار عمل الأمن السيبراني من NIST',
      path: '/app/frameworks/nist',
      icon: Target
    },

    // Actions
    {
      id: 'action-new-assessment',
      type: 'action',
      title: 'Create New Assessment',
      titleAr: 'إنشاء تقييم جديد',
      description: 'Start a new compliance assessment',
      descriptionAr: 'بدء تقييم امتثال جديد',
      action: () => navigate('/app/assessments/new'),
      icon: Plus
    },
    {
      id: 'action-export-data',
      type: 'action',
      title: 'Export Data',
      titleAr: 'تصدير البيانات',
      description: 'Export assessment data',
      descriptionAr: 'تصدير بيانات التقييم',
      action: () => console.log('Export data'),
      icon: Download
    }
  ];

  const filteredResults = searchData.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.titleAr.includes(searchTerm) ||
    item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.descriptionAr.includes(searchTerm)
  );

  const groupedResults = filteredResults.reduce((acc, item) => {
    if (!acc[item.type]) {
      acc[item.type] = [];
    }
    acc[item.type].push(item);
    return acc;
  }, {});

  const handleKeyDown = useCallback((e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setIsOpen(true);
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const handleItemClick = (item) => {
    if (item.action) {
      item.action();
    } else if (item.path) {
      navigate(item.path);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'page': return Hash;
      case 'assessment': return Shield;
      case 'organization': return Building;
      case 'framework': return Target;
      case 'action': return Command;
      default: return FileText;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'page': return 'صفحات';
      case 'assessment': return 'تقييمات';
      case 'organization': return 'مؤسسات';
      case 'framework': return 'أطر عمل';
      case 'action': return 'إجراءات';
      default: return 'أخرى';
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-3 left-3 md:bottom-4 md:left-4 z-50">
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 text-white p-2 md:p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors touch-manipulation"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3 md:w-4 md:h-4" />
            <span className="text-xs hidden md:block">Ctrl+K</span>
          </div>
        </motion.button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center pt-8 md:pt-20 p-4"
        onClick={() => setIsOpen(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: -20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-white rounded-lg md:rounded-xl shadow-2xl overflow-hidden"
          dir="rtl"
        >
          {/* Search Input */}
          <div className="p-3 md:p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
              <input
                type="text"
                placeholder="ابحث في المنصة... (Ctrl+K)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 md:pr-12 pl-3 md:pl-4 py-2 md:py-3 text-base md:text-lg border-0 focus:ring-0 outline-none touch-manipulation"
                autoFocus
              />
              <div className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-xs md:text-sm">
                ESC للإغلاق
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-72 md:max-h-96 overflow-y-auto">
            {searchTerm === '' ? (
              <div className="p-6 md:p-8 text-center text-gray-500">
                <Command className="w-8 h-8 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 text-gray-300" />
                <p className="text-sm md:text-base">
                  <ArabicTextEngine personalityType="casual">
                    ابدأ البحث للوصول السريع إلى جميع أجزاء المنصة
                  </ArabicTextEngine>
                </p>
                <p className="text-xs md:text-sm mt-2">
                  استخدم Ctrl+K أو Cmd+K لفتح البحث السريع
                </p>
              </div>
            ) : filteredResults.length === 0 ? (
              <div className="p-6 md:p-8 text-center text-gray-500">
                <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>
                  <ArabicTextEngine personalityType="casual">
                    لا توجد نتائج للبحث "{searchTerm}"
                  </ArabicTextEngine>
                </p>
              </div>
            ) : (
              <div className="p-2">
                {Object.entries(groupedResults).map(([type, items]) => {
                  const TypeIcon = getTypeIcon(type);
                  return (
                    <div key={type} className="mb-3 md:mb-4">
                      <div className="flex items-center gap-2 px-2 md:px-3 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-500">
                        <TypeIcon className="w-3 h-3 md:w-4 md:h-4" />
                        {getTypeLabel(type)}
                      </div>
                      {items.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            whileHover={{ backgroundColor: 'rgba(59, 130, 246, 0.05)' }}
                            onClick={() => handleItemClick(item)}
                            className="w-full p-2 md:p-3 text-right hover:bg-blue-50 rounded-lg transition-colors touch-manipulation"
                          >
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-6 h-6 md:w-8 md:h-8 bg-gray-100 rounded-md md:rounded-lg flex items-center justify-center">
                                <ItemIcon className="w-3 h-3 md:w-4 md:h-4 text-gray-600" />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm md:text-base">{item.titleAr}</p>
                                <p className="text-xs md:text-sm text-gray-500">{item.descriptionAr}</p>
                              </div>
                              <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400" />
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-2 md:p-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between text-xs md:text-sm text-gray-500">
              <div className="flex items-center gap-2 md:gap-4">
                <div className="hidden md:flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border rounded text-xs">↑</kbd>
                  <kbd className="px-2 py-1 bg-white border rounded text-xs">↓</kbd>
                  <span className="text-xs">للتنقل</span>
                </div>
                <div className="hidden md:flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border rounded text-xs">Enter</kbd>
                  <span className="text-xs">للاختيار</span>
                </div>
              </div>
              <div>
                <ArabicTextEngine personalityType="casual">
                  البحث السريع - منصة دوغان
                </ArabicTextEngine>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CommandPalette;
