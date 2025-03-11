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
import { getDefaultComponent } from './utils/get-default';
import { profileChildRoutesPromise } from './detail-panels/tabs';
import './app.css';

const hydrateFallbackElement = (
  <div className="hydrate-fallback">
    <CircularProgress size="4em" />
  </div>
);

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
    </React.StrictMode>
  );
}

showApp();
