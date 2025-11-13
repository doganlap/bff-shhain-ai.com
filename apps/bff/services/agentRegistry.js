// services/agentRegistry.js

// This is the official rulebook for the AI Agentic System.
// It defines the scope and capabilities of each agent.

const agents = [
    {
      id: 'compliance-scanner',
      name: 'Compliance Scanner',
      scope: ['framework', 'control'], // Can only interact with frameworks and controls
      capabilities: ['findMany', 'findUnique'] // Can only read data
    },
    {
      id: 'risk-analyzer',
      name: 'Risk Analyzer',
      scope: ['risk'], // Can only interact with risks
      capabilities: ['findMany', 'update', 'create'] // Can read, update, and create risks
    },
    {
      id: 'evidence-collector',
      name: 'Evidence Collector',
      scope: ['evidence', 'assessment'], // Can interact with evidence and assessments
      capabilities: ['create', 'findMany'] // Can create evidence and read assessments
    },
    {
      id: 'grc-assistant',
      name: 'GRC Assistant',
      scope: ['all'], // Has a broad scope
      capabilities: ['findMany', 'findUnique'] // But can only read data
    },
    {
      id: 'report-generator',
      name: 'Report Generator',
      scope: ['risk', 'assessment', 'compliance'],
      capabilities: ['findMany'] // Can only read data to generate reports
    }
];

const getAgentById = (agentId) => {
    return agents.find(a => a.id === agentId);
};

module.exports = { getAgentById };
