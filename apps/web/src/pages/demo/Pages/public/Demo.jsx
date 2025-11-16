import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const DemoPage = () => {
  const navigate = useNavigate();

  const handleDemoAccess = () => {
    navigate('/register');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-white mb-8">Welcome to the Demo Section</h1>
        <p className="text-xl text-gray-300 mb-12">Explore the features of Shahin-AI and start your journey towards better governance.</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleDemoAccess}
          className="px-12 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-green-500/20 transition-all duration-300 flex items-center gap-3 mx-auto"
        >
          <Sparkles className="w-6 h-6" />
          <div>
            <div dir="rtl">ابدأ رحلتك مع شاهين الذكي</div>
            <div className="text-sm opacity-90">Begin Your Journey with Shahin-AI</div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default DemoPage;
