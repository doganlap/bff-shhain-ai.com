import React from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { useAssessmentCollaboration } from '../../hooks/useWebSocket';

const CollaborationIndicator = ({ assessmentId, className = '' }) => {
  const { collaborators, isConnected } = useAssessmentCollaboration(assessmentId);

  if (!assessmentId) return null;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Connection Status */}
      <div className={`flex items-center space-x-1 text-sm ${
        isConnected ? 'text-green-600' : 'text-red-600'
      }`}>
        {isConnected ? (
          <Wifi className="h-4 w-4" />
        ) : (
          <WifiOff className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
      </div>

      {/* Active Collaborators */}
      {isConnected && collaborators.length > 0 && (
        <div className="flex items-center space-x-1 text-sm text-blue-600">
          <Users className="h-4 w-4" />
          <span>{collaborators.length} collaborator{collaborators.length !== 1 ? 's' : ''}</span>
        </div>
      )}

      {/* Collaborator Avatars */}
      {isConnected && collaborators.length > 0 && (
        <div className="flex -space-x-2">
          {collaborators.slice(0, 3).map((userId, index) => (
            <div
              key={userId}
              className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
              title={`User ${userId}`}
            >
              {userId.slice(0, 2).toUpperCase()}
            </div>
          ))}
          {collaborators.length > 3 && (
            <div className="h-8 w-8 rounded-full bg-gray-500 flex items-center justify-center text-white text-xs font-medium border-2 border-white">
              +{collaborators.length - 3}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CollaborationIndicator;
