// @ts-check

import React from 'react';

import { Button } from '@mui/material';

import { AccountShortEntry } from '../../common-components/account-short-entry';

import { localise } from '../../localisation';
import './about.css';

export function About({ onToggleAbout }) {
  return (
    <div className="about">
      <span className='corner-buttons'>
        <Button className='about-button' onClick={onToggleAbout}>
          <span className='about-button-icon'>
            i
          </span>
        </Button>
      </span>
      <div className='text'>
        <span className='legalese'>
          <a href="/privacy-policy.html">Privacy Policy</a> | <a href="/terms-and-conditions.html">Terms and Conditions</a> | <a href="mailto:support@clearsky.app">Contact Us</a>
        </span>

        {localise('Version', { uk: 'Версія' })}: 4.0.1d <br />
        &nbsp; {localise('Created by', { uk: 'Створив' })}: <AccountShortEntry
          account='thieflord.dev'
          link='https://bsky.app/profile/thieflord.dev'
          accountTooltipPanel={true}
        /> <br />
        &nbsp; {localise('Implementation developer', { uk: 'Програміст-артист' })}: <AccountShortEntry
          account='oyin.bo'
          link='https://bsky.app/profile/oyin.bo'
          accountTooltipPanel={localise('User experience and interaction beauty.', { uk: 'Майстер намалювати та втілити.' })}
        />
      </div>
    </div>
  );
}