// pages/system/MissionControlPage.jsx

import React, { useState, useEffect, useRef } from 'react';

const MissionControlPage = () => {
  const [modules, setModules] = useState([]);
  const [agents, setAgents] = useState([]);
  const [models, setModels] = useState([]);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('grc-assistant');
  const [selectedModel, setSelectedModel] = useState('grc-assistant (mocked)');

  const chatWindowRef = useRef(null);

  const API_BASE_URL = 'http://localhost:11434'; // The AI Server

  useEffect(() => {
    // Fetch initial data
    const fetchData = async () => {
      try {
        const [modulesRes, agentsRes, modelsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/modules`),
          fetch(`${API_BASE_URL}/api/agents`),
          fetch(`${API_BASE_URL}/api/models`)
        ]);
        const modulesData = await modulesRes.json();
        const agentsData = await agentsRes.json();
        const modelsData = await modelsRes.json();
        setModules(modulesData.modules);
        setAgents(agentsData.agents);
        setModels(modelsData.models);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    // Scroll to bottom of chat window
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: 'user', text: input }];
    setMessages(newMessages);
    setInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: input, model: selectedModel })
      });
      const data = await response.json();
      setMessages([...newMessages, { sender: 'ai', text: data.response }]);
    } catch (error) {
      setMessages([...newMessages, { sender: 'ai', text: 'Error connecting to the AI service.' }]);
    }
  };

  return (
    <div className="h-screen flex bg-gray-900 text-white">
      {/* Left Sidebar: Modules */}
      <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Modules</h2>
        <div className="space-y-2">
          {modules.map(mod => (
            <div key={mod.id} className="p-3 bg-gray-700 rounded-md">
              <div className="flex justify-between items-center">
                <h3 className="font-bold">{mod.name}</h3>
                <span className={`w-3 h-3 rounded-full ${mod.status === 'healthy' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content: Chat */}
      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 flex flex-col bg-gray-800 rounded-xl p-4">
          <h2 className="text-2xl font-semibold mb-4">{agents.find(a => a.id === selectedAgent)?.name || 'AI Agent'}</h2>
          <div ref={chatWindowRef} className="flex-1 overflow-y-auto mb-4">
            {messages.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-600' : 'bg-gray-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="flex">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1 bg-gray-700 p-3 rounded-l-md focus:outline-none" />
            <button onClick={handleSendMessage} className="bg-blue-600 px-6 rounded-r-md">Send</button>
          </div>
        </div>
      </main>

      {/* Right Sidebar: Agents & Models */}
      <aside className="w-1/4 bg-gray-800 p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">AI Agents ({agents.length})</h2>
        <div className="space-y-2 mb-6">
          {agents.map(agent => (
            <div key={agent.id} onClick={() => setSelectedAgent(agent.id)} className={`p-3 rounded-md cursor-pointer ${selectedAgent === agent.id ? 'bg-blue-900' : 'bg-gray-700'}`}>
              <h3 className="font-semibold">{agent.name}</h3>
            </div>
          ))}
        </div>
        <h2 className="text-xl font-semibold mb-4">Available LLMs</h2>
        <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)} className="w-full bg-gray-700 p-2 rounded-md">
          {models.map(model => <option key={model.name} value={model.name}>{`${model.name} (${model.type})`}</option>)}
        </select>
      </aside>
    </div>
  );
};

export default MissionControlPage;
