// Custom hooks for Enhanced Glass Sidebar  
import { useState, useEffect, useCallback } from 'react';  
  
// Hook for managing command palette state  
export const useCommandPalette = () => {  
  const [isOpen, setIsOpen] = useState(false);  
  const [searchTerm, setSearchTerm] = useState('');  
  
  const openPalette = useCallback(() => {  
    setIsOpen(true);  
    setSearchTerm('');  
  }, []);  
  
  const closePalette = useCallback(() => {  
    setIsOpen(false);  
    setSearchTerm('');  
  }, []);  
  
  const togglePalette = useCallback(() => {  
    setIsOpen(prev => !prev);  
    if (isOpen) setSearchTerm('');  
  }, [isOpen]);  
  
  return {  
    isOpen,  
    searchTerm,  
    setSearchTerm,  
    openPalette,  
    closePalette,  
    togglePalette  
  };  
}; 
  
// Hook for managing sidebar UI state  
export const useSidebar = () => {  
  const [isCollapsed, setIsCollapsed] = useState(false);  
  const [isMobile, setIsMobile] = useState(false);  
  
  useEffect(() => {  
    const checkMobile = () => {  
      setIsMobile(window.innerWidth < 768);  
      if (window.innerWidth < 768) {  
        setIsCollapsed(true);  
      }  
    };  
  
    checkMobile();  
    window.addEventListener('resize', checkMobile);  
    return () => window.removeEventListener('resize', checkMobile);  
  }, []);  
  
  const toggleSidebar = useCallback(() => {  
    setIsCollapsed(prev => !prev);  
  }, []);  
  
  return {  
    isCollapsed,  
    isMobile,  
    toggleSidebar,  
    setIsCollapsed  
  };  
}; 
  
// Hook for keyboard shortcuts and accessibility  
export const useKeyboardShortcuts = (callbacks = {}) => {  
  useEffect(() => {  
    const handleKeyDown = (e) => {  
      // Command Palette: Ctrl/Cmd + K  
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {  
        e.preventDefault();  
        callbacks.onCommandPalette?.();  
      }  
ECHO is on.
      // Escape key  
      if (e.key === 'Escape') {  
        callbacks.onEscape?.();  
      }  
ECHO is on.
      // Sidebar toggle: Ctrl/Cmd + \\  
      if ((e.ctrlKey || e.metaKey) && e.key === '\\') {  
        e.preventDefault();  
        callbacks.onToggleSidebar?.();  
      }  
    };  
  
    window.addEventListener('keydown', handleKeyDown);  
    return () => window.removeEventListener('keydown', handleKeyDown);  
  }, [callbacks]);  
};  
  
// Hook for toast notifications  
export const useToast = () => {  
  // This would integrate with your toast library (sonner, react-hot-toast, etc.)  
  const showToast = useCallback((message, type = 'info') => {  
    console.log(`Toast [${type}]: ${message}`);  
    // Replace with actual toast implementation  
  }, []);  
  
  return { showToast };  
}; 
