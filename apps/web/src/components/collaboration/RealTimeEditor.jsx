import React, { useEffect, useRef } from 'react';
import { Type, Edit3 } from 'lucide-react';
import { useDocumentCollaboration } from '../../hooks/useWebSocket';

const RealTimeEditor = ({ documentId, content, onChange, className = '' }) => {
  const editorRef = useRef(null);
  const lastChangeRef = useRef(null);
  const {
    typingUsers,
    cursors,
    startTyping,
    stopTyping,
    updateCursor,
    editDocument
  } = useDocumentCollaboration(documentId);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const handleInput = (e) => {
      const newContent = e.target.value;
      const cursorPosition = e.target.selectionStart;

      // Start typing indicator
      startTyping();

      // Update cursor position
      updateCursor(cursorPosition);

      // Call parent onChange
      if (onChange) {
        onChange(newContent);
      }

      // Send document edit to other users
      editDocument('edit', cursorPosition, newContent);

      // Clear typing indicator after a delay
      clearTimeout(lastChangeRef.current);
      lastChangeRef.current = setTimeout(() => {
        stopTyping();
      }, 1000);
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        updateCursor(range.startOffset, {
          start: range.startOffset,
          end: range.endOffset
        });
      }
    };

    editor.addEventListener('input', handleInput);
    editor.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      editor.removeEventListener('input', handleInput);
      editor.removeEventListener('selectionchange', handleSelectionChange);
      if (lastChangeRef.current) {
        clearTimeout(lastChangeRef.current);
      }
    };
  }, [documentId, onChange, startTyping, stopTyping, updateCursor, editDocument]);

  return (
    <div className={`relative ${className}`}>
      {/* Typing Indicators */}
      {typingUsers.length > 0 && (
        <div className="absolute -top-8 left-0 flex items-center space-x-2 text-sm text-gray-600">
          <Type className="h-4 w-4 animate-pulse" />
          <span>
            {typingUsers.length === 1
              ? `User ${typingUsers[0]} is typing...`
              : `${typingUsers.length} users are typing...`
            }
          </span>
        </div>
      )}

      {/* Editor */}
      <textarea
        ref={editorRef}
        value={content}
        onChange={() => {}} // Handled by the input event listener
        className={`w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none ${className}`}
        placeholder="Start typing..."
        rows={10}
      />

      {/* Cursor Indicators */}
      {Object.entries(cursors).map(([userId, cursor]) => (
        <div
          key={userId}
          className="absolute pointer-events-none"
          style={{
            top: `${Math.floor(cursor.position / 80) * 1.5 + 1}rem`,
            left: `${(cursor.position % 80) * 0.6}rem`
          }}
        >
          <div className="flex items-center space-x-1">
            <div className="h-4 w-0.5 bg-blue-500 animate-pulse"></div>
            <span className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded">
              {userId.slice(0, 4)}
            </span>
          </div>
        </div>
      ))}

      {/* Collaboration Status */}
      <div className="absolute bottom-2 right-2 flex items-center space-x-1 text-xs text-gray-500">
        <Edit3 className="h-3 w-3" />
        <span>Real-time collaboration enabled</span>
      </div>
    </div>
  );
};

export default RealTimeEditor;
