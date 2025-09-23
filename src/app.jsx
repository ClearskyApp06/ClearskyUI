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
import { ThemeContextProvider, useThemeMode } from './common-components/theme-context';
import { getDefaultComponent } from './utils/get-default';
import { profileChildRoutesPromise } from './detail-panels/tabs';
import './app.css';

const hydrateFallbackElement = (
  <div className="hydrate-fallback">
    <CircularProgress size="4em" />
  </div>
);

/**
 * Creates a Material-UI theme based on the current mode
 * @param {'light' | 'dark'} mode
 */
function createAppTheme(mode) {
  return createTheme({
    palette: {
      mode,
      ...(mode === 'light' ? {
        // Light mode colors
        background: {
          default: '#ffffff',
          paper: '#ffffff',
        },
        text: {
          primary: '#000000',
          secondary: '#666666',
        },
      } : {
        // Dark mode colors
        background: {
          default: '#121212',
          paper: '#1e1e1e',
        },
        text: {
          primary: '#ffffff',
          secondary: '#b3b3b3',
        },
      }),
    },
    components: {
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            backgroundColor: mode === 'light' ? 'white' : '#333333',
            color: mode === 'light' ? 'black' : 'white',
            border: mode === 'light' ? 'solid 1px #e8e8e8' : 'solid 1px #555555',
            boxShadow: mode === 'light' 
              ? '3px 3px 8px rgba(0, 0, 0, 12%)' 
              : '3px 3px 8px rgba(0, 0, 0, 50%)',
            fontSize: '90%',
            padding: '0.7em',
            paddingRight: '0.2em',
          },
        },
      },
    },
  });
}

/**
 * App content with theme context
 * @param {{ router: any }} props
 */
function AppContent({ router }) {
  const { mode } = useThemeMode();
  const theme = createAppTheme(mode);

  return (
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <React.Suspense fallback={hydrateFallbackElement}>
          <RouterProvider
            router={router}
            future={{ v7_startTransition: true }}
          />
        </React.Suspense>
        <div className="bluethernal-llc-watermark">
          © 2025 Bluethernal Inc
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

async function showApp() {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  const router = createBrowserRouter(
    [
      {
        errorElement: <ErrorBoundary />,
        hydrateFallbackElement,
        children: [
          {
            index: true,
            lazy: () => getDefaultComponent(import('./landing/home')),
          },
          { path: 'index.html', element: <Navigate to="/" replace /> },
          { path: 'stable/*', element: <Navigate to="/" replace /> },
          {
            path: ':handle',
            lazy: () => getDefaultComponent(import('./detail-panels')),
            children: await profileChildRoutesPromise,
          },
        ],
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

  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <ThemeContextProvider>
        <AppContent router={router} />
      </ThemeContextProvider>
    </React.StrictMode>
  );
}

showApp();
