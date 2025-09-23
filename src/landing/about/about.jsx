// @ts-check

import { Button } from '@mui/material';
import { DarkMode, LightMode } from '@mui/icons-material';

import { localise } from '../../localisation';
import { useThemeMode } from '../../common-components/theme-context';
import { version } from '../../../package.json';

import './about.css';

/**
 * @type {string}
 */
// @ts-ignore
// eslint-disable-next-line no-undef
const builtFromCommit = BUILD_COMMIT_HASH || null;

/**
 *
 * @param {{ onToggleAbout(): void; }} param0
 * @returns
 */
export function About({ onToggleAbout }) {
  const { mode, toggleMode } = useThemeMode();
  
  return (
    <div className="about">
      <span className="corner-buttons">
        <Button className="theme-toggle-button" onClick={toggleMode} title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
          {mode === 'light' ? <DarkMode /> : <LightMode />}
        </Button>
        <Button className="about-button" onClick={onToggleAbout}>
          <span className="about-button-icon">i</span>
        </Button>
      </span>
      <div className="text">
        <span className="legalese">
          <a href="mailto:support@clearsky.app">Contact Us</a> |{' '}
          <a href="/privacy-policy.html">Privacy Policy</a> |{' '}
          <a href="/terms-and-conditions.html">Terms and Conditions</a> |{' '}
          <a href="https://status.clearsky.app">Status</a>
        </span>
        {localise('Version', { uk: 'Версія' })}: {version}{' '}
        {builtFromCommit && `(${builtFromCommit})`}
        <br />
      </div>
    </div>
  );
}
