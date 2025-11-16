import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Star, ArrowRight } from 'lucide-react';

const ExitIntentPopup = ({ isVisible, onClose, onSubmit }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questions = [
    {
      id: 'interest_level',
      titleAr: 'ما مدى اهتمامك بحلول الحوكمة الذكية؟',
      titleEn: 'How interested are you in smart governance solutions?',
      type: 'rating',
      options: [
        { value: 5, labelAr: 'مهتم جداً', labelEn: 'Very Interested' },
        { value: 4, labelAr: 'مهتم', labelEn: 'Interested' },
        { value: 3, labelAr: 'محايد', labelEn: 'Neutral' },
        { value: 2, labelAr: 'غير مهتم', labelEn: 'Not Interested' },
        { value: 1, labelAr: 'غير مهتم إطلاقاً', labelEn: 'Not Interested At All' }
      ]
    },
    {
      id: 'primary_need',
      titleAr: 'ما هي أولويتك الأساسية في الحوكمة؟',
      titleEn: 'What is your primary governance priority?',
      type: 'multiple_choice',
      options: [
        { value: 'compliance', labelAr: 'الامتثال التنظيمي', labelEn: 'Regulatory Compliance' },
        { value: 'risk_management', labelAr: 'إدارة المخاطر', labelEn: 'Risk Management' },
        { value: 'cost_reduction', labelAr: 'تقليل التكاليف', labelEn: 'Cost Reduction' },
        { value: 'efficiency', labelAr: 'تحسين الكفاءة', labelEn: 'Efficiency Improvement' },
        { value: 'digital_transformation', labelAr: 'التحول الرقمي', labelEn: 'Digital Transformation' }
      ]
    },
    {
      id: 'timeline',
      titleAr: 'متى تخطط لتنفيذ حلول الحوكمة؟',
      titleEn: 'When do you plan to implement governance solutions?',
      type: 'multiple_choice',
      options: [
        { value: 'immediate', labelAr: 'فوراً', labelEn: 'Immediately' },
        { value: '3_months', labelAr: 'خلال 3 أشهر', labelEn: 'Within 3 months' },
        { value: '6_months', labelAr: 'خلال 6 أشهر', labelEn: 'Within 6 months' },
        { value: '1_year', labelAr: 'خلال سنة', labelEn: 'Within 1 year' },
        { value: 'exploring', labelAr: 'أستكشف الخيارات', labelEn: 'Just exploring options' }
      ]
    },
    {
      id: 'contact_preference',
      titleAr: 'كيف تفضل أن نتواصل معك؟',
      titleEn: 'How would you prefer us to contact you?',
      type: 'multiple_choice',
      options: [
        { value: 'email', labelAr: 'البريد الإلكتروني', labelEn: 'Email' },
        { value: 'phone', labelAr: 'الهاتف', labelEn: 'Phone Call' },
        { value: 'whatsapp', labelAr: 'واتساب', labelEn: 'WhatsApp' },
        { value: 'meeting', labelAr: 'اجتماع شخصي', labelEn: 'In-person Meeting' },
        { value: 'no_contact', labelAr: 'لا أريد التواصل', labelEn: 'No contact needed' }
      ]
    }
  ];

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Prepare lead data
    const leadData = {
      timestamp: new Date().toISOString(),
      source: 'exit_intent_popup',
      answers: answers,
      session_data: {
        user_agent: navigator.userAgent,
        referrer: document.referrer,
        page_url: window.location.href
      }
    };

    try {
      // Save to localStorage for demo
      const existingLeads = JSON.parse(localStorage.getItem('shahin_leads') || '[]');
      existingLeads.push(leadData);
      localStorage.setItem('shahin_leads', JSON.stringify(existingLeads));
      
      console.log('Lead data captured:', leadData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSubmit(leadData);
    } catch (error) {
      console.error('Failed to submit lead data:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3 mb-4">
                <MessageCircle className="w-6 h-6" />
                <div>
                  <h3 className="text-lg font-bold">Quick Feedback</h3>
                  <p className="text-sm opacity-90" dir="rtl">ملاحظات سريعة</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="bg-white h-2 rounded-full transition-all duration-300"
                />
              </div>
              <p className="text-xs mt-2 opacity-75">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>

            {/* Question Content */}
            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentQuestion}
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">
                    {currentQ.titleEn}
                  </h4>
                  <p className="text-sm text-gray-600 mb-6" dir="rtl">
                    {currentQ.titleAr}
                  </p>

                  <div className="space-y-3">
                    {currentQ.type === 'rating' ? (
                      <div className="flex justify-between items-center">
                        {currentQ.options.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleAnswer(currentQ.id, option.value)}
                            className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                              answers[currentQ.id] === option.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Star 
                              className={`w-6 h-6 mb-1 ${
                                answers[currentQ.id] === option.value
                                  ? 'text-blue-500 fill-current'
                                  : 'text-gray-400'
                              }`}
                            />
                            <span className="text-xs text-center">
                              {option.labelEn}
                            </span>
                          </button>
                        ))}
                      </div>
                    ) : (
                      currentQ.options.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleAnswer(currentQ.id, option.value)}
                          className={`w-full p-4 text-left rounded-lg border-2 transition-all hover:scale-[1.02] ${
                            answers[currentQ.id] === option.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">
                                {option.labelEn}
                              </p>
                              <p className="text-sm text-gray-600" dir="rtl">
                                {option.labelAr}
                              </p>
                            </div>
                            {answers[currentQ.id] === option.value && (
                              <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-6 bg-gray-50 flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
              >
                Skip | تخطي
              </button>
              
              <button
                onClick={handleNext}
                disabled={!answers[currentQ.id] || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {currentQuestion < questions.length - 1 ? 'Next' : 'Submit'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExitIntentPopup;
