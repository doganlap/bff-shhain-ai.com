import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Sparkles, FlaskConical, ArrowRight, CheckCircle2, Lock, Play } from 'lucide-react';

const WelcomePage = () => {
  const navigate = useNavigate();

  const pathOptions = [
    {
      id: 'login',
      title: 'Login to Your Account',
      description: 'Access your full GRC environment with all features and data',
      icon: Lock,
      color: 'from-blue-600 to-blue-800',
      path: '/login',
      features: [
        'Full access to all features',
        'Your organization\'s data',
        'Customized dashboards',
        'Team collaboration tools'
      ]
    },
    {
      id: 'demo',
      title: 'Explore the Demo',
      description: 'Interactive walkthrough of Shahin GRC features with sample data',
      icon: Sparkles,
      color: 'from-purple-600 to-purple-800',
      path: '/demo',
      features: [
        'Interactive feature demos',
        'Sample assessments & frameworks',
        'Risk management showcase',
        'AI-powered compliance tools'
      ]
    },
    {
      id: 'poc',
      title: 'Try the POC Sandbox',
      description: 'Hands-on proof of concept environment - test drive the platform',
      icon: FlaskConical,
      color: 'from-green-600 to-green-800',
      path: '/poc',
      features: [
        'Full sandbox environment',
        'Create test assessments',
        'Experiment with features',
        'No commitment required'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Shahin GRC
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Choose how you&apos;d like to experience the future of Governance, Risk &amp; Compliance
          </p>
        </div>

        {/* Path Options */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {pathOptions.map((option) => (
            <div
              key={option.id}
              className="group relative bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 hover:bg-white/15 transition-all duration-300 cursor-pointer hover:scale-105"
              onClick={() => navigate(option.path)}
            >
              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br ${option.color} rounded-2xl mb-6 group-hover:scale-110 transition-transform`}>
                <option.icon className="w-8 h-8 text-white" />
              </div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-white mb-3">
                {option.title}
              </h3>
              <p className="text-gray-300 mb-6">
                {option.description}
              </p>

              {/* Features List */}
              <ul className="space-y-3 mb-6">
                {option.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start text-gray-200">
                    <CheckCircle2 className="w-5 h-5 text-green-400 mr-2 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all group-hover:gap-4">
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              {/* Glow Effect on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${option.color} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity pointer-events-none`}></div>
            </div>
          ))}
        </div>

        {/* Quick Info Banner */}
        <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-6">
          <div className="flex items-start gap-4">
            <div className="bg-blue-500/20 p-3 rounded-xl">
              <Play className="w-6 h-6 text-blue-300" />
            </div>
            <div>
              <h4 className="text-white font-semibold text-lg mb-2">
                Not sure where to start?
              </h4>
              <p className="text-gray-300 mb-4">
                We recommend trying the <strong className="text-white">Demo</strong> first to see all features in action,
                then dive into the <strong className="text-white">POC Sandbox</strong> to test drive the platform with your own scenarios.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => navigate('/demo')}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Start Demo Tour
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="text-center mt-12">
          <a
            href="http://localhost:4000"
            className="text-gray-300 hover:text-white transition-colors inline-flex items-center gap-2"
          >
            ← Back to Landing Page
          </a>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
