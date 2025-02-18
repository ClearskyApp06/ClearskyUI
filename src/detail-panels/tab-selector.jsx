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
      <Tab
        key="blocked-by"
        label={localise('Blocked By', { uk: 'Блокують' })}
        aria-label="blocked by"
      />
    ),
    blocking: (
      <Tab
        key="blocking"
        label={localise('Blocking', { uk: 'Блокує' })}
        aria-label="blocking"
      />
    ),
    'blocking-lists': (
      <Tab key="blocking-lists" label={localise('Lists Blocking', {})} />
    ),
    'blocked-by-lists': (
      <Tab key="blocked-by-lists" label={localise('Lists Blocked By', {})} />
    ),
    lists: (
      <Tab
        key="lists"
        label={localise('Lists On', { uk: 'У списках' })}
        aria-label="lists"
      />
    ),
    history: (
      <Tab
        key="history"
        label={localise('Posts', { uk: 'Історія' })}
        aria-label="history"
      />
    ),
    labeled: (
      <Tab key="labeled" label={localise('Labels', {})} aria-label="labelled" />
    ),
    packs: (
      <Tab
        key="packsCreated"
        label={localise('Starter Packs Made', {})}
        aria-label="Packs made"
      />
    ),
    packed: (
      <Tab
        key="packsPopulated"
        label={localise('Starter Packs In', {})}
        aria-label="Packs Inhabited"
      />
    ),
  };

  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <Tabs
        TabIndicatorProps={{
          style: { display: 'none' },
        }}
        className={'tab-selector-root selected-tab-' + tab}
        orientation="horizontal"
        variant="scrollable"
        scrollButtons={true}
        allowScrollButtonsMobile={true}
        style={{ border: 'none', margin: 0, padding: 0 }}
        value={accountTabs.indexOf(tab)}
        onChange={
          typeof onTabSelected !== 'function'
            ? undefined
            : (event, newValue) => onTabSelected(accountTabs[newValue])
        }
      >
        {accountTabs.map((tabKey) => tabHandlers[tabKey])}
      </Tabs>
    </div>
  );
}
