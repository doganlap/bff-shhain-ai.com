import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, User } from 'lucide-react';
import { useWorkflowNotifications } from '../../hooks/useWebSocket';

const WorkflowNotificationPanel = ({ isOpen, onClose, className = '' }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useWorkflowNotifications();

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} minutes ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hours ago`;
    return date.toLocaleDateString();
  };

  const getNotificationIcon = (action) => {
    switch (action) {
      case 'approved':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-500" />;
      case 'review_requested':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Bell className="h-4 w-4 text-blue-500" />;
    }
  };

  const getNotificationMessage = (notification) => {
    const { action, fromUser, metadata } = notification;

    switch (action) {
      case 'approved':
        return `Assessment approved by ${fromUser}`;
      case 'rejected':
        return `Assessment rejected by ${fromUser}`;
      case 'review_requested':
        return `Review requested by ${fromUser}`;
      case 'comment_added':
        return `New comment from ${fromUser}`;
      case 'evidence_uploaded':
        return `Evidence uploaded by ${fromUser}`;
      default:
        return `${action} by ${fromUser}`;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border z-50 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-gray-600" />
          <h3 className="font-semibold text-gray-900">Workflow Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Actions */}
      {notifications.length > 0 && unreadCount > 0 && (
        <div className="p-3 border-b bg-gray-50">
          <button
            onClick={markAllAsRead}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Mark all as read
          </button>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-12 w-12 mx-auto mb-2 text-gray-300" />
            <p>No notifications yet</p>
            <p className="text-sm">Workflow updates will appear here</p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification, index) => (
              <div
                key={index}
                className={`p-4 hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.action)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {getNotificationMessage(notification)}
                    </p>
                    {notification.metadata?.message && (
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.metadata.message}
                      </p>
                    )}
                    <div className="flex items-center space-x-2 mt-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(notification.timestamp)}
                      </span>
                      {notification.workflowId && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Workflow {notification.workflowId.slice(0, 8)}
                        </span>
                      )}
                    </div>
                  </div>
                  {!notification.read && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowNotificationPanel;
