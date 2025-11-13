// @ts-check
import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * @typedef {'auto' | '12' | '24'} TimeFormat
 */

/**
 * @typedef {{
 *   timeFormat: TimeFormat;
 *   setTimeFormat: (format: TimeFormat) => void;
 *   getEffectiveTimeFormat: () => '12' | '24';
 * }} SettingsContextValue
 */

/** @type {React.Context<SettingsContextValue | null>} */
const SettingsContext = createContext(null);

const STORAGE_KEY = 'clearsky-settings-time-format';

/**
 * Detect if the browser's locale uses 24-hour format
 * @returns {'12' | '24'}
 */
function detectBrowserTimeFormat() {
  try {
    const date = new Date(2000, 0, 1, 13, 0, 0);
    const formatted = date.toLocaleTimeString(undefined, { 
      hour: 'numeric',
      minute: 'numeric'
    });
    // If the formatted time contains '13' or 'PM', it's 12-hour format
    // If it contains '13' without 'PM' or similar, it's 24-hour format
    return formatted.includes('13') && !formatted.match(/[AP]M/i) ? '24' : '12';
  } catch (e) {
    return '12'; // Default to 12-hour format if detection fails
  }
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export function SettingsProvider({ children }) {
  const [timeFormat, setTimeFormatState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === '12' || stored === '24' || stored === 'auto') {
        return stored;
      }
    } catch (e) {
      // localStorage might not be available
    }
    return 'auto';
  });

  const setTimeFormat = (/** @type {TimeFormat} */ format) => {
    setTimeFormatState(format);
    try {
      localStorage.setItem(STORAGE_KEY, format);
    } catch (e) {
      // localStorage might not be available
    }
  };

  const getEffectiveTimeFormat = () => {
    if (timeFormat === '12' || timeFormat === '24') {
      return timeFormat;
    }
    return detectBrowserTimeFormat();
  };

  return (
    <SettingsContext.Provider value={{ timeFormat, setTimeFormat, getEffectiveTimeFormat }}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * @returns {SettingsContextValue}
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
