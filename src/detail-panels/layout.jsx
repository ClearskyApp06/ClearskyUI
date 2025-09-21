// @ts-check

import { useCallback, useState } from 'react';
import { Outlet, Await, Link, useMatch } from 'react-router-dom';

import { AccountHeader, AccountExtraInfo } from './account-header';
import './layout.css';
import '../donate.css';
import Donate from '../common-components/donate';

/**
 *
 * @returns
 */
export function AccountLayout() {
  const [revealInfo, setRevealInfo] = useState(false);
  const toggleRevealInfo = useCallback(() => {
    setRevealInfo((prev) => !prev);
  }, []);
  return (
    <div className="layout">
      <div className="ad-lane"></div>
      <div className="main-content">
        <Donate />
        <AccountExtraInfo
          className={revealInfo ? 'account-extra-info-reveal' : 'hidden'}
          onInfoClick={toggleRevealInfo}
        />
        <div className="detail-container">
          <AccountHeader
            className="account-header"
            onInfoClick={toggleRevealInfo}
          />
          <TabSelector className="account-tabs-handles" />
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

import { Tab, Tabs } from '@mui/material';
import { activeTabRoutesPromise } from './tabs';

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
