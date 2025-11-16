import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { HelpCircle, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18n } from '../../hooks/useI18n.jsx';
import { useTheme } from '../theme/ThemeProvider';

const ProcessGuideBanner = ({ guide }) => {
  const { t, language } = useI18n();
  const { isDark } = useTheme();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  if (!guide) return null;

  return (
    <div className={`rounded-lg mb-4 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-blue-50 border-blue-200'}`}>
      <div className={`flex items-center justify-between p-3 ${isDark ? 'text-gray-200' : 'text-blue-900'}`}>
        <div className="flex items-center gap-2">
          <HelpCircle className={`w-5 h-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
          <div className="font-medium">
            {language === 'ar' ? (guide.titleAr || guide.title) : guide.title}
          </div>
        </div>
        <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1 px-2 py-1 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-blue-100 hover:bg-blue-200'}`}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span>{open ? (language === 'ar' ? 'إخفاء' : 'Hide') : (language === 'ar' ? 'عرض' : 'Show')}</span>
        </button>
      </div>
      {open && (
        <div className={`p-4 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.isArray(guide.steps) && guide.steps.map((step, idx) => (
              <div key={idx} className={`flex items-start gap-3 rounded-lg p-3 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-blue-100'}`}>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isDark ? 'bg-blue-900' : 'bg-blue-600'} text-white font-semibold`}>{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <CheckCircle className={`w-4 h-4 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
                    <div className="text-sm font-semibold">
                      {language === 'ar' ? (step.titleAr || step.title) : step.title}
                    </div>
                  </div>
                  {step.desc && (
                    <div className="text-xs mt-1 opacity-80">
                      {language === 'ar' ? (step.descAr || step.desc) : step.desc}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {Array.isArray(guide.actions) && guide.actions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {guide.actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    const isAdvanced = location.pathname.startsWith('/advanced');
                    const dest = isAdvanced && action.altPath ? action.altPath : action.path;
                    navigate(dest);
                  }}
                  className={`${isDark ? 'bg-blue-700 hover:bg-blue-800 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} px-3 py-1.5 rounded-lg text-sm`}
                >
                  {language === 'ar' ? (action.labelAr || action.label) : action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessGuideBanner;