import React, { useState, useEffect } from 'react';  
import { Bot, Brain, Search, Calendar, FileText, BarChart3 } from 'lucide-react';  
  
const AIAgentsPanel = () => {  
  const [agents, setAgents] = useState([]);  
  const [loading, setLoading] = useState(true);  
  
  useEffect(() => {  
    fetch('http://localhost:11434/api/agents')  
      .then(res => res.json())  
      .then(data => {  
        setAgents(data.agents || []);  
        setLoading(false);  
      })  
      .catch(() => {  
        setLoading(false);  
        // Fallback data if LLM server is not available  
        setAgents([  
          { id: 'compliance-scanner', name: 'Compliance Scanner', status: 'offline', description: 'Connect to LLM server to activate' }  
        ]);  
      });  
  }, []);  
  
  const getAgentIcon = (id) => {  
    switch (id) {  
      case 'compliance-scanner': return Search;  
      case 'risk-analyzer': return Brain;  
      case 'evidence-collector': return FileText;  
      case 'smart-scheduler': return Calendar;  
      case 'report-generator': return BarChart3;  
      default: return Bot;  
    }  
  };  
  
  if (loading) {  
    return (  
      <div className="glass rounded-lg p-4">  
        <p className="text-white">Loading AI agents...</p>  
      </div>  
    );  
  }  
  
  return (  
    <div className="glass rounded-lg p-4">  
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">  
        <Bot className="h-5 w-5" />  
        AI Agents ({agents.length})  
      </h3>  
      <div className="space-y-3">  
        {agents.map(agent => {  
          const Icon = getAgentIcon(agent.id);  
          return (  
            <div key={agent.id} className="bg-white bg-opacity-10 rounded-lg p-3 hover:bg-opacity-20 transition-all cursor-pointer">  
              <div className="flex items-center justify-between">  
                <div className="flex items-center gap-3">  
                  <Icon className="h-5 w-5 text-blue-400" />  
                  <div>  
                    <p className="font-medium text-white">{agent.name}</p>  
                    <p className="text-sm text-gray-300">{agent.description}</p>  
                  </div>  
                </div>  
                <div className={`w-2 h-2 rounded-full ${agent.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>  
              </div>  
            </div>  
          );  
        })}  
      </div>  
    </div>  
  );  
};  
  
export default AIAgentsPanel; 
