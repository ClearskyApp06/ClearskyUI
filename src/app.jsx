// @ts-check
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { CircularProgress, createTheme, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from './api/query-client';
import { ErrorBoundary } from './common-components/error-boundary';
import { SupportBanner } from './common-components/support-banner';
import { getDefaultComponent } from './utils/get-default';
import { profileChildRoutesPromise } from './detail-panels/tabs';
import { getAllFeatureFlags } from './api/featureFlags';
import './app.css';
import { AuthProvider } from './context/authContext';

const hydrateFallbackElement = (
  <div className="hydrate-fallback">
    <CircularProgress size="4em" />
  </div>
);

/**
 * @typedef {Object} RouteWithFeatureFlag
 * @property {string} [path]
 * @property {boolean} [index]
 * @property {() => Promise<any>} [lazy]
 * @property {React.ReactElement} [element]
 * @property {string} [featureFlag] - Optional feature flag name
 * @property {RouteWithFeatureFlag[]} [children]
 */

async function showApp() {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);

  // Get all feature flags
  const featureFlagAssignments = await getAllFeatureFlags();

  /**
   * Filter routes based on feature flags
   * @param {RouteWithFeatureFlag[]} routes
   * @returns {RouteWithFeatureFlag[]}
   */
  const filterEnabledRoutes = (routes) =>
    routes
      .filter((route) => !route.featureFlag || featureFlagAssignments[route.featureFlag])
      .map((route) => ({
        ...route,
        children: route.children ? filterEnabledRoutes(route.children) : undefined,
      }));

  /** @type {RouteWithFeatureFlag[]} */
  const allRoutes = [
    {
      index: true,
      lazy: () => getDefaultComponent(import('./landing/home')),
    },
    { path: 'index.html', element: <Navigate to="/" replace /> },
    { path: 'stable/*', element: <Navigate to="/" replace /> },
    { 
      path: 'pds', 
      lazy: () => getDefaultComponent(import('./pds/dids-per-pds')),
      featureFlag: 'pds-information',
    },
    { 
      path: 'pds/:pds', 
      lazy: () => getDefaultComponent(import('./pds/users-per-pds')),
      featureFlag: 'pds-information',
    },
    {
      path: 'contact',
      lazy: () => getDefaultComponent(import('./landing/contact')),
      featureFlag: 'contact-page',
    },
    { 
      path: 'labelers', 
      lazy: () => getDefaultComponent(import('./labelers/labelers')),
      featureFlag: 'labeler-information',
    },
    { 
      path: 'labelers/:did', 
      lazy: () => getDefaultComponent(import('./labelers/label-view')),
      featureFlag: 'labeler-information',
    },
    { 
      path: 'dashboard', 
      lazy: () => getDefaultComponent(import('./auth/dashboard')),
      featureFlag: 'auth-dashboard',
    },
    { 
      path: 'auth/login/error', 
      lazy: () => getDefaultComponent(import('./auth/login-error')),
      featureFlag: 'auth-login-error',
    },
    {
      path: 'faq',
      lazy: () => getDefaultComponent(import('./landing/faq')),
      featureFlag: 'faq-page',
    },
    {
      path: ':handle',
      lazy: () => getDefaultComponent(import('./detail-panels')),
      children: await profileChildRoutesPromise,
    },
  ];

  const enabledRoutes = filterEnabledRoutes(allRoutes);

  const router = createBrowserRouter(
    [
      {
        errorElement: <ErrorBoundary />,
        hydrateFallbackElement,
        children: enabledRoutes,
      },
    ],
    {
      future: {
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
      },
    }
  );

  const theme = createTheme({
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: 'white',
            color: 'black',
            border: 'solid 1px #e8e8e8',
            boxShadow: '3px 3px 8px rgba(0, 0, 0, 12%)',
            fontSize: '90%',
            // maxWidth: '40em',
            padding: '0.7em',
            paddingRight: '0.2em',
          },
        },
      },
    },
  });

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <React.Suspense fallback={hydrateFallbackElement}>
            <AuthProvider>
              <RouterProvider
                router={router}
                future={{ v7_startTransition: true }}
              />
            </AuthProvider>
          </React.Suspense>
          <SupportBanner />
          <div className="bluethernal-llc-watermark">
            © 2025 Bluethernal Inc
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

showApp();
