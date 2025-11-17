import { io } from 'socket.io-client';

class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.eventHandlers = new Map();
    this.currentRooms = new Set();
  }

  // Initialize WebSocket connection
  connect(token) {
    if (this.socket && this.isConnected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    if (import.meta.env?.VITE_WS_DISABLED === 'true') {
      console.log('[WebSocket] Disabled by configuration');
      return;
    }
    const wsUrl = import.meta.env?.VITE_WS_URL || 'http://localhost:3006';

    this.socket = io(wsUrl, {
      auth: {
        token: token
      },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 1,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    this.setupEventHandlers();
    console.log('[WebSocket] Connecting to:', wsUrl);
  }

  // Setup default event handlers
  setupEventHandlers() {
    this.socket.on('connect', () => {
      console.log('[WebSocket] Connected successfully');
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('[WebSocket] Disconnected:', reason);
      this.isConnected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('connect_error', (error) => {
      console.error('[WebSocket] Connection error:', error);
      this.reconnectAttempts++;
      this.emit('connection_error', { error, attempts: this.reconnectAttempts });
    });

    this.socket.on('error', (error) => {
      console.error('[WebSocket] Socket error:', error);
      this.emit('socket_error', error);
    });

    // Handle real-time assessment updates
    this.socket.on('assessment_updated', (data) => {
      this.emit('assessment_updated', data);
    });

    // Handle user presence updates
    this.socket.on('user_joined', (data) => {
      this.emit('user_joined', data);
    });

    this.socket.on('user_left', (data) => {
      this.emit('user_left', data);
    });

    // Handle room status updates
    this.socket.on('room_status', (data) => {
      this.emit('room_status', data);
    });

    // Handle document collaboration
    this.socket.on('document_edited', (data) => {
      this.emit('document_edited', data);
    });

    // Handle workflow notifications
    this.socket.on('workflow_notification', (data) => {
      this.emit('workflow_notification', data);
    });

    this.socket.on('workflow_updated', (data) => {
      this.emit('workflow_updated', data);
    });

    // Handle typing indicators
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    // Handle cursor updates
    this.socket.on('cursor_updated', (data) => {
      this.emit('cursor_updated', data);
    });
  }

  // Generic event emitter for custom handlers
  emit(event, data) {
    const handlers = this.eventHandlers.get(event) || [];
    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[WebSocket] Error in event handler for ${event}:`, error);
      }
    });
  }

  // Subscribe to events
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Remove event listener
  off(event, handler) {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  // Assessment collaboration methods
  joinAssessment(assessmentId) {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected, cannot join assessment');
      return;
    }

    this.socket.emit('join_assessment', { assessmentId });
    this.currentRooms.add(`assessment_${assessmentId}`);
    console.log('[WebSocket] Joining assessment:', assessmentId);
  }

  updateAssessment(assessmentId, field, value) {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected, cannot update assessment');
      return;
    }

    this.socket.emit('assessment_update', {
      assessmentId,
      field,
      value,
      timestamp: new Date().toISOString()
    });
  }

  // Document collaboration methods
  joinDocument(documentId) {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected, cannot join document');
      return;
    }

    this.currentRooms.add(`document_${documentId}`);
    console.log('[WebSocket] Joining document:', documentId);
  }

  editDocument(documentId, operation, cursor, content) {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected, cannot edit document');
      return;
    }

    this.socket.emit('document_edit', {
      documentId,
      operation,
      cursor,
      content
    });
  }

  // Workflow collaboration methods
  triggerWorkflowAction(workflowId, action, targetUserId, metadata = {}) {
    if (!this.isConnected) {
      console.warn('[WebSocket] Not connected, cannot trigger workflow action');
      return;
    }

    this.socket.emit('workflow_action', {
      workflowId,
      action,
      targetUserId,
      metadata
    });
  }

  // Typing indicators
  startTyping(resourceType, resourceId) {
    if (!this.isConnected) return;

    this.socket.emit('typing_start', { resourceType, resourceId });
  }

  stopTyping(resourceType, resourceId) {
    if (!this.isConnected) return;

    this.socket.emit('typing_stop', { resourceType, resourceId });
  }

  // Cursor position sharing
  updateCursorPosition(resourceType, resourceId, position, selection = null) {
    if (!this.isConnected) return;

    this.socket.emit('cursor_position', {
      resourceType,
      resourceId,
      position,
      selection
    });
  }

  // Connection status
  getConnectionStatus() {
    return {
      connected: this.isConnected,
      socketId: this.socket?.id,
      transport: this.socket?.io?.engine?.transport?.name,
      reconnectAttempts: this.reconnectAttempts
    };
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      console.log('[WebSocket] Manually disconnecting');
      this.socket.disconnect();
      this.isConnected = false;
      this.currentRooms.clear();
      this.eventHandlers.clear();
    }
  }

  // Force reconnect
  reconnect() {
    if (this.socket) {
      console.log('[WebSocket] Forcing reconnection');
      this.socket.connect();
    }
  }
}

// Create singleton instance
const webSocketService = new WebSocketService();

export default webSocketService;
