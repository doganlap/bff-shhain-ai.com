export const agentsRegistry = [
  { id: 'grc-assistant', name: 'GRC Assistant', description: 'General GRC helper', tasks: ['status','help','route-suggest'] },
  { id: 'assessments-agent', name: 'Assessments Agent', description: 'Manage assessments and reviews', tasks: ['list','create','assign','approve'] },
  { id: 'frameworks-agent', name: 'Frameworks Agent', description: 'Framework mapping and applicability', tasks: ['fetch','map-controls','assign-assessments'] },
  { id: 'documents-agent', name: 'Documents Agent', description: 'Evidence and documents management', tasks: ['upload','tag','link-controls'] },
  { id: 'workflows-agent', name: 'Workflows Agent', description: 'Approval workflows', tasks: ['create','delegate','approve','reassign'] },
  { id: 'notifications-agent', name: 'Notifications Agent', description: 'Announcements and alerts', tasks: ['broadcast','segment','audit'] }
];