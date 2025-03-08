// @ts-check
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from './api/query-client';
import { ErrorBoundary } from './common-components/error-boundary';

import './app.css';
import { getDefaultComponent } from './utils/get-default';
import { profileTabRoutes } from './detail-panels/tabs';

const router = createBrowserRouter(
  [
    {
      ErrorBoundary,
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
          children: profileTabRoutes,
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

function showApp() {
  const root = document.createElement('div');
  root.id = 'root';
  root.style.cssText = `
    min-height: 100%;
  `;
  document.body.appendChild(root);

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
          <React.Suspense>
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
