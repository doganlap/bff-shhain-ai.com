import { useEffect, useRef, useState, useCallback } from 'react';
import webSocketService from '../services/websocket';

// Hook for real-time assessment collaboration
export const useAssessmentCollaboration = (assessmentId) => {
  const [collaborators, setCollaborators] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const unsubscribeRefs = useRef([]);

  useEffect(() => {
    if (!assessmentId) return;

    // Join assessment room
    webSocketService.joinAssessment(assessmentId);

    // Subscribe to events
    const unsubscribeStatus = webSocketService.on('connection_status', ({ connected }) => {
      setIsConnected(connected);
    });

    const unsubscribeRoomStatus = webSocketService.on('room_status', ({ activeUsers }) => {
      setCollaborators(activeUsers || []);
    });

    const unsubscribeUserJoined = webSocketService.on('user_joined', ({ userId }) => {
      setCollaborators(prev => [...prev, userId]);
    });

    const unsubscribeUserLeft = webSocketService.on('user_left', ({ userId }) => {
      setCollaborators(prev => prev.filter(id => id !== userId));
    });

    const unsubscribeAssessmentUpdated = webSocketService.on('assessment_updated', (data) => {
      setLastUpdate(data);
    });

    // Store unsubscribe functions
    unsubscribeRefs.current = [
      unsubscribeStatus,
      unsubscribeRoomStatus,
      unsubscribeUserJoined,
      unsubscribeUserLeft,
      unsubscribeAssessmentUpdated
    ];

    return () => {
      // Cleanup subscriptions
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    };
  }, [assessmentId]);

  const updateField = useCallback((field, value) => {
    if (!assessmentId) return;
    webSocketService.updateAssessment(assessmentId, field, value);
  }, [assessmentId]);

  return {
    collaborators,
    isConnected,
    lastUpdate,
    updateField
  };
};

// Hook for real-time document collaboration
export const useDocumentCollaboration = (documentId) => {
  const [collaborators, setCollaborators] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [cursors, setCursors] = useState({});
  const [isConnected, setIsConnected] = useState(false);
  const unsubscribeRefs = useRef([]);
  const typingTimeouts = useRef({});

  useEffect(() => {
    if (!documentId) return;

    webSocketService.joinDocument(documentId);

    const unsubscribeStatus = webSocketService.on('connection_status', ({ connected }) => {
      setIsConnected(connected);
    });

    const unsubscribeRoomStatus = webSocketService.on('room_status', ({ activeUsers }) => {
      setCollaborators(activeUsers || []);
    });

    const unsubscribeTyping = webSocketService.on('user_typing', ({ userId, action }) => {
      if (action === 'start') {
        setTypingUsers(prev => [...prev.filter(id => id !== userId), userId]);

        // Clear existing timeout
        if (typingTimeouts.current[userId]) {
          clearTimeout(typingTimeouts.current[userId]);
        }

        // Set timeout to remove typing indicator
        typingTimeouts.current[userId] = setTimeout(() => {
          setTypingUsers(prev => prev.filter(id => id !== userId));
          delete typingTimeouts.current[userId];
        }, 3000);
      } else {
        setTypingUsers(prev => prev.filter(id => id !== userId));
        if (typingTimeouts.current[userId]) {
          clearTimeout(typingTimeouts.current[userId]);
          delete typingTimeouts.current[userId];
        }
      }
    });

    const unsubscribeCursor = webSocketService.on('cursor_updated', ({ userId, position, selection }) => {
      setCursors(prev => ({
        ...prev,
        [userId]: { position, selection, timestamp: Date.now() }
      }));
    });

    unsubscribeRefs.current = [
      unsubscribeStatus,
      unsubscribeRoomStatus,
      unsubscribeTyping,
      unsubscribeCursor
    ];

    return () => {
      const timeouts = typingTimeouts.current;
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
      Object.values(timeouts).forEach(clearTimeout);
    };
  }, [documentId]);

  const startTyping = useCallback(() => {
    if (!documentId) return;
    webSocketService.startTyping('document', documentId);
  }, [documentId]);

  const stopTyping = useCallback(() => {
    if (!documentId) return;
    webSocketService.stopTyping('document', documentId);
  }, [documentId]);

  const updateCursor = useCallback((position, selection) => {
    if (!documentId) return;
    webSocketService.updateCursorPosition('document', documentId, position, selection);
  }, [documentId]);

  const editDocument = useCallback((operation, cursor, content) => {
    if (!documentId) return;
    webSocketService.editDocument(documentId, operation, cursor, content);
  }, [documentId]);

  return {
    collaborators,
    typingUsers,
    cursors,
    isConnected,
    startTyping,
    stopTyping,
    updateCursor,
    editDocument
  };
};

// Hook for workflow notifications
export const useWorkflowNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const unsubscribeRefs = useRef([]);

  useEffect(() => {
    const unsubscribeNotification = webSocketService.on('workflow_notification', (notification) => {
      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50
      setUnreadCount(prev => prev + 1);
    });

    const unsubscribeWorkflowUpdate = webSocketService.on('workflow_updated', (update) => {
      // Handle workflow updates differently than direct notifications
      console.log('[WebSocket] Workflow updated:', update);
    });

    unsubscribeRefs.current = [unsubscribeNotification, unsubscribeWorkflowUpdate];

    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
    setUnreadCount(0);
  }, []);

  const triggerAction = useCallback((workflowId, action, targetUserId, metadata) => {
    webSocketService.triggerWorkflowAction(workflowId, action, targetUserId, metadata);
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    triggerAction
  };
};

// Hook for general WebSocket connection management
export const useWebSocketConnection = () => {
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    socketId: null,
    transport: null,
    reconnectAttempts: 0
  });
  const [error, setError] = useState(null);
  const unsubscribeRefs = useRef([]);

  useEffect(() => {
    const unsubscribeStatus = webSocketService.on('connection_status', (status) => {
      setConnectionStatus(prev => ({ ...prev, ...status }));
      if (status.connected) {
        setError(null);
      }
    });

    const unsubscribeError = webSocketService.on('connection_error', ({ error, attempts }) => {
      setError(error);
      setConnectionStatus(prev => ({ ...prev, reconnectAttempts: attempts }));
    });

    const unsubscribeSocketError = webSocketService.on('socket_error', (error) => {
      setError(error);
    });

    unsubscribeRefs.current = [unsubscribeStatus, unsubscribeError, unsubscribeSocketError];

    // Get initial status
    setConnectionStatus(webSocketService.getConnectionStatus());

    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => unsubscribe());
    };
  }, []);

  const connect = useCallback((token) => {
    webSocketService.connect(token);
  }, []);

  const disconnect = useCallback(() => {
    webSocketService.disconnect();
  }, []);

  const reconnect = useCallback(() => {
    webSocketService.reconnect();
  }, []);

  return {
    connectionStatus,
    error,
    connect,
    disconnect,
    reconnect
  };
};

// Hook for real-time field updates with debouncing
export const useRealtimeField = (resourceType, resourceId, field, initialValue, delay = 500) => {
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef();
  const unsubscribeRef = useRef();

  useEffect(() => {
    // Subscribe to updates for this field
    if (resourceType === 'assessment') {
      unsubscribeRef.current = webSocketService.on('assessment_updated', (data) => {
        if (data.assessmentId === resourceId && data.field === field) {
          setValue(data.value);
          setIsUpdating(false);
        }
      });
    }

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [resourceType, resourceId, field]);

  const updateValue = useCallback((newValue) => {
    setValue(newValue);
    setIsUpdating(true);

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce the update
    timeoutRef.current = setTimeout(() => {
      if (resourceType === 'assessment') {
        webSocketService.updateAssessment(resourceId, field, newValue);
      }
      // Add other resource types as needed
    }, delay);
  }, [resourceType, resourceId, field, delay]);

  return [value, updateValue, isUpdating];
};
