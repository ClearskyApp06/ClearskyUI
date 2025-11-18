// @ts-check
import { Navigate } from 'react-router-dom';
import { localise } from '../localisation';
import { getDefaultComponent } from '../utils/get-default';
import { getAllFeatureFlags } from '../api/featureFlags';
import { fetchClearskyApi } from '../api/core';

/** @typedef {(typeof allTabRoutes)[number]['path']} AnyTab */
/**
 * @typedef {{
 *   path?: string,
 *   index?: boolean,
 *   lazy?: () => Promise<any>,
 *   tab?: () => { label: string },
 *   featureFlag: string,
 *   authFeatureFlag?: string,
 *   children?: ExtraUiFields[]
 * }} ExtraUiFields
 */

const allTabRoutes = /** @type {ExtraUiFields[]} */ ([
  {
    path: 'profile',
    lazy: () => getDefaultComponent(import('./profile/profile')),
    tab: () => ({ label: localise('Profile') }),
    featureFlag: 'profile-tab',
  },
  {
    path: 'blocking',
    tab: () => ({ label: localise('Blocking') }),
    featureFlag: 'blocking-tab',
    children: [
      {
        index: true,
        lazy: () => getDefaultComponent(import('./blocking')),
        tab: () => ({ label: localise('Blocking') }),
        featureFlag: 'blocking-tab',
      },
      {
        path: 'blocked-by',
        lazy: () => getDefaultComponent(import('./blocked-by')),
        tab: () => ({ label: localise('Blocked By') }),
        featureFlag: 'blocked-by-tab',
        authFeatureFlag: 'restricted-blocked-by',
      },
      {
        path: 'blocking-lists',
        tab: () => ({ label: localise('Lists Blocking') }),
        featureFlag: 'lists-blocking-tab',
        authFeatureFlag: 'restricted-lists-blocking',
        children: [
          {
            index: true,
            lazy: () => getDefaultComponent(import('./blocking-lists')),
            featureFlag: 'lists-blocking-tab',
            authFeatureFlag: 'restricted-lists-blocking',
          },
          {
            path: 'subscribers/:list_url',
            lazy: () => getDefaultComponent(import('./block-list-subscribers')),
            featureFlag: 'lists-blocking-tab',
            authFeatureFlag: 'restricted-lists-blocking',
          },
        ],
      },
      {
        path: 'blocked-by-lists',
        tab: () => ({ label: localise('Lists Blocked By') }),
        featureFlag: 'lists-blocked-by-tab',
        authFeatureFlag: 'restricted-lists-blocked-by',
        children: [
          {
            index: true,
            lazy: () => getDefaultComponent(import('./blocked-by-lists')),
            featureFlag: 'lists-blocked-by-tab',
            authFeatureFlag: 'restricted-lists-blocked-by',
          },
          {
            path: 'subscribers/:list_url',
            lazy: () => getDefaultComponent(import('./block-list-subscribers')),
            featureFlag: 'lists-blocked-by-tab',
            authFeatureFlag: 'restricted-lists-blocked-by',
          },
        ],
      },
    ],
  },

  {
    path: 'lists',
    lazy: () => getDefaultComponent(import('./lists')),
    tab: () => ({ label: localise('Lists On') }),
    featureFlag: 'lists-on-tab',
    authFeatureFlag: 'restricted-lists-on',
  },

  {
    path: 'history',
    lazy: () => getDefaultComponent(import('./history/history-panel')),
    tab: () => ({ label: localise('Posts') }),
    featureFlag: 'posts-tab',
  },

  {
    path: 'labeled',
    lazy: () => getDefaultComponent(import('./labeled')),
    tab: () => ({ label: localise('Labels') }),
    featureFlag: 'labels-tab',
  },

  {
    path: 'starter-packs',
    tab: () => ({ label: localise('Starter Packs') }),
    featureFlag: 'starter-packs-made-tab',
    authFeatureFlag: 'restricted-starter-packs-made',
    children: [
      {
        index: true,
        lazy: () => getDefaultComponent(import('./packs')),
        tab: () => ({ label: localise('Starter Packs Made') }),
        featureFlag: 'starter-packs-made-tab',
        authFeatureFlag: 'restricted-starter-packs-made',
      },
      {
        path: 'in',
        lazy: () => getDefaultComponent(import('./packs/packed')),
        tab: () => ({ label: localise('Starter Packs In') }),
        authFeatureFlag: 'restricted-starter-packs-in',
        featureFlag: 'starter-packs-in-tab',
      },
    ],
  },
]);

const featureFlagAssignmentsPromise = getAllFeatureFlags();

const authValidationPromise = (async () => {
  let isAuthenticated = false;
  try {
    if (localStorage.getItem('session-id')) {
      const res = await fetchClearskyApi('v1', `login/session/validate`);
      isAuthenticated = Boolean(res?.authenticated);
    }
  } catch (error) {
    console.error('Failed to validate session:', error);
  }
  return isAuthenticated;
})();

export const activeTabRoutesPromise = (async () => {
  const featureFlagAssignments = await featureFlagAssignmentsPromise;
  const isAuthenticated = await authValidationPromise;

  /**
   * @param {readonly ExtraUiFields[]} tabs
   * @returns {ExtraUiFields[]}
   */
  const filterEnabled = (tabs) =>
    tabs
      .filter((tab) => {
        const isFlagEnabled = featureFlagAssignments[tab.featureFlag];
        if (tab.authFeatureFlag) {
          const isAuthFlagEnabled = featureFlagAssignments[tab.authFeatureFlag];
          if (!isAuthFlagEnabled) {
            return isFlagEnabled;
          }
          return !!isAuthenticated;
        }
        return isFlagEnabled;
      })
      .map((tab) => ({
        ...tab,
        children: tab.children ? filterEnabled(tab.children) : undefined,
      }));

  return filterEnabled(allTabRoutes);
})();

export const profileChildRoutesPromise = (async () => {
  const activeTabRoutes = await activeTabRoutesPromise;
  const featureFlagAssignments = await featureFlagAssignmentsPromise;

  const defaultProfilePath = featureFlagAssignments['profile-tab']
    ? 'profile'
    : activeTabRoutes[0]?.path || '';

  return [
    ...activeTabRoutes,
    { index: true, element: <Navigate to={defaultProfilePath} replace /> },
    {
      path: '*',
      element: <Navigate to={'../' + defaultProfilePath} replace />,
    },
  ];
})();
