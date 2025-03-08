// @ts-check
import { Tab, Tabs } from '@mui/material';
import { Link, Navigate, useMatch } from 'react-router-dom';
import { localise } from '../localisation';
import './tabs.css';
import { getDefaultComponent } from '../utils/get-default';

/** @typedef {(typeof tabRoutes)[number]['path']} AnyTab */

/**
 * this is our single source of truth for the profile tabs and their routes. adding an entry here
 * will define both its route in the router, and add the tab to our scrolling list on the profiles.
 * @satisfies {Array<import('react-router-dom').RouteObject & { tab(): { label: string } }>}
 */
const tabRoutes = /** @type {const} */ ([
  {
    path: 'blocking',
    lazy: () => getDefaultComponent(import('./blocking')),
    tab: () => ({ label: localise('Blocking', { uk: 'Блокує' }) }),
  },
  {
    path: 'blocked-by',
    lazy: () => getDefaultComponent(import('./blocked-by')),
    tab: () => ({ label: localise('Blocked By', { uk: 'Блокують' }) }),
  },
  {
    path: 'blocking-lists',
    tab: () => ({ label: localise('Lists Blocking') }),
    children: [
      {
        index: true,
        lazy: () => getDefaultComponent(import('./blocking-lists')),
      },
      {
        path: 'subscribers/:list_url',
        lazy: () => getDefaultComponent(import('./block-list-subscribers')),
      },
    ],
  },
  {
    path: 'blocked-by-lists',
    tab: () => ({ label: localise('Lists Blocked By') }),
    children: [
      {
        index: true,
        lazy: () => getDefaultComponent(import('./blocked-by-lists')),
      },
      {
        path: 'subscribers/:list_url',
        lazy: () => getDefaultComponent(import('./block-list-subscribers')),
      },
    ],
  },
  {
    path: 'lists',
    lazy: () => getDefaultComponent(import('./lists')),
    tab: () => ({ label: localise('Lists On', { uk: 'У списках' }) }),
  },
  {
    path: 'history',
    lazy: () => getDefaultComponent(import('./history/history-panel')),
    tab: () => ({ label: localise('Posts', { uk: 'Історія' }) }),
  },
  {
    path: 'labeled',
    lazy: () => getDefaultComponent(import('./labeled')),
    tab: () => ({ label: localise('Labels') }),
  },
  {
    path: 'packs',
    lazy: () => getDefaultComponent(import('./packs')),
    tab: () => ({ label: localise('Starter Packs Made') }),
  },
  {
    path: 'packed',
    lazy: () => getDefaultComponent(import('./packs/packed')),
    tab: () => ({ label: localise('Starter Packs In') }),
  },
]);

/**
 * @type {import('react-router-dom').RouteObject[]}
 */
export const profileTabRoutes = [
  {
    index: true,
    element: <Navigate to="" replace />,
  },
  ...tabRoutes,
];

/**
 *
 * @param {{ className: string }} param0
 * @returns
 */
export function TabSelector({ className }) {
  const matches = useMatch('/:account/:tab/*');
  const tab = matches?.params.tab;
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
        value={tabRoutes.findIndex((route) => route.path === tab)}
      >
        {tabRoutes.map((route) => (
          <Tab
            key={route.path}
            to={route.path}
            label={route.tab().label}
            component={Link}
          />
        ))}
      </Tabs>
    </div>
  );
}
