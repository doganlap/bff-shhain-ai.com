import React from 'react';  
import { NavLink } from 'react-router-dom';  
import { BarChart3, Shield, AlertTriangle, FileText, Languages, Bot } from 'lucide-react';  
import { useApp } from '../../context/AppContext';  
  
const Navigation = () => {  
  const { state } = useApp();
  const language = 'en'; // Default to English
  const isRTL = false;
  const toggleLanguage = () => {}; // Placeholder function  
  
  const navItems = [  
    { path: '/dashboard', icon: BarChart3, label: language === 'ar' ? '???? ??????' : 'Dashboard' },  
    { path: '/controls', icon: Shield, label: language === 'ar' ? '???????' : 'Controls' },  
    { path: '/risks', icon: AlertTriangle, label: language === 'ar' ? '???????' : 'Risks' },  
    { path: '/evidence', icon: FileText, label: language === 'ar' ? '??????' : 'Evidence' }  
  ];  
  
  return (  
    <nav className="glass border-b border-white border-opacity-20">  
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
        <div className="flex justify-between items-center h-16">  
          <div className={`flex items-center space-x-8 ${isRTL ? 'flex-row-reverse space-x-reverse' : ''}`}>  
            <div className="flex items-center">  
              <Shield className="h-8 w-8 text-white" />  
              <span className="ml-2 text-xl font-bold text-white">  
                {language === 'ar' ? '???? ???????' : 'GRC System'}  
              </span>  
            </div>  
  
            <div className={`flex space-x-4 ${isRTL ? 'space-x-reverse' : ''}`}>  
              {navItems.map(({ path, icon: Icon, label }) => (  
                <NavLink  
                  key={path}  
                  to={path}  
                  className={({ isActive }) =>  
                    `flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${  
                      isActive  
                        ? 'bg-white bg-opacity-20 text-white'  
                        : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'  
                    }`  
                  }  
                >  
                  <Icon className="h-4 w-4" />  
                  <span>{label}</span>  
                </NavLink>  
              ))}  
            </div>  
          </div>  
  
          <div className="flex items-center space-x-4">  
            <button  
              onClick={toggleLanguage}  
              className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"  
              title="Toggle Language"  
            >  
              <Languages className="h-5 w-5" />  
              <span>{language === 'ar' ? 'En' : '??'}</span>  
            </button>  
  
            <button className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors" title="AI Assistant">  
              <Bot className="h-5 w-5" />  
              <span>AI</span>  
            </button>  
          </div>  
        </div>  
      </div>  
    </nav>  
  );  
};  
  
export default Navigation; 
