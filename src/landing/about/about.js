// @ts-check

import { Button } from '@mui/material';

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { localise } from '../../localisation';
import { version } from '../../../package.json';

import './about.css';

// @ts-ignore
const builtFromCommit = window.BUILD_COMMIT_HASH || null;

export function About({ onToggleAbout }) {
  return (
    <div className="about">
      <span className="corner-buttons">
        <Button className="about-button" onClick={onToggleAbout}>
          <span className="about-button-icon">i</span>
        </Button>
      </span>
      <div className="text">
        <span className="legalese">
          <a href="mailto:support@clearsky.app">Contact Us</a> |{' '}
          <a href="https://ko-fi.com/thieflord">Donate</a>
        </span>
        {localise('Version', { uk: 'Версія' })}: {version}{' '}
        {builtFromCommit && `(${builtFromCommit})`}
        <br />
        <h2 className="petition">
          <a
            target="_blank"
            href="https://www.change.org/p/bluesky-must-enforce-its-community-guidelines-equally"
          >
            Sign the Bluesky change.org Petition
          </a>
        </h2>
      </div>
    </div>
  );
}
