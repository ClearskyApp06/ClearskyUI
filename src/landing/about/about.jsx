// @ts-check

import { Button } from '@mui/material';

import { localise } from '../../localisation';
import { version } from '../../../package.json';

import './about.css';
import React from 'react';

/**
 * @type {string}
 */
// @ts-ignore
// eslint-disable-next-line no-undef
const builtFromCommit = BUILD_COMMIT_HASH || null;

export function About() {

  const [aboutOpen, setAboutOpen] = React.useState(false);

  return (
    <div className={`about${aboutOpen ? ' about-open' : ''}`}>
      <span className="corner-buttons">
        <Button className="about-button" onClick={() => setAboutOpen(!aboutOpen)}>
          <span className="about-button-icon">i</span>
        </Button>
      </span>
      <div className="text">
        <span className="legalese">
          <a href="/contact">Contact Us</a> |{' '}
            <a href="/privacy-policy.html">Privacy Policy</a> |{' '}
            <a href="/terms-and-conditions.html">Terms and Conditions</a> |{' '}
            <a href="https://status.clearsky.app">Status</a> |{' '}
            <a href="#" className="termly-display-preferences">Consent Preferences</a>
        </span>
          <span>
          {localise('Version', {uk: 'Версія'})}: {version}{' '}
          {builtFromCommit && `(${builtFromCommit})`}
        </span>
      </div>
    </div >
  );
}
