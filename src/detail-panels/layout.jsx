// @ts-check

import React from 'react';
import { Outlet, Await, Link, useMatch } from 'react-router-dom';

import { AccountHeader } from './account-header';
import './layout.css';
import '../donate.css';
import Donate from '../common-components/donate';
import { Alert, Tab, Tabs, Tooltip } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { activeTabRoutesPromise } from './tabs';
import { useAccountResolver } from './account-resolver';
import { useSpamStatus } from '../api/spam-status';
import { useFeatureFlag } from '../api/featureFlags';

/**
 *
 * @returns
 */
export function AccountLayout() {
  const resolved = useAccountResolver();

  const spamQuery = useSpamStatus(resolved.data?.shortDID);
  const spamFeature = useFeatureFlag('spam-profile-overlay');
  const isSpam = spamFeature && spamQuery.data?.spam;
  const spamSource = spamFeature && spamQuery.data?.spam_source;

  return (
    <div className="layout">
      <div className="ad-lane"></div>
      <div className="main-content">
        <Donate />
        <div className="detail-container">
          <AccountHeader className="account-header" />
          <div className="account-tabs-container">
            {isSpam && (
              <Alert
                severity="warning"
                variant="standard"
                icon={
                  <Tooltip
                    title={spamSource ? `Spam source: ${spamSource}` : ''}
                    arrow
                  >
                    <WarningAmberIcon />
                  </Tooltip>
                }
                sx={{
                  borderRadius: 0,
                  height: '40px',
                  margin: 0,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: { xs: '0.8rem', sm: '0.875rem' },
                }}
              >
                This account has been flagged as spam.
              </Alert>
            )}
            <TabSelector className="account-tabs-handles" />
          </div>
          <div className="account-tabs-content">
            <div className="account-tab account-tab-selected">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <div className="ad-lane"></div>
    </div>
  );
}

/**
 * @param {{ className: string }} param0
 */
export function TabSelector({ className }) {
  const matches = useMatch('/:account/:tab/*');
  const tab = matches?.params.tab;
  return (
    <div className={'tab-outer-container ' + (className || '')}>
      <Await
        resolve={activeTabRoutesPromise}
        // eslint-disable-next-line react/no-children-prop
        children={(
          /** @type {Awaited<typeof activeTabRoutesPromise>} */ activeTabRoutes
        ) => {
          const selectedIndex = activeTabRoutes.findIndex(
            (route) => route.path === tab
          );
          return (
            <Tabs
              TabIndicatorProps={{
                style: { display: 'none' },
              }}
              TabScrollButtonProps={{
                sx: {
                  minHeight: '48px',
                },
              }}
              className={'tab-selector-root selected-tab-' + tab}
              orientation="horizontal"
              variant="scrollable"
              allowScrollButtonsMobile
              style={{ border: 'none', margin: 0, padding: 0 }}
              value={selectedIndex === -1 ? false : selectedIndex}
            >
              {activeTabRoutes.map((route) => (
                <Tab
                  key={route.path}
                  to={route.path}
                  label={route.tab().label}
                  component={Link}
                />
              ))}
            </Tabs>
          );
        }}
      />
    </div>
  );
}
