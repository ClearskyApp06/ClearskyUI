// @ts-check
import { Tab, Tabs } from '@mui/material';
import { Link, Navigate, useMatch } from 'react-router-dom';
import { localise } from '../localisation';
import './tab-selector.css';
import { getDefaultComponent } from '../utils/get-default';

/** @typedef {(typeof tabRoutes)[number]['path']} AnyTab */

/**
 * @satisfies {Array<import('react-router-dom').RouteObject & { tab: React.JSX.Element }>}
 */
const tabRoutes = /** @type {const} */ ([
  {
    path: 'blocking',
    lazy: () => getDefaultComponent(import('./blocking')),
    tab: (
      <Tab
        to="blocking"
        label={localise('Blocking', { uk: 'Блокує' })}
        aria-label="blocking"
        component={Link}
      />
    ),
  },
  {
    path: 'blocked-by',
    lazy: () => getDefaultComponent(import('./blocked-by')),
    tab: (
      <Tab
        to="blocked-by"
        label={localise('Blocked By', { uk: 'Блокують' })}
        aria-label="blocked by"
        component={Link}
      />
    ),
  },
  {
    path: 'blocking-lists',
    tab: (
      <Tab
        to="blocking-lists"
        label={localise('Lists Blocking', {})}
        component={Link}
      />
    ),
    children: [
      {
        index: true,
        lazy: () => getDefaultComponent(import('./blocking-lists')),
      },
      {
        path: 'subscribers',
        lazy: () => getDefaultComponent(import('./block-list-subscribers')),
      },
    ],
  },
  {
    path: 'blocked-by-lists',
    tab: (
      <Tab
        to="blocked-by-lists"
        label={localise('Lists Blocked By', {})}
        component={Link}
      />
    ),
    children: [
      {
        index: true,
        lazy: () => getDefaultComponent(import('./blocked-by-lists')),
      },
      {
        path: 'subscribers',
        lazy: () => getDefaultComponent(import('./block-list-subscribers')),
      },
    ],
  },
  {
    path: 'lists',
    lazy: () => getDefaultComponent(import('./lists')),
    tab: (
      <Tab
        to="lists"
        label={localise('Lists On', { uk: 'У списках' })}
        aria-label="lists"
        component={Link}
      />
    ),
  },
  {
    path: 'history',
    lazy: () => getDefaultComponent(import('./history/history-panel')),
    tab: (
      <Tab
        to="history"
        label={localise('Posts', { uk: 'Історія' })}
        aria-label="history"
        component={Link}
      />
    ),
  },
  {
    path: 'labeled',
    lazy: () => getDefaultComponent(import('./labeled')),
    tab: (
      <Tab
        to="labeled"
        label={localise('Labels', {})}
        aria-label="labelled"
        component={Link}
      />
    ),
  },
  {
    path: 'packs',
    lazy: () => getDefaultComponent(import('./packs')),
    tab: (
      <Tab
        to="packs"
        label={localise('Starter Packs Made', {})}
        aria-label="Packs made"
        component={Link}
      />
    ),
  },
  {
    path: 'packed',
    lazy: () => getDefaultComponent(import('./packs/packed')),
    tab: (
      <Tab
        to="packed"
        label={localise('Starter Packs In', {})}
        aria-label="Packs Inhabited"
        component={Link}
      />
    ),
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
  const matches = useMatch('/:account/:tab');
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
        {tabRoutes.map((route) => route.tab)}
      </Tabs>
    </div>
  );
}
