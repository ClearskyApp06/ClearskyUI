// @ts-check

import { Button } from '@mui/material';

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { localise } from '../../localisation';
import { version } from '../../../package.json';

import './about.css';

/**
 * @type {string}
 */
// @ts-ignore
const builtFromCommit = BUILD_COMMIT_HASH || null;

/**
 *
 * @param {{ onToggleAbout(): void; }} param0
 * @returns
 */
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
          <a href="https://ko-fi.com/thieflord">Donate</a> |{' '}
          <a href="/privacy-policy.html">Privacy Policy</a> |{' '}
          <a href="/terms-and-conditions.html">Terms and Conditions</a> |{' '}
          <a href="https://status.clearsky.app">Status</a>
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
