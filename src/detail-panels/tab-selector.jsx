// @ts-check
import { Tab, Tabs } from '@mui/material';
import { Link, Navigate, useMatch } from 'react-router-dom';
import { localise } from '../localisation';
import './tab-selector.css';
import { getDefaultComponent } from '../utils/get-default';

/** @typedef {(typeof tabRoutes)[number]['path']} AnyTab */

/**
 * @satisfies {import('react-router-dom').RouteObject[]}
 */
const tabRoutes = /** @type {const} */ ([
  {
    path: 'blocking',
    lazy: () => getDefaultComponent(import('./blocking')),
  },
  {
    path: 'blocked-by',
    lazy: () => getDefaultComponent(import('./blocked-by')),
  },
  {
    path: 'blocking-lists',
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
  },
  {
    path: 'history',
    lazy: () => getDefaultComponent(import('./history/history-panel')),
  },
  {
    path: 'labeled',
    lazy: () => getDefaultComponent(import('./labeled')),
  },
  {
    path: 'packs',
    lazy: () => getDefaultComponent(import('./packs')),
  },
  {
    path: 'packed',
    lazy: () => getDefaultComponent(import('./packs/packed')),
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
 * @type {Record<AnyTab, React.JSX.Element>}
 */
const tabHandlers = {
  'blocked-by': (
    <Tab
      key="blocked-by"
      label={localise('Blocked By', { uk: 'Блокують' })}
      aria-label="blocked by"
      LinkComponent={Link}
      href="TODO ON ALL TABS"
    />
  ),
  blocking: (
    <Tab
      key="blocking"
      label={localise('Blocking', { uk: 'Блокує' })}
      aria-label="blocking"
      LinkComponent={Link}
    />
  ),
  'blocking-lists': (
    <Tab
      key="blocking-lists"
      label={localise('Lists Blocking', {})}
      LinkComponent={Link}
    />
  ),
  'blocked-by-lists': (
    <Tab
      key="blocked-by-lists"
      label={localise('Lists Blocked By', {})}
      LinkComponent={Link}
    />
  ),
  lists: (
    <Tab
      key="lists"
      label={localise('Lists On', { uk: 'У списках' })}
      aria-label="lists"
      LinkComponent={Link}
    />
  ),
  history: (
    <Tab
      key="history"
      label={localise('Posts', { uk: 'Історія' })}
      aria-label="history"
      LinkComponent={Link}
    />
  ),
  labeled: (
    <Tab
      key="labeled"
      label={localise('Labels', {})}
      aria-label="labelled"
      LinkComponent={Link}
    />
  ),
  packs: (
    <Tab
      key="packsCreated"
      label={localise('Starter Packs Made', {})}
      aria-label="Packs made"
      LinkComponent={Link}
    />
  ),
  packed: (
    <Tab
      key="packsPopulated"
      label={localise('Starter Packs In', {})}
      aria-label="Packs Inhabited"
      LinkComponent={Link}
    />
  ),
};

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
        {tabRoutes.map((tabKey) => tabHandlers[tabKey.path])}
      </Tabs>
    </div>
  );
}
