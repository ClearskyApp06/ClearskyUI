// @ts-check
import React, { createContext, useContext, useEffect, useState } from 'react';

/**
 * @typedef {'light' | 'dark'} ThemeMode
 */

/**
 * @typedef {{
 *   mode: ThemeMode;
 *   toggleMode: () => void;
 * }} ThemeContextValue
 */

/** @type {React.Context<ThemeContextValue>} */
// @ts-ignore
const ThemeContext = createContext({
  mode: /** @type {ThemeMode} */ ('light'),
  toggleMode: () => {},
});

/**
 * Hook to use the theme context
 * @returns {ThemeContextValue}
 */
export function useThemeMode() {
  return useContext(ThemeContext);
}

/**
 * Theme provider component
 * @param {{ children: React.ReactNode }} props
 */
export function ThemeContextProvider({ children }) {
  const [mode, setMode] = useState(() => {
    // Check for saved preference first
    const saved = localStorage.getItem('clearsky-theme-mode');
    if (saved === 'light' || saved === 'dark') {
      return /** @type {ThemeMode} */ (saved);
    }
    
    // Check system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return /** @type {ThemeMode} */ ('dark');
    }
    
    return /** @type {ThemeMode} */ ('light');
  });

  const toggleMode = () => {
    setMode(prevMode => {
      const newMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('clearsky-theme-mode', newMode);
      return newMode;
    });
  };

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', mode === 'dark' ? '#121212' : 'white');
    }
    
    // Update apple-mobile-web-app-status-bar-style
    const metaStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (metaStatusBar) {
      metaStatusBar.setAttribute('content', mode === 'dark' ? 'black-translucent' : 'white');
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleMode }}>
      {children}
    </ThemeContext.Provider>
  );
}