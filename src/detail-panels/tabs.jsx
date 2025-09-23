// @ts-check
import { Navigate } from 'react-router-dom';
import { localise } from '../localisation';
import './tabs.css';
import { getDefaultComponent } from '../utils/get-default';
import { getAllFeatureFlags } from '../api/featureFlags';

/** @typedef {(typeof allTabRoutes)[number]['path']} AnyTab */

/** @typedef {{ tab(): { label: string, description?: string }, featureFlag: string }} ExtraUiFields */

/**
 * this is our single source of truth for the profile tabs and their routes. adding an entry here
 * will define both its route in the router, and add the tab to our scrolling list on the profiles.
 * @satisfies {Array<import('react-router-dom').RouteObject & ExtraUiFields>}
 */
const allTabRoutes = /** @type {const} */ ([
  {
    path: 'blocking',
    lazy: () => getDefaultComponent(import('./blocking')),
    tab: () => ({ 
      label: localise('Blocking', { uk: 'Блокує' }),
      description: 'Users that this account has directly blocked'
    }),
    featureFlag: 'blocking-tab',
  },
  {
    path: 'blocked-by',
    lazy: () => getDefaultComponent(import('./blocked-by')),
    tab: () => ({ 
      label: localise('Blocked By', { uk: 'Блокують' }),
      description: 'Users that have directly blocked this account'
    }),
    featureFlag: 'blocked-by-tab',
  },
  {
    path: 'blocking-lists',
    tab: () => ({ 
      label: localise('Lists Blocking'),
      description: 'Block lists that this account has subscribed to - these are lists of users that this account is blocking via lists'
    }),
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
    tab: () => ({ 
      label: localise('Lists Blocked By'),
      description: 'Block lists that contain this account - these are lists where other users have added this account to block it'
    }),
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
    tab: () => ({ 
      label: localise('Lists On', { uk: 'У списках' }),
      description: 'All public lists that include this account'
    }),
    featureFlag: 'lists-on-tab',
  },
  {
    path: 'history',
    lazy: () => getDefaultComponent(import('./history/history-panel')),
    tab: () => ({ 
      label: localise('Posts', { uk: 'Історія' }),
      description: 'Recent posts and activity from this account'
    }),
    featureFlag: 'posts-tab',
  },
  {
    path: 'labeled',
    lazy: () => getDefaultComponent(import('./labeled')),
    tab: () => ({ 
      label: localise('Labels'),
      description: 'Labels that have been applied to this account'
    }),
    featureFlag: 'labels-tab',
  },
  {
    path: 'packs',
    lazy: () => getDefaultComponent(import('./packs')),
    tab: () => ({ 
      label: localise('Starter Packs Made'),
      description: 'Starter packs created by this account'
    }),
    featureFlag: 'starter-packs-made-tab',
  },
  {
    path: 'packed',
    lazy: () => getDefaultComponent(import('./packs/packed')),
    tab: () => ({ 
      label: localise('Starter Packs In'),
      description: 'Starter packs that include this account'
    }),
    featureFlag: 'starter-packs-in-tab',
  },
]);

const featureFlagAssignmentsPromise = getAllFeatureFlags();
export const activeTabRoutesPromise = (async () => {
  const featureFlagAssignments = await featureFlagAssignmentsPromise;
  /**
   * All tab routes filtered down to just the ones that are enabled by feature flags
   */
  return allTabRoutes.filter((tab) => featureFlagAssignments[tab.featureFlag]);
})();

export const profileChildRoutesPromise = (async () => {
  const activeTabRoutes = await activeTabRoutesPromise;
  const featureFlagAssignments = await featureFlagAssignmentsPromise;

  // default tab is defined here. uses the posts tab, if enabled, or the first enabled tab otherwise
  const defaultProfilePath = featureFlagAssignments['posts-tab']
    ? 'history'
    : activeTabRoutes[0]?.path || 'blocking';

  /**
   * @type {import('react-router-dom').RouteObject[]}
   */
  return [
    ...activeTabRoutes,
    {
      index: true,
      element: <Navigate to={defaultProfilePath} replace />,
    },
    {
      path: '*',
      // this is the 404 fallback handler, which will also just redirect to our default tab
      element: <Navigate to={'../' + defaultProfilePath} replace />,
    },
  ];
})();
