// @ts-check

import { useCallback, useState } from 'react';
import { Outlet, Await } from 'react-router-dom';

import { AccountHeader } from './account-header';
import { AccountExtraInfo } from './account-header';
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
      <div className="account-info">

        <AccountHeader
          className="account-header"
          onInfoClick={toggleRevealInfo}
        />
        <Donate />
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

import { Tab, Tabs, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Link, useMatch } from 'react-router-dom';
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
              {activeTabRoutes.map((route) => {
                const tabInfo = route.tab();
                return (
                  <Tab
                    key={route.path}
                    to={route.path}
                    component={Link}
                    label={
                      <div className="tab-label-with-info">
                        <span className="tab-label-text">{tabInfo.label}</span>
                        {tabInfo.description && (
                          <Tooltip 
                            title={tabInfo.description}
                            placement="top"
                            arrow
                          >
                            <IconButton
                              size="small"
                              className="tab-info-icon"
                              onClick={(e) => e.preventDefault()}
                              sx={{ 
                                padding: '2px',
                                marginLeft: '4px',
                                color: 'inherit',
                                opacity: 0.7,
                                '&:hover': { opacity: 1 }
                              }}
                            >
                              <InfoIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </div>
                    }
                  />
                );
              })}
            </Tabs>
          );
        }}
      />
    </div>
  );
}
