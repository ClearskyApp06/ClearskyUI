// @ts-check

import React from 'react';

import { Tab, Tabs } from '@mui/material';

import { accountTabs } from './layout';

import './tab-selector.css';
import { localise } from '../localisation';

export function TabSelector({ className, tab, onTabSelected }) {

  const tabHandlers = {
    'blocked-by':
      <VerticalTab key='blocked-by' className='tab-blocked-by'>
        {localise('Blocked By', { uk: 'Блокують' })}
      </VerticalTab>,
    'blocking':
      <VerticalTab key='blocking' className='tab-blocking'>
        {localise('Blocking', { uk: 'Блокує' })}
      </VerticalTab>,
    'lists':
      <VerticalTab key='lists' className='tab-lists'>
        {localise('Lists', { uk: 'У списках' })}
      </VerticalTab>,
    'history':
      <VerticalTab key='history' className='tab-history'>
        {localise('History', { uk: 'Історія' })}
      </VerticalTab>,
    'packs':
    <VerticalTab key='packs' className='packs'>
      {localise('Packs made', { uk: 'Історія' })}
    </VerticalTab>,
    'packed':
    <VerticalTab key='packed' className='packed'>
      {localise('Packs In', { uk: 'Історія' })}
    </VerticalTab>,
  };

  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <Tabs
        className={'tab-selector-root selected-tab-' + tab}
        orientation="vertical"
        value={accountTabs.indexOf(tab)}
        onChange={
          typeof onTabSelected !== 'function' ? undefined :
            (event, newValue) => onTabSelected(accountTabs[newValue])
        }
      >
        {accountTabs.map(tabKey => tabHandlers[tabKey])}
      </Tabs>

      <div className='bluethernal-llc-watermark'>
        Bluethernal LLC
      </div>
    </div>
  );
}

function VerticalTab({ children, ...rest }) {
  return (
    <Tab
      label={
        <div style={{ writingMode: 'vertical-rl' }}>
          {children}
        </div>
      }
      {...rest} />
  );
}
