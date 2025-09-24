// @ts-check
import { Navigate } from 'react-router-dom';
import { localise } from '../localisation';
import './tabs.css';
import { getDefaultComponent } from '../utils/get-default';
import { getAllFeatureFlags } from '../api/featureFlags';

/** @typedef {(typeof allTabRoutes)[number]['path']} AnyTab */

/** @typedef {{ tab(): { label: string }, featureFlag: string }} ExtraUiFields */

/**
 * this is our single source of truth for the profile tabs and their routes. adding an entry here
 * will define both its route in the router, and add the tab to our scrolling list on the profiles.
 * @satisfies {Array<import('react-router-dom').RouteObject & ExtraUiFields>}
 */
const allTabRoutes = /** @type {const} */ ([
  {
    path: 'profile',
    lazy: () => getDefaultComponent(import('./profile/profile')),
    tab: () => ({ label: localise('Profile') }),
    featureFlag: 'profile-tab',
  },
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

const featureFlagAssignmentsPromise = getAllFeatureFlags();
export const activeTabRoutesPromise = (async () => {
  const featureFlagAssignments = await featureFlagAssignmentsPromise;
  /**
   * All tab routes filtered down to just the ones that are enabled by feature flags
   */
  const activeTabRoutes = allTabRoutes.filter((tab) => featureFlagAssignments[tab.featureFlag]);
  
  // Ensure we always have at least one route (fallback to profile if no feature flags are available)
  if (activeTabRoutes.length === 0) {
    activeTabRoutes.push(allTabRoutes[0]); // Add profile tab as fallback
  }
  
  return activeTabRoutes;
})();

export const profileChildRoutesPromise = (async () => {
  const activeTabRoutes = await activeTabRoutesPromise;
  const featureFlagAssignments = await featureFlagAssignmentsPromise;

  // default tab is defined here. uses the profile tab, if enabled, or the first enabled tab otherwise
  const defaultProfilePath = featureFlagAssignments['profile-tab']
    ? 'profile'
    : activeTabRoutes[0].path;

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
