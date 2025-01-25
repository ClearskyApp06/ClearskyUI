// @ts-check

import { useRouteError } from 'react-router-dom';

import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Button,
} from '@mui/material';
import { useState } from 'react';

/**
 * @param {*} error
 * @returns {string}
 */
function getMessage(error) {
  if (!error) return '';
  if ('message' in error) {
    return error.message.toString();
  }
  if (typeof error.toString === 'function') {
    return error.toString();
  }
  return '';
}

const REFRESHED_FOR_ERROR = 'refreshed_for_error';

function refreshForNextRelease() {
  sessionStorage.setItem(REFRESHED_FOR_ERROR, '1');
  reloadPage();
}

function reloadPage() {
  location.reload();
}

export function ErrorBoundary() {
  const [justRefreshedForNextRelease] = useState(() => {
    // this helps prevent infinite reload loops from the automatic refresh behavior added below
    // first we check for our session storage item and save its existence in memory
    let value = !!sessionStorage.getItem(REFRESHED_FOR_ERROR);
    // then remove it after a short delay, so future reloads will not continue to see it
    setTimeout(() => sessionStorage.removeItem(REFRESHED_FOR_ERROR), 10_000);
    return value;
  });
  const error = useRouteError();
  const message = getMessage(error);
  let advice = 'Hopefully all will be fine if you reload the page.';
  if (message.startsWith('Failed to fetch dynamically imported module: ')) {
    if (justRefreshedForNextRelease) {
      advice =
        "Unfortunately it's seems serious and reloading the page probably won't solve anything.";
    } else {
      refreshForNextRelease();
    }
  }
  return (
    <Box sx={{ maxWidth: 550, margin: 2, alignSelf: 'center' }}>
      <Card variant="outlined">
        <CardHeader title="Error caught 🌜" />
        <CardContent>
          <p>An error just happened. {advice}</p>
          {message && (
            <p>
              Error message: <code>{message}</code>
            </p>
          )}
        </CardContent>
        <CardActions>
          <Button onClick={reloadPage}>Reload</Button>
        </CardActions>
      </Card>
    </Box>
  );
}
