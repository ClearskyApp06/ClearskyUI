// @ts-check

import { useCallback, useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AccountHeader } from './account-header';
import { AccountExtraInfo } from './account-header';
import './layout.css';

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
      <div className="account-info">
        <AccountHeader
          className="account-header"
          onInfoClick={toggleRevealInfo}
        />

        <AccountExtraInfo
          className={revealInfo ? 'account-extra-info-reveal' : ''}
          onInfoClick={toggleRevealInfo}
        />
      </div>
      <div className="detail-container">
        <TabSelector className="account-tabs-handles" />

        <div className="account-tabs-content">
          <div className="account-tab account-tab-selected">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

import { Tab, Tabs } from '@mui/material';
import { Link, useMatch } from 'react-router-dom';
import { activeTabRoutes } from './tabs';

/**
 * @param {{ className: string }} param0
 */
export function TabSelector({ className }) {
  const matches = useMatch('/:account/:tab/*');
  const tab = matches?.params.tab;
  const selectedIndex = activeTabRoutes.findIndex(
    (route) => route.path === tab
  );
  return (
    <div className={'tab-outer-container ' + (className || '')}>
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
    </div>
  );
}
