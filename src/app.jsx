// @ts-check
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './api/query-client';

const Home = React.lazy(() => import('./landing/home'));
const AccountView = React.lazy(() => import('./detail-panels'));

import './app.css';

function showApp() {
  const root = document.createElement('div');
  root.id = 'root';
  root.style.cssText = `
    min-height: 100%;
    display: grid;
  `;
  document.body.appendChild(root);

  const RedirectToClearSky = () => {
    if (window.location.href.includes('bsky.thieflord.dev')) {
      window.location.href = 'https://clearsky.app';
      return null;
    }
    return null;
  };

  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/index.html', element: <Home /> },
    { path: '/stable/*', element: <Home /> },
    { path: '/:handle', element: <AccountView /> },
    { path: '/:handle/:tab', element: <AccountView /> },
    { path: '*', element: <RedirectToClearSky /> },
  ]);

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

  console.log('React createRoot/render');
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
            © 2024 Bluethernal LLC
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    </React.StrictMode>
  );
}

showApp();
