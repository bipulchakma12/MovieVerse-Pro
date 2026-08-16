'use client';

import React, { useEffect } from 'react';

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    // 1. Disable Right Click (Context Menu)
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Disable DevTools Shortcuts (F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
      ) {
        e.preventDefault();
      }
    };

    // 3. Disable Drag and Drop for images/media
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
    };

    // 4. Block unauthorized ad redirects & popunders
    const originalOpen = window.open;
    window.open = function (...args: any[]) {
      const url = args[0] ? String(args[0]) : '';
      if (url.startsWith('/') || (typeof window !== 'undefined' && url.includes(window.location.hostname))) {
        return originalOpen.apply(window, args as any);
      }
      console.log('Blocked ad popup window:', url);
      return null;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      window.open = originalOpen;
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  return <div className="select-none">{children}</div>;
};
