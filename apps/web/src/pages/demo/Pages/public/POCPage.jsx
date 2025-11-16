import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FlaskConical,
  Rocket,
  Shield,
  CheckCircle2,
  Users,
  FileText,
  BarChart3,
  Settings,
  Play,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const POCPage = () => {
  const navigate = useNavigate();
  const [pocStarted, setPocStarted] = useState(false);

  const pocFeatures = [
    {
      icon: Shield,
      title: 'Full Platform Access',
      description: 'Access all GRC features in a safe sandbox environment'
    },
    {
      icon: FileText,
      title: 'Create Assessments',
      description: 'Build and test real compliance assessments'
    },
    {
      icon: BarChart3,
      title: 'Generate Reports',
      description: 'Create executive dashboards and compliance reports'
    },
    {
      icon: Users,
      title: 'Test Workflows',
      description: 'Try multi-user collaboration and approval processes'
    },
    {
      icon: Settings,
      title: 'Configure Settings',
      description: 'Customize frameworks, controls, and risk parameters'
    },
    {
      icon: Sparkles,
      title: 'AI Features',
      description: 'Test AI-powered automation and intelligence'
    }
  ];

  const handleStartPOC = () => {
    setPocStarted(true);
    // Navigate to the main app with POC mode parameter
    setTimeout(() => {
      navigate('/app?mode=poc');
    }, 1500);
  };

  if (pocStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-500/30 mb-6 animate-pulse">
            <Rocket className="w-12 h-12 text-green-400 animate-bounce" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Launching Your POC Environment...
          </h2>
          <p className="text-xl text-gray-300">
            Setting up your personalized sandbox with sample data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-green-900 to-teal-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-green-500/20 backdrop-blur-xl rounded-full border border-green-500/30 px-6 py-3 mb-6">
            <FlaskConical className="w-5 h-5 text-green-400" />
            <span className="text-green-300 font-semibold">PROOF OF CONCEPT</span>
          </div>
          <h1 className="text-6xl font-bold text-white mb-6">
            Test Drive Shahin GRC
          </h1>
          <p className="text-2xl text-gray-300 max-w-3xl mx-auto mb-8">
            Get hands-on experience with a fully functional sandbox environment.
            No commitment, no credit card required.
          </p>

          {/* CTA Button */}
          <button
            onClick={handleStartPOC}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white text-xl font-bold py-4 px-10 rounded-2xl transition-all transform hover:scale-105 shadow-2xl"
          >
            <Play className="w-6 h-6" />
            <span>Launch POC Sandbox</span>
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-10">
            What You Can Do in the POC
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pocFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6 hover:bg-white/15 transition-all"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl mb-4">
                  <feature.icon className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-300 text-sm">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* What's Included */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-10 mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Your POC Includes
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">Pre-loaded Sample Data</h4>
                  <p className="text-gray-300 text-sm">Realistic compliance scenarios and assessments</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">200+ Frameworks</h4>
                  <p className="text-gray-300 text-sm">Including NCA, SAMA, SDAIA, ISO standards</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">AI-Powered Tools</h4>
                  <p className="text-gray-300 text-sm">Auto-assessments and smart recommendations</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">Full Feature Access</h4>
                  <p className="text-gray-300 text-sm">No restrictions - test everything</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">Interactive Dashboards</h4>
                  <p className="text-gray-300 text-sm">Real-time analytics and reporting</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-white font-semibold">Guided Tours</h4>
                  <p className="text-gray-300 text-sm">In-app help and feature walkthroughs</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Options */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
            <h3 className="text-2xl font-bold text-white text-center mb-6">
              Not Ready for Hands-On Yet?
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/demo')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Sparkles className="w-5 h-5" />
                <span>Watch Demos First</span>
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <Users className="w-5 h-5" />
                <span>Create Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="text-center mt-12 space-x-6">
          <button
            onClick={() => navigate('/welcome')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            ← Back to Welcome
          </button>
          <button
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Login Instead →
          </button>
        </div>
      </div>
    </div>
  );
};

export default POCPage;
