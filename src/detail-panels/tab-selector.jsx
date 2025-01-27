import React from 'react';
import { Tab, tabClasses, Tabs } from '@mui/material';
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
      <Tab key="blocked-by" label={localise('Blocked By', { uk: 'Блокують' })} aria-label='blocked by'/>
    ),
    blocking: (
      <Tab key="blocking" label={localise('Blocking', { uk: 'Блокує' })} aria-label='blocking'/>
    ),
    lists: (
      <Tab key="lists" label={localise('Lists', { uk:'У списках' })} aria-label='lists'/>
    ),
    history: (
      <Tab key="history" label={localise('History', { uk: 'Історія' })} aria-label='history'/>
    ),
    labeled: (
      <Tab key="labeled" label={localise('Labels', {  })} aria-label='labelled'/>
    ),
    packs:(
    <Tab key='packsCreated' label={localise('Packs made', { })} aria-label='Packs made'/>
    ),
    packed:(
    <Tab key='packsPopulated' label={localise('In Packs', {  })} aria-label='Packs Inhabited'/>
    ),
    };

  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <Tabs
        TabIndicatorProps={{
          style: { display: 'none' }
        }}
        className={'tab-selector-root selected-tab-' + tab}
        orientation="horizontal"
        variant='scrollable' 
        scrollButtons='auto'
        style={{border:'none'}}
        value={accountTabs.indexOf(tab)}
        onChange={
          typeof onTabSelected !== 'function'
            ? undefined
            : (event, newValue) => onTabSelected(accountTabs[newValue])
        }
      >
        {accountTabs.map((tabKey) =>  
        tabHandlers[tabKey])}
      </Tabs>

      <div className="bluethernal-llc-watermark">Bluethernal LLC</div>
    </div>
  );
}