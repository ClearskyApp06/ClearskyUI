// @ts-check
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const Home = React.lazy(() => import('./landing/home'));
const AccountView = React.lazy(() => import('./detail-panels'));

import './app.css';

function showApp() {
  const loadingUI = document.getElementById('loading-ui');
  if (loadingUI) {
    loadingUI.style.transition = 'opacity 0.5s';
    setTimeout(() => {
      loadingUI.style.opacity = '0';
      setTimeout(() => {
        console.log('removing loadingUI');
        loadingUI.parentElement?.removeChild(loadingUI);
      }, 500);
    }, 1);
  }

  const root = document.createElement('div');
  root.id = 'root';
  root.style.cssText = `
    min-height: 100%;
    display: grid;
  `;
  document.body.appendChild(root);

  const router = createBrowserRouter([
    { path: '/', element: <Home /> },
    { path: '/index.html', element: <Home /> },
    { path: '/stable/*', element: <Home /> },
    { path: '/:handle', element: <AccountView /> },
    { path: '/:handle/:tab', element: <AccountView /> },
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

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60_000, // ten minutes before a request will refetch
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

console.log('starting the app...');
showApp();
