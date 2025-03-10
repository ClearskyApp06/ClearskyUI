// @ts-check
import { Tab, Tabs } from '@mui/material';
import { Link, Navigate, useMatch } from 'react-router-dom';
import { localise } from '../localisation';
import './tabs.css';
import { getDefaultComponent } from '../utils/get-default';

/** @typedef {(typeof tabRoutes)[number]['path']} AnyTab */

/** @typedef {{ tab(): { label: string }, featureFlag: string }} ExtraUiFields */

/**
 * this is our single source of truth for the profile tabs and their routes. adding an entry here
 * will define both its route in the router, and add the tab to our scrolling list on the profiles.
 * @satisfies {Array<import('react-router-dom').RouteObject & ExtraUiFields>}
 */
const tabRoutes = /** @type {const} */ ([
  {
    path: 'blocking',
    lazy: () => getDefaultComponent(import('./blocking')),
    tab: () => ({ label: localise('Blocking', { uk: 'Блокує' }) }),
    featureFlag: 'blocking-tab',
  },
  {
    path: 'blocked-by',
    lazy: () => getDefaultComponent(import('./blocked-by')),
    tab: () => ({ label: localise('Blocked By', { uk: 'Блокують' }) }),
    featureFlag: 'blocked-by-tab',
  },
  {
    path: 'blocking-lists',
    tab: () => ({ label: localise('Lists Blocking') }),
    featureFlag: 'lists-blocking-tab',
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
    featureFlag: 'lists-blocked-by-tab',
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
    featureFlag: 'lists-on-tab',
  },
  {
    path: 'history',
    lazy: () => getDefaultComponent(import('./history/history-panel')),
    tab: () => ({ label: localise('Posts', { uk: 'Історія' }) }),
    featureFlag: 'posts-tab',
  },
  {
    path: 'labeled',
    lazy: () => getDefaultComponent(import('./labeled')),
    tab: () => ({ label: localise('Labels') }),
    featureFlag: 'labels-tab',
  },
  {
    path: 'packs',
    lazy: () => getDefaultComponent(import('./packs')),
    tab: () => ({ label: localise('Starter Packs Made') }),
    featureFlag: 'starter-packs-made-tab',
  },
  {
    path: 'packed',
    lazy: () => getDefaultComponent(import('./packs/packed')),
    tab: () => ({ label: localise('Starter Packs In') }),
    featureFlag: 'starter-packs-in-tab',
  },
]);

/**
 * @type {import('react-router-dom').RouteObject[]}
 */
export const profileTabRoutes = [
  {
    index: true,
    // default tab is defined by this redirect
    element: <Navigate to="history" replace />,
  },
  ...tabRoutes,
];

/**
 * placeholder for upcoming feature flag system
 * @returns {Record<string, boolean> | null}
 */
function useFeatureFlags() {
  return null;
}

/**
 *
 * @param {{ className: string }} param0
 * @returns
 */
export function TabSelector({ className }) {
  const matches = useMatch('/:account/:tab/*');
  const featureFlags = useFeatureFlags();
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
        {tabRoutes.map((route) =>
          featureFlags?.[route.featureFlag] === false ? null : (
            <Tab
              key={route.path}
              to={route.path}
              label={route.tab().label}
              component={Link}
            />
          )
        )}
      </Tabs>
    </div>
  );
}
