import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Crown, Zap, Globe, Users, Building, ArrowRight, 
  CheckCircle, Star, Sparkles, Heart, Target, Award,
  Mail, Lock, Eye, EyeOff, Phone, MapPin, BarChart3,
  TrendingUp, Briefcase, Settings, Database, Network
} from 'lucide-react';
import { emailService } from '../../services/emailService';
import SaudiLandmarks from '../../components/landmarks/SaudiLandmarks';
import ExitIntentPopup from '../../components/popups/ExitIntentPopup';

const StoryDrivenRegistration = () => {
  const navigate = useNavigate();
  const [currentStory, setCurrentStory] = useState(0);
  const [showRegistration, setShowRegistration] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+966',
    phone: '',
    jobTitle: '',
    department: '',
    employeeCount: '',
    lookingFor: '',
    organizationName: '',
    legalStructure: '',
    industry: '',
    country: 'Saudi Arabia',
    city: '',
    address: '',
    website: '',
    hasInternalOffice: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showExitPopup, setShowExitPopup] = useState(false);
  const [mouseLeaveCount, setMouseLeaveCount] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [tabValidation, setTabValidation] = useState({
    0: false, // Personal Info
    1: false, // Organization Info
    2: false  // Agreement
  });

  const storySlides = [
    {
      id: 1,
      icon: Crown,
      titleAr: "شريكك في رؤية المملكة 2030",
      titleEn: "Your Partner in Saudi Vision 2030",
      contentAr: "نساعد المؤسسات السعودية على تحقيق أهداف التحول الرقمي والامتثال التنظيمي وفقاً لرؤية المملكة 2030",
      contentEn: "We help Saudi organizations achieve digital transformation and regulatory compliance goals in line with Saudi Vision 2030",
      gradient: "from-purple-600 to-blue-600",
      landmark: "kingdom-tower"
    },
    {
      id: 2,
      icon: Shield,
      titleAr: "حلول الحوكمة المتقدمة",
      titleEn: "Advanced Governance Solutions",
      contentAr: "منصة متكاملة لإدارة المخاطر والامتثال التنظيمي مع تقنيات الذكاء الاصطناعي لضمان الشفافية والكفاءة",
      contentEn: "Integrated platform for risk management and regulatory compliance with AI technologies ensuring transparency and efficiency",
      gradient: "from-blue-600 to-cyan-600",
      landmark: "masjid-nabawi"
    },
    {
      id: 3,
      icon: Target,
      titleAr: "قيمة مضافة لأعمالكم",
      titleEn: "Added Value for Your Business",
      contentAr: "تقليل التكاليف التشغيلية بنسبة 40% وتحسين كفاءة الامتثال بنسبة 85% مع ضمان الالتزام بمعايير SAMA وCMA",
      contentEn: "Reduce operational costs by 40% and improve compliance efficiency by 85% while ensuring adherence to SAMA and CMA standards",
      gradient: "from-cyan-600 to-teal-600",
      landmark: "kaaba"
    },
    {
      id: 4,
      icon: Users,
      titleAr: "خبرة محلية وعالمية",
      titleEn: "Local and Global Expertise",
      contentAr: "فريق من الخبراء السعوديين والعالميين في الحوكمة والامتثال مع خبرة تزيد عن 15 عاماً في السوق السعودي",
      contentEn: "Team of Saudi and international experts in governance and compliance with over 15 years of experience in the Saudi market",
      gradient: "from-teal-600 to-green-600",
      landmark: "neom-city"
    },
    {
      id: 5,
      icon: Award,
      titleAr: "الثقة والموثوقية",
      titleEn: "Trust and Reliability",
      contentAr: "أكثر من 500 مؤسسة تثق بحلولنا بما في ذلك البنوك الرائدة وشركات التأمين والجهات الحكومية",
      contentEn: "Over 500 organizations trust our solutions including leading banks, insurance companies, and government entities",
      gradient: "from-green-600 to-emerald-600",
      landmark: "red-sea"
    }
  ];

  const registrationTabs = [
    {
      id: 0,
      titleAr: 'المعلومات الشخصية',
      titleEn: 'Personal Information',
      icon: Users,
      fields: ['firstName', 'lastName', 'email', 'phone', 'jobTitle', 'department', 'password', 'confirmPassword']
    },
    {
      id: 1,
      titleAr: 'معلومات المؤسسة',
      titleEn: 'Organization Details',
      icon: Building,
      fields: ['organizationName', 'legalStructure', 'industry', 'employeeCount', 'lookingFor']
    },
    {
      id: 2,
      titleAr: 'العنوان والمكتب',
      titleEn: 'Address & Office',
      icon: MapPin,
      fields: ['address', 'country', 'city', 'website', 'hasInternalOffice']
    },
    {
      id: 3,
      titleAr: 'الموافقة والإرسال',
      titleEn: 'Agreement & Submit',
      icon: CheckCircle,
      fields: ['agreeToTerms']
    }
  ];

  // Dropdown options
  const countryCodes = [
    { value: '+966', label: '+966 (Saudi Arabia)', flag: '🇸🇦' },
    { value: '+971', label: '+971 (UAE)', flag: '🇦🇪' },
    { value: '+965', label: '+965 (Kuwait)', flag: '🇰🇼' },
    { value: '+973', label: '+973 (Bahrain)', flag: '🇧🇭' },
    { value: '+974', label: '+974 (Qatar)', flag: '🇶🇦' },
    { value: '+968', label: '+968 (Oman)', flag: '🇴🇲' },
    { value: '+962', label: '+962 (Jordan)', flag: '🇯🇴' },
    { value: '+961', label: '+961 (Lebanon)', flag: '🇱🇧' },
    { value: '+20', label: '+20 (Egypt)', flag: '🇪🇬' },
    { value: '+1', label: '+1 (USA/Canada)', flag: '🇺🇸' },
    { value: '+44', label: '+44 (UK)', flag: '🇬🇧' },
    { value: '+49', label: '+49 (Germany)', flag: '🇩🇪' },
    { value: '+33', label: '+33 (France)', flag: '🇫🇷' }
  ];

  const departments = [
    { value: 'risk_management', label: 'Risk Management | إدارة المخاطر' },
    { value: 'compliance', label: 'Compliance | الامتثال' },
    { value: 'internal_audit', label: 'Internal Audit | التدقيق الداخلي' },
    { value: 'legal', label: 'Legal | الشؤون القانونية' },
    { value: 'finance', label: 'Finance | المالية' },
    { value: 'operations', label: 'Operations | العمليات' },
    { value: 'it', label: 'Information Technology | تقنية المعلومات' },
    { value: 'hr', label: 'Human Resources | الموارد البشرية' },
    { value: 'strategy', label: 'Strategy & Planning | الاستراتيجية والتخطيط' },
    { value: 'business_development', label: 'Business Development | تطوير الأعمال' },
    { value: 'customer_service', label: 'Customer Service | خدمة العملاء' },
    { value: 'marketing', label: 'Marketing | التسويق' },
    { value: 'sales', label: 'Sales | المبيعات' },
    { value: 'procurement', label: 'Procurement | المشتريات' },
    { value: 'quality_assurance', label: 'Quality Assurance | ضمان الجودة' },
    { value: 'other', label: 'Other | أخرى' }
  ];

  const countries = [
    { value: 'Saudi Arabia', label: 'Saudi Arabia | المملكة العربية السعودية', flag: '🇸🇦' },
    { value: 'UAE', label: 'United Arab Emirates | الإمارات العربية المتحدة', flag: '🇦🇪' },
    { value: 'Kuwait', label: 'Kuwait | الكويت', flag: '🇰🇼' },
    { value: 'Bahrain', label: 'Bahrain | البحرين', flag: '🇧🇭' },
    { value: 'Qatar', label: 'Qatar | قطر', flag: '🇶🇦' },
    { value: 'Oman', label: 'Oman | عُمان', flag: '🇴🇲' },
    { value: 'Jordan', label: 'Jordan | الأردن', flag: '🇯🇴' },
    { value: 'Lebanon', label: 'Lebanon | لبنان', flag: '🇱🇧' },
    { value: 'Egypt', label: 'Egypt | مصر', flag: '🇪🇬' },
    { value: 'Morocco', label: 'Morocco | المغرب', flag: '🇲🇦' },
    { value: 'Tunisia', label: 'Tunisia | تونس', flag: '🇹🇳' },
    { value: 'Algeria', label: 'Algeria | الجزائر', flag: '🇩🇿' },
    { value: 'Iraq', label: 'Iraq | العراق', flag: '🇮🇶' },
    { value: 'Syria', label: 'Syria | سوريا', flag: '🇸🇾' },
    { value: 'Yemen', label: 'Yemen | اليمن', flag: '🇾🇪' },
    { value: 'Sudan', label: 'Sudan | السودان', flag: '🇸🇩' },
    { value: 'Libya', label: 'Libya | ليبيا', flag: '🇱🇾' },
    { value: 'USA', label: 'United States | الولايات المتحدة', flag: '🇺🇸' },
    { value: 'UK', label: 'United Kingdom | المملكة المتحدة', flag: '🇬🇧' },
    { value: 'Germany', label: 'Germany | ألمانيا', flag: '🇩🇪' },
    { value: 'France', label: 'France | فرنسا', flag: '🇫🇷' },
    { value: 'Other', label: 'Other | أخرى', flag: '🌍' }
  ];

  const organizationTypes = [
    { value: 'bank', label: 'Bank | بنك' },
    { value: 'insurance', label: 'Insurance Company | شركة تأمين' },
    { value: 'fintech', label: 'Fintech | تقنية مالية' },
    { value: 'government', label: 'Government Entity | جهة حكومية' },
    { value: 'healthcare', label: 'Healthcare | رعاية صحية' },
    { value: 'telecom', label: 'Telecommunications | اتصالات' },
    { value: 'energy', label: 'Energy & Utilities | طاقة ومرافق' },
    { value: 'manufacturing', label: 'Manufacturing | تصنيع' },
    { value: 'retail', label: 'Retail | تجارة تجزئة' },
    { value: 'consulting', label: 'Consulting | استشارات' },
    { value: 'other', label: 'Other | أخرى' }
  ];

  const legalStructures = [
    { value: 'llc', label: 'Limited Liability Company | شركة ذات مسؤولية محدودة' },
    { value: 'joint_stock', label: 'Joint Stock Company | شركة مساهمة' },
    { value: 'partnership', label: 'Partnership | شراكة' },
    { value: 'sole_proprietorship', label: 'Sole Proprietorship | مؤسسة فردية' },
    { value: 'branch', label: 'Branch Office | فرع' },
    { value: 'representative', label: 'Representative Office | مكتب تمثيلي' },
    { value: 'government', label: 'Government Entity | جهة حكومية' },
    { value: 'ngo', label: 'Non-Profit Organization | منظمة غير ربحية' },
    { value: 'other', label: 'Other | أخرى' }
  ];

  const industries = [
    { value: 'banking', label: 'Banking & Financial Services | الخدمات المصرفية والمالية' },
    { value: 'insurance', label: 'Insurance | التأمين' },
    { value: 'capital_markets', label: 'Capital Markets | أسواق رأس المال' },
    { value: 'fintech', label: 'Financial Technology | التقنية المالية' },
    { value: 'oil_gas', label: 'Oil & Gas | النفط والغاز' },
    { value: 'petrochemicals', label: 'Petrochemicals | البتروكيماويات' },
    { value: 'healthcare', label: 'Healthcare | الرعاية الصحية' },
    { value: 'telecommunications', label: 'Telecommunications | الاتصالات' },
    { value: 'construction', label: 'Construction & Real Estate | البناء والعقارات' },
    { value: 'manufacturing', label: 'Manufacturing | التصنيع' },
    { value: 'retail', label: 'Retail & Consumer Goods | التجزئة والسلع الاستهلاكية' }
  ];

  const employeeCounts = [
    { value: '1-10', label: '1-10 employees | 1-10 موظف' },
    { value: '11-50', label: '11-50 employees | 11-50 موظف' },
    { value: '51-200', label: '51-200 employees | 51-200 موظف' },
    { value: '201-500', label: '201-500 employees | 201-500 موظف' },
    { value: '501-1000', label: '501-1000 employees | 501-1000 موظف' },
    { value: '1001-5000', label: '1001-5000 employees | 1001-5000 موظف' },
    { value: '5000+', label: '5000+ employees | أكثر من 5000 موظف' }
  ];

  const lookingForOptions = [
    { value: 'compliance_management', label: 'Compliance Management | إدارة الامتثال' },
    { value: 'risk_assessment', label: 'Risk Assessment | تقييم المخاطر' },
    { value: 'regulatory_reporting', label: 'Regulatory Reporting | التقارير التنظيمية' },
    { value: 'audit_management', label: 'Audit Management | إدارة التدقيق' },
    { value: 'policy_management', label: 'Policy Management | إدارة السياسات' },
    { value: 'incident_management', label: 'Incident Management | إدارة الحوادث' },
    { value: 'training_awareness', label: 'Training & Awareness | التدريب والتوعية' },
    { value: 'digital_transformation', label: 'Digital Transformation | التحول الرقمي' },
    { value: 'cost_reduction', label: 'Cost Reduction | تقليل التكاليف' },
    { value: 'consultation', label: 'Consultation Services | خدمات استشارية' }
  ];

  const roles = [
    { value: 'ceo', label: 'CEO / Managing Director | الرئيس التنفيذي' },
    { value: 'cfo', label: 'CFO / Finance Director | المدير المالي' },
    { value: 'cro', label: 'CRO / Risk Director | مدير المخاطر' },
    { value: 'cco', label: 'CCO / Compliance Director | مدير الامتثال' },
    { value: 'cto', label: 'CTO / Technology Director | مدير التقنية' },
    { value: 'head_dept', label: 'Department Head | رئيس قسم' },
    { value: 'manager', label: 'Manager | مدير' },
    { value: 'senior_analyst', label: 'Senior Analyst | محلل أول' },
    { value: 'analyst', label: 'Analyst | محلل' },
    { value: 'consultant', label: 'Consultant | استشاري' },
    { value: 'other', label: 'Other | أخرى' }
  ];

  const saudiCities = [
    { value: 'riyadh', label: 'Riyadh | الرياض' },
    { value: 'jeddah', label: 'Jeddah | جدة' },
    { value: 'mecca', label: 'Mecca | مكة المكرمة' },
    { value: 'medina', label: 'Medina | المدينة المنورة' },
    { value: 'dammam', label: 'Dammam | الدمام' },
    { value: 'khobar', label: 'Al Khobar | الخبر' },
    { value: 'dhahran', label: 'Dhahran | الظهران' },
    { value: 'taif', label: 'Taif | الطائف' },
    { value: 'buraidah', label: 'Buraidah | بريدة' },
    { value: 'tabuk', label: 'Tabuk | تبوك' },
    { value: 'hail', label: 'Hail | حائل' },
    { value: 'khamis_mushait', label: 'Khamis Mushait | خميس مشيط' },
    { value: 'other', label: 'Other | أخرى' }
  ];

  // Validation functions
  const validateTab = (tabIndex) => {
    const tab = registrationTabs[tabIndex];
    const requiredFields = tab.fields;
    
    switch (tabIndex) {
      case 0: // Personal Info
        return (
          formData.firstName.trim() !== '' &&
          formData.lastName.trim() !== '' &&
          formData.email.includes('@') &&
          formData.phone.trim() !== '' &&
          formData.jobTitle.trim() !== '' &&
          formData.password.length >= 8 &&
          formData.password === formData.confirmPassword
        );
      case 1: // Organization Info
        return (
          formData.organizationName.trim() !== '' &&
          formData.legalStructure !== '' &&
          formData.industry !== '' &&
          formData.employeeCount !== '' &&
          formData.lookingFor !== ''
        );
      case 2: // Address & Office
        return (
          formData.address.trim() !== '' &&
          formData.country.trim() !== '' &&
          formData.city.trim() !== '' &&
          formData.hasInternalOffice !== ''
        );
      case 3: // Agreement
        return formData.agreeToTerms;
      default:
        return false;
    }
  };

  useEffect(() => {
    // Update tab validation status
    const newValidation = {};
    registrationTabs.forEach((tab) => {
      newValidation[tab.id] = validateTab(tab.id);
    });
    setTabValidation(newValidation);
  }, [formData]);

  useEffect(() => {
    if (!showRegistration) {
      const timer = setInterval(() => {
        setCurrentStory((prev) => (prev + 1) % storySlides.length);
      }, 4000);
      return () => clearInterval(timer);
    }
  }, [showRegistration, storySlides.length]);

  // Exit intent detection
  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY <= 0 && !showRegistration && !showExitPopup) {
        setMouseLeaveCount(prev => prev + 1);
        if (mouseLeaveCount >= 0) { // Show on first mouse leave
          setShowExitPopup(true);
        }
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [showRegistration, showExitPopup, mouseLeaveCount]);

  const handleJoinJourney = () => {
    setShowRegistration(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTabChange = (tabIndex) => {
    setActiveTab(tabIndex);
    setError('');
  };

  const handleNextTab = () => {
    if (activeTab < registrationTabs.length - 1) {
      if (tabValidation[activeTab]) {
        setActiveTab(prev => prev + 1);
        setError('');
      } else {
        setError('يرجى إكمال جميع الحقول المطلوبة | Please complete all required fields');
      }
    }
  };

  const handlePrevTab = () => {
    if (activeTab > 0) {
      setActiveTab(prev => prev - 1);
      setError('');
    }
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.organizationName) {
      setError('يرجى ملء جميع الحقول المطلوبة | Please fill all required fields');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('يرجى إدخال بريد إلكتروني صحيح | Please enter a valid email');
      return false;
    }
    if (formData.password.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل | Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('كلمات المرور غير متطابقة | Passwords do not match');
      return false;
    }
    if (!formData.agreeToTerms) {
      setError('يجب الموافقة على الشروط والأحكام | You must agree to terms and conditions');
      return false;
    }
    return true;
  };

  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);

    const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const result = await actions.register(formData);

    if (result.success) {
      setRegistrationData({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        organization: formData.organizationName,
        confirmationId: `REG-${Date.now()}`
      });
      setRegistrationSuccess(true);
    } else {
      setError(result.error || 'Registration failed. Please try again.');
    }

    setLoading(false);
  };

  const handleExitPopupSubmit = (leadData) => {
    console.log('Exit intent lead captured:', leadData);
    setShowExitPopup(false);
    // Optionally redirect or show thank you message
  };

  const handleExitPopupClose = () => {
    setShowExitPopup(false);
  };

  const currentSlide = storySlides[currentStory];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Dynamic Background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentSlide.gradient} transition-all duration-1000`}>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="relative min-h-screen flex items-center justify-center p-4">
        <AnimatePresence mode="wait">
          {!showRegistration ? (
            // Story Presentation
            <motion.div
              key="story"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full max-w-4xl text-center"
            >
              {/* Logo */}
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                className="mb-12"
              >
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Shield className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-white">Shahin-AI KSA</h1>
                    <p className="text-xl text-white/80" dir="rtl">شاهين الذكي السعودية</p>
                  </div>
                </div>
              </motion.div>

              {/* Story Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStory}
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -100, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 mb-8"
                >
                  <div className="flex justify-center items-center mb-6 relative">
                    <SaudiLandmarks 
                      landmark={currentSlide.landmark} 
                      className="w-24 h-24 opacity-80 hover:opacity-100 transition-opacity duration-300" 
                    />
                    
                    {/* Enterprise Floating Icons */}
                    <div className="absolute inset-0 pointer-events-none">
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2, repeat: Infinity }
                        }}
                        className="absolute -top-4 -left-4"
                      >
                        <BarChart3 className="w-6 h-6 text-white/40" />
                      </motion.div>
                      
                      <motion.div
                        animate={{ 
                          rotate: -360,
                          y: [-5, 5, -5]
                        }}
                        transition={{ 
                          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
                          y: { duration: 3, repeat: Infinity }
                        }}
                        className="absolute -top-2 -right-6"
                      >
                        <TrendingUp className="w-5 h-5 text-white/30" />
                      </motion.div>
                      
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          x: [-3, 3, -3]
                        }}
                        transition={{ 
                          rotate: { duration: 25, repeat: Infinity, ease: "linear" },
                          x: { duration: 4, repeat: Infinity }
                        }}
                        className="absolute -bottom-3 -left-2"
                      >
                        <Database className="w-4 h-4 text-white/35" />
                      </motion.div>
                      
                      <motion.div
                        animate={{ 
                          rotate: -360,
                          scale: [0.8, 1.2, 0.8]
                        }}
                        transition={{ 
                          rotate: { duration: 18, repeat: Infinity, ease: "linear" },
                          scale: { duration: 2.5, repeat: Infinity }
                        }}
                        className="absolute -bottom-4 -right-4"
                      >
                        <Network className="w-5 h-5 text-white/25" />
                      </motion.div>
                      
                      <motion.div
                        animate={{ 
                          rotate: 360,
                          y: [-2, 2, -2]
                        }}
                        transition={{ 
                          rotate: { duration: 22, repeat: Infinity, ease: "linear" },
                          y: { duration: 3.5, repeat: Infinity }
                        }}
                        className="absolute top-8 right-2"
                      >
                        <Settings className="w-4 h-4 text-white/20" />
                      </motion.div>
                    </div>
                  </div>
                  
                  <h2 className="text-3xl font-bold text-white mb-4" dir="rtl">
                    {currentSlide.titleAr}
                  </h2>
                  <h3 className="text-2xl font-semibold text-white/90 mb-6">
                    {currentSlide.titleEn}
                  </h3>
                  
                  <p className="text-lg text-white/80 mb-4 leading-relaxed" dir="rtl">
                    {currentSlide.contentAr}
                  </p>
                  <p className="text-lg text-white/70 leading-relaxed">
                    {currentSlide.contentEn}
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Progress Indicators */}
              <div className="flex justify-center gap-3 mb-8">
                {storySlides.map((_, index) => (
                  <div
                    key={index}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentStory ? 'w-8 bg-white' : 'w-2 bg-white/40'
                    }`}
                  />
                ))}
              </div>

              {/* Call to Action */}
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
              >
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleJoinJourney}
                  className="px-12 py-4 bg-white text-gray-900 font-bold text-xl rounded-2xl shadow-2xl hover:shadow-white/20 transition-all duration-300 flex items-center gap-3 mx-auto"
                >
                  <div>
                    <div dir="rtl">استكشف الآفاق</div>
                    <div className="text-sm opacity-70">Explore the Horizons</div>
                  </div>
                  <ArrowRight className="w-6 h-6" />
                </motion.button>

              </motion.div>
            </motion.div>
          ) : registrationSuccess ? (
            // Success Message
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full max-w-2xl"
            >
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-block mb-6"
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                  </motion.div>

                  <h2 className="text-3xl font-bold text-white mb-3">
                    Registration Successful!
                  </h2>
                  <p className="text-2xl font-bold text-white/90 mb-6" dir="rtl">
                    تم التسجيل بنجاح!
                  </p>

                  <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-2xl p-6 mb-6">
                    <div className="space-y-4 text-left">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white font-semibold">✅ Confirmation Email Sent</p>
                          <p className="text-white/80 text-sm">Check your inbox: <strong>{registrationData?.email}</strong></p>
                          <p className="text-white/70 text-sm" dir="rtl">تحقق من بريدك الإلكتروني</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white font-semibold">✅ Team Notified</p>
                          <p className="text-white/80 text-sm">Our team will contact you within 2-4 business hours</p>
                          <p className="text-white/70 text-sm" dir="rtl">سيتواصل معك فريقنا خلال 2-4 ساعات عمل</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-white font-semibold">✅ Registration ID</p>
                          <p className="text-white/80 text-sm font-mono">{registrationData?.confirmationId}</p>
                          <p className="text-white/70 text-sm" dir="rtl">رقم التسجيل الخاص بك</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4 mb-6">
                    <h3 className="text-white font-bold mb-2">📋 What Happens Next?</h3>
                    <p className="text-lg font-bold text-white/90 mb-3" dir="rtl">ماذا بعد؟</p>
                    <div className="space-y-2 text-sm text-white/80 text-left">
                      <p>1️⃣ <strong>Check your email</strong> for account verification link</p>
                      <p dir="rtl">1️⃣ تحقق من بريدك الإلكتروني للحصول على رابط تفعيل الحساب</p>
                      <p>2️⃣ <strong>Our team will review</strong> your application</p>
                      <p dir="rtl">2️⃣ سيقوم فريقنا بمراجعة طلبك</p>
                      <p>3️⃣ <strong>We'll contact you</strong> to schedule a demo</p>
                      <p dir="rtl">3️⃣ سنتواصل معك لتحديد موعد العرض التوضيحي</p>
                      <p>4️⃣ <strong>Get started</strong> with Shahin-AI KSA platform</p>
                      <p dir="rtl">4️⃣ ابدأ استخدام منصة شاهين الذكي السعودية</p>
                    </div>
                  </div>

                  <div className="flex gap-4 justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = 'https://shahin-ai.com'}
                      className="px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Visit Our Website | زيارة موقعنا
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/')}
                      className="px-6 py-3 bg-white/20 text-white font-bold rounded-xl hover:bg-white/30 transition-all"
                    >
                      Back to Home | العودة للرئيسية
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            // Registration Form
            <motion.div
              key="registration"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-2xl"
            >
              <div className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8">
                {/* Header */}
                <div className="text-center mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Briefcase className="w-8 h-8 text-blue-400" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">Professional Registration</h2>
                      <p className="text-white/80" dir="rtl">التسجيل المهني</p>
                    </div>
                  </div>
                  <p className="text-white/70 text-sm">
                    International Registration Form | نموذج التسجيل الدولي
                  </p>
                </div>

                {/* Important Notice - Highlighted */}
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="mb-6 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 border-2 border-white/30 rounded-2xl p-4 backdrop-blur-md"
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-white/20 p-2 rounded-lg">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                        <span>📧 Email Confirmation Required</span>
                        <span className="text-xs bg-yellow-400 text-gray-900 px-2 py-1 rounded-full animate-pulse">Important</span>
                      </h3>
                      <p className="text-white/90 text-sm mb-2" dir="rtl">
                        ✅ سيتم إرسال بريد إلكتروني للتأكيد فوراً بعد التسجيل
                      </p>
                      <p className="text-white/90 text-sm mb-2">
                        ✅ You will receive a confirmation email immediately after registration
                      </p>
                      <p className="text-white/90 text-sm mb-2" dir="rtl">
                        ⏱️ يرجى التحقق من بريدك الإلكتروني خلال 24 ساعة لتفعيل حسابك
                      </p>
                      <p className="text-white/90 text-sm">
                        ⏱️ Please check your email within 24 hours to activate your account
                      </p>
                      <div className="mt-3 p-2 bg-white/10 rounded-lg">
                        <p className="text-white/80 text-xs" dir="rtl">
                          💡 <strong>ملاحظة:</strong> سيتلقى فريقنا إشعاراً فورياً وسنتواصل معك خلال 2-4 ساعات عمل
                        </p>
                        <p className="text-white/80 text-xs mt-1">
                          💡 <strong>Note:</strong> Our team will be notified instantly and will contact you within 2-4 business hours
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Error Display */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-100 px-4 py-3 rounded-xl mb-6">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  </div>
                )}

                {/* Registration Form with Tabs */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Tab Navigation */}
                  <div className="flex justify-center mb-6">
                    <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                      {registrationTabs.map((tab, index) => {
                        const TabIcon = tab.icon;
                        return (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => handleTabChange(index)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              activeTab === index
                                ? 'bg-white text-gray-900 shadow-lg'
                                : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                          >
                            <TabIcon className="w-4 h-4" />
                            <span className="hidden md:block text-sm">{tab.titleEn}</span>
                            {tabValidation[index] && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-6">
                    <div className="flex justify-between text-xs text-white/60 mb-2">
                      <span>Step {activeTab + 1} of {registrationTabs.length}</span>
                      <span>{Math.round(((activeTab + 1) / registrationTabs.length) * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeTab + 1) / registrationTabs.length) * 100}%` }}
                        className="bg-white h-2 rounded-full transition-all duration-300"
                      />
                    </div>
                  </div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ x: 20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="min-h-[400px]"
                    >
                      {activeTab === 0 && (
                        // Personal Information Tab
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4 text-center">
                            Personal Information | المعلومات الشخصية
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                First Name | الاسم الأول *
                              </label>
                              <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                placeholder="Enter first name"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                Last Name | اسم العائلة *
                              </label>
                              <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                placeholder="Enter last name"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Email Address | البريد الإلكتروني *
                            </label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                              <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                autoComplete="email"
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                placeholder="your.email@company.com"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Phone Number | رقم الهاتف *
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="col-span-1">
                                <select
                                  name="countryCode"
                                  value={formData.countryCode}
                                  onChange={handleChange}
                                  className="w-full px-3 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 text-sm"
                                >
                                  {countryCodes.map(code => (
                                    <option key={code.value} value={code.value} className="bg-gray-800">
                                      {code.flag} {code.value}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-span-2">
                                <div className="relative">
                                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                                  <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                    placeholder="50 123 4567"
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Job Title | المسمى الوظيفي *
                            </label>
                            <input
                              type="text"
                              name="jobTitle"
                              value={formData.jobTitle}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                              placeholder="e.g., Risk Manager"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Department | القسم
                            </label>
                            <select
                              name="department"
                              value={formData.department}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                            >
                              <option value="" className="bg-gray-800">Select department</option>
                              {departments.map(dept => (
                                <option key={dept.value} value={dept.value} className="bg-gray-800">
                                  {dept.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                Password | كلمة المرور *
                              </label>
                              <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                                <input
                                  type={showPassword ? 'text' : 'password'}
                                  name="password"
                                  value={formData.password}
                                  onChange={handleChange}
                                  autoComplete="new-password"
                                  className="w-full pl-12 pr-12 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                  placeholder="Enter password"
                                  required
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                                >
                                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                              </div>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                Confirm Password | تأكيد كلمة المرور *
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                autoComplete="new-password"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                placeholder="Confirm password"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 1 && (
                        // Organization Information Tab
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4 text-center">
                            Organization Details | معلومات المؤسسة
                          </h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Organization Name | اسم المؤسسة *
                            </label>
                            <div className="relative">
                              <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-5 h-5" />
                              <input
                                type="text"
                                name="organizationName"
                                value={formData.organizationName}
                                onChange={handleChange}
                                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                placeholder="Your Organization Name"
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Legal Structure | الهيكل القانوني *
                            </label>
                            <select
                              name="legalStructure"
                              value={formData.legalStructure}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                              required
                            >
                              <option value="" className="bg-gray-800">Select structure</option>
                              {legalStructures.map(structure => (
                                <option key={structure.value} value={structure.value} className="bg-gray-800">
                                  {structure.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                Industry | الصناعة *
                              </label>
                              <select
                                name="industry"
                                value={formData.industry}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                required
                              >
                                <option value="" className="bg-gray-800">Select industry</option>
                                {industries.map(industry => (
                                  <option key={industry.value} value={industry.value} className="bg-gray-800">
                                    {industry.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                Number of Employees | عدد الموظفين *
                              </label>
                              <select
                                name="employeeCount"
                                value={formData.employeeCount}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                required
                              >
                                <option value="" className="bg-gray-800">Select range</option>
                                {employeeCounts.map(count => (
                                  <option key={count.value} value={count.value} className="bg-gray-800">
                                    {count.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              What are you looking for? | ما الذي تبحث عنه؟ *
                            </label>
                            <select
                              name="lookingFor"
                              value={formData.lookingFor}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                              required
                            >
                              <option value="" className="bg-gray-800">Select your primary need</option>
                              {lookingForOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-gray-800">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}

                      {activeTab === 2 && (
                        // Address & Office Tab
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-white mb-4 text-center">
                            Address & Office | العنوان والمكتب
                          </h3>
                          
                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Company Address | عنوان الشركة *
                            </label>
                            <textarea
                              name="address"
                              value={formData.address}
                              onChange={handleChange}
                              rows="3"
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40 resize-none"
                              placeholder="Enter complete address"
                              required
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                Country | البلد *
                              </label>
                              <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                required
                              >
                                <option value="" className="bg-gray-800">Select country</option>
                                {countries.map(country => (
                                  <option key={country.value} value={country.value} className="bg-gray-800">
                                    {country.flag} {country.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white/90 mb-2">
                                City | المدينة *
                              </label>
                              <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                                required
                              >
                                <option value="" className="bg-gray-800">Select city</option>
                                {saudiCities.map(city => (
                                  <option key={city.value} value={city.value} className="bg-gray-800">
                                    {city.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Website | الموقع الإلكتروني
                            </label>
                            <input
                              type="url"
                              name="website"
                              value={formData.website}
                              onChange={handleChange}
                              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/40"
                              placeholder="https://www.company.com"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-white/90 mb-2">
                              Do you have an internal compliance/risk office? | هل لديكم مكتب امتثال/مخاطر داخلي؟ *
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                  type="radio"
                                  name="hasInternalOffice"
                                  value="yes"
                                  checked={formData.hasInternalOffice === 'yes'}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-blue-600"
                                  required
                                />
                                <span className="text-white/90">Yes | نعم</span>
                              </label>
                              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                  type="radio"
                                  name="hasInternalOffice"
                                  value="no"
                                  checked={formData.hasInternalOffice === 'no'}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-blue-600"
                                  required
                                />
                                <span className="text-white/90">No | لا</span>
                              </label>
                              <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                                <input
                                  type="radio"
                                  name="hasInternalOffice"
                                  value="planning"
                                  checked={formData.hasInternalOffice === 'planning'}
                                  onChange={handleChange}
                                  className="w-4 h-4 text-blue-600"
                                  required
                                />
                                <span className="text-white/90">Planning | نخطط</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeTab === 3 && (
                        // Agreement Tab
                        <div className="space-y-6">
                          <h3 className="text-lg font-semibold text-white mb-4 text-center">
                            Agreement & Submit | الموافقة والإرسال
                          </h3>
                          
                          <div className="bg-white/5 rounded-xl p-6 space-y-4">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                name="agreeToTerms"
                                checked={formData.agreeToTerms}
                                onChange={handleChange}
                                className="mt-1 w-4 h-4 text-white bg-white/10 border-white/20 rounded focus:ring-white/40"
                                required
                              />
                              <span className="text-sm text-white/80">
                                I agree to join the Shahin-AI journey and accept the{' '}
                                <a href="#" className="text-white underline">Terms and Conditions</a>
                                <br />
                                <span dir="rtl">أوافق على الانضمام لرحلة شاهين الذكي وأقبل الشروط والأحكام</span>
                              </span>
                            </div>
                          </div>

                          <div className="text-center space-y-4">
                            <div className="bg-blue-500/20 rounded-xl p-4">
                              <h4 className="text-white font-semibold mb-2">Ready to Transform?</h4>
                              <p className="text-white/70 text-sm" dir="rtl">
                                مستعد للتحول؟ انضم إلى أكثر من 500 مؤسسة تثق بحلولنا
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>

                  {/* Navigation Buttons */}
                  <div className="flex justify-between items-center pt-6">
                    <button
                      type="button"
                      onClick={handlePrevTab}
                      disabled={activeTab === 0}
                      className="px-6 py-2 text-white/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      ← Previous | السابق
                    </button>

                    {activeTab < registrationTabs.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNextTab}
                        disabled={!tabValidation[activeTab]}
                        className="px-6 py-2 bg-white text-gray-900 rounded-lg hover:bg-white/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        Next | التالي
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || !tabValidation[activeTab]}
                        className="px-8 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3"
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <>
                            <Star className="w-5 h-5" />
                            <div>
                              <div dir="rtl">استكشف القصة</div>
                              <div className="text-sm opacity-70">Explore the Story</div>
                            </div>
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </motion.button>
                    )}
                  </div>
                </form>

                {/* Back Button */}
                <div className="text-center mt-6">
                  <button
                    onClick={() => setShowRegistration(false)}
                    className="text-white/70 hover:text-white text-sm transition-colors"
                  >
                    ← Back to Story | العودة للقصة
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Exit Intent Popup */}
      <ExitIntentPopup
        isVisible={showExitPopup}
        onClose={handleExitPopupClose}
        onSubmit={handleExitPopupSubmit}
      />
    </div>
  );
};

export default StoryDrivenRegistration;
