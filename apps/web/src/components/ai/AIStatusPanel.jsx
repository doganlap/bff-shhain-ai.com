import React, { useState, useEffect } from 'react';
import { Bot, AlertTriangle, CheckCircle, RefreshCw, ExternalLink, Terminal } from 'lucide-react';
import { aiService } from '../../services/aiService';

const AIStatusPanel = () => {
  const [status, setStatus] = useState(null);
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(false);

  const checkAIStatus = async () => {
    setLoading(true);
    try {
      await aiService.checkConnection();
      const statusInfo = aiService.getConnectionStatus();
      const agentsList = await aiService.getAgents();
      
      setStatus(statusInfo);
      setAgents(agentsList);
    } catch (error) {
      console.error('Failed to check AI status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAIStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkAIStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const setupInstructions = aiService.getSetupInstructions();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${status?.isConnected ? 'bg-green-100' : 'bg-orange-100'}`}>
            <Bot className={`h-5 w-5 ${status?.isConnected ? 'text-green-600' : 'text-orange-600'}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">AI Service Status</h3>
            <p className="text-sm text-gray-600" dir="rtl">حالة خدمة الذكاء الاصطناعي</p>
          </div>
        </div>
        <button
          onClick={checkAIStatus}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Status Display */}
      <div className={`p-4 rounded-lg border-l-4 ${
        status?.isConnected 
          ? 'bg-green-50 border-green-400' 
          : 'bg-orange-50 border-orange-400'
      }`}>
        <div className="flex items-center gap-2 mb-2">
          {status?.isConnected ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          )}
          <span className={`font-medium ${
            status?.isConnected ? 'text-green-800' : 'text-orange-800'
          }`}>
            {status?.isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        <p className={`text-sm ${
          status?.isConnected ? 'text-green-700' : 'text-orange-700'
        }`}>
          {status?.messageEn}
        </p>
        
        <p className={`text-sm mt-1 ${
          status?.isConnected ? 'text-green-700' : 'text-orange-700'
        }`} dir="rtl">
          {status?.message}
        </p>
      </div>

      {/* AI Agents Status */}
      {agents.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">AI Agents</h4>
          <div className="space-y-2">
            {agents.map(agent => (
              <div key={agent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    agent.status === 'online' ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{agent.name}</p>
                    <p className="text-xs text-gray-600" dir="rtl">{agent.nameAr}</p>
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  agent.status === 'online' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup Instructions */}
      {!status?.isConnected && (
        <div className="mt-4">
          <button
            onClick={() => setShowInstructions(!showInstructions)}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <Terminal className="h-4 w-4" />
            Setup Instructions | تعليمات الإعداد
          </button>

          {showInstructions && (
            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h5 className="font-medium text-blue-900 mb-3">{setupInstructions.title}</h5>
              <h6 className="font-medium text-blue-900 mb-3" dir="rtl">{setupInstructions.titleAr}</h6>
              
              <ol className="space-y-2">
                {setupInstructions.steps.map(step => (
                  <li key={step.step} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
                      {step.step}
                    </span>
                    <div>
                      <p className="text-sm text-blue-800">{step.instruction}</p>
                      <p className="text-sm text-blue-700" dir="rtl">{step.instructionAr}</p>
                    </div>
                  </li>
                ))}
              </ol>

              <div className="mt-4 p-3 bg-blue-100 rounded border border-blue-300">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Ollama is required for AI features. Visit{' '}
                  <a 
                    href="https://ollama.ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                  >
                    ollama.ai <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
                <p className="text-xs text-blue-800 mt-1" dir="rtl">
                  <strong>ملاحظة:</strong> Ollama مطلوب لميزات الذكاء الاصطناعي
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIStatusPanel;
