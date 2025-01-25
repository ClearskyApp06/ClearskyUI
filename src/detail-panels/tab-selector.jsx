// @ts-check

import React from 'react';

import { Tab, Tabs } from '@mui/material';

import { accountTabs } from './layout';

import { localise } from '../localisation';
import './tab-selector.css';

/** @typedef {accountTabs[number]} AnyTab */

/**
 *
 * @param {{ className: string, tab: AnyTab, onTabSelected(tab: AnyTab): void }} param0
 * @returns
 */
export function TabSelector({ className, tab, onTabSelected }) {
  const tabHandlers = {
    'blocked-by': (
      <VerticalTab key="blocked-by" className="tab-blocked-by">
        Blocked By
      </VerticalTab>
    ),
    blocking: (
      <VerticalTab key="blocking" className="tab-blocking">
        Blocking
      </VerticalTab>
    ),
    lists: (
      <VerticalTab key="lists" className="tab-lists">
        Lists
      </VerticalTab>
    ),
    'blocking-lists': (
      <VerticalTab key='blocking-lists' className='tab-blocking-lists'>
        Blocking Lists
      </VerticalTab>
    ),
    'blocked-by-lists': (
      <VerticalTab key='blocked-by-lists' className='tab-blocked-by-lists'>
        Blocked By Lists
      </VerticalTab>
    ),
    history: (
      <VerticalTab key="history" className="tab-history">
        History
      </VerticalTab>
    ),
    labeled: (
      <VerticalTab key="labeled" className="tab-labeled">
        Labels
      </VerticalTab>
    )
  };

  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <Tabs
        className={'tab-selector-root selected-tab-' + tab}
        orientation="vertical"
        value={accountTabs.indexOf(tab)}
        onChange={
          typeof onTabSelected !== 'function'
            ? undefined
            : (event, newValue) => onTabSelected(accountTabs[newValue])
        }
      >
        {accountTabs.map((tabKey) => tabHandlers[tabKey])}
      </Tabs>

      <div className="bluethernal-llc-watermark">Bluethernal LLC</div>
    </div>
  );
}

/** @param {Omit<import('@emotion/react').PropsOf<Tab>, "children"> & { children: React.ReactNode }} param0 */
function VerticalTab({ children, ...rest }) {
  return (
    <Tab
      label={<div style={{ writingMode: 'vertical-rl' }}>{children}</div>}
      {...rest}
    />
  );
}
