import React, { createContext, useContext, useEffect, useReducer } from 'react';
import webSocketService from '../services/websocket';
import { useApp } from './AppContext';

// WebSocket Context
const WebSocketContext = createContext();

// Initial state for WebSocket
const initialWebSocketState = {
  connected: false,
  error: null,
  reconnectAttempts: 0,
  activeRooms: [],
  notifications: [],
  unreadCount: 0
};

// WebSocket reducer
const webSocketReducer = (state, action) => {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return {
        ...state,
        connected: action.payload.connected,
        error: action.payload.connected ? null : state.error,
        reconnectAttempts: action.payload.reconnectAttempts || 0
      };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications].slice(0, 50),
        unreadCount: state.unreadCount + 1
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif =>
          notif.id === action.payload ? { ...notif, read: true } : notif
        ),
        unreadCount: Math.max(0, state.unreadCount - 1)
      };

    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(notif => ({ ...notif, read: true })),
        unreadCount: 0
      };

    case 'JOIN_ROOM':
      return {
        ...state,
        activeRooms: [...state.activeRooms.filter(room => room !== action.payload), action.payload]
      };

    case 'LEAVE_ROOM':
      return {
        ...state,
        activeRooms: state.activeRooms.filter(room => room !== action.payload)
      };

    default:
      return state;
  }
};

// WebSocket Provider Component
export const WebSocketProvider = ({ children }) => {
  const [state, dispatch] = useReducer(webSocketReducer, initialWebSocketState);
  let appState = { token: null, isAuthenticated: false };
  try {
    const app = useApp();
    appState = app?.state || appState;
  } catch {}
  const { token, isAuthenticated } = appState;

  // Initialize WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && token) {
      console.log('[WebSocket Provider] Initializing connection with token');
      webSocketService.connect(token);

      // Subscribe to connection status changes
      const unsubscribeStatus = webSocketService.on('connection_status', (status) => {
        dispatch({ type: 'SET_CONNECTION_STATUS', payload: status });
      });

      // Subscribe to connection errors
      const unsubscribeError = webSocketService.on('connection_error', ({ error }) => {
        dispatch({ type: 'SET_ERROR', payload: error });
      });

      // Subscribe to workflow notifications
      const unsubscribeNotifications = webSocketService.on('workflow_notification', (notification) => {
        dispatch({
          type: 'ADD_NOTIFICATION',
          payload: {
            ...notification,
            id: Date.now() + Math.random(),
            read: false
          }
        });
      });

      return () => {
        unsubscribeStatus();
        unsubscribeError();
        unsubscribeNotifications();
      };
    } else if (!isAuthenticated) {
      // Disconnect when user logs out
      console.log('[WebSocket Provider] Disconnecting due to logout');
      webSocketService.disconnect();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: { connected: false } });
    }
  }, [isAuthenticated, token]);

  // Context value
  const contextValue = {
    // State
    ...state,

    // Actions
    connect: (authToken) => {
      webSocketService.connect(authToken);
    },

    disconnect: () => {
      webSocketService.disconnect();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: { connected: false } });
    },

    reconnect: () => {
      webSocketService.reconnect();
    },

    joinAssessment: (assessmentId) => {
      webSocketService.joinAssessment(assessmentId);
      dispatch({ type: 'JOIN_ROOM', payload: `assessment_${assessmentId}` });
    },

    updateAssessment: (assessmentId, field, value) => {
      webSocketService.updateAssessment(assessmentId, field, value);
    },

    joinDocument: (documentId) => {
      webSocketService.joinDocument(documentId);
      dispatch({ type: 'JOIN_ROOM', payload: `document_${documentId}` });
    },

    triggerWorkflowAction: (workflowId, action, targetUserId, metadata) => {
      webSocketService.triggerWorkflowAction(workflowId, action, targetUserId, metadata);
    },

    markNotificationAsRead: (notificationId) => {
      dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notificationId });
    },

    markAllNotificationsAsRead: () => {
      dispatch({ type: 'MARK_ALL_READ' });
    },

    // Direct access to WebSocket service for advanced usage
    webSocketService
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketContext;
