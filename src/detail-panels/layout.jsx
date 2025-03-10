// @ts-check

import { useCallback, useState } from 'react';

import { AccountHeader } from './account-header';
import { TabSelector } from './tabs';

import { AccountExtraInfo } from './account-header';
import './layout.css';
import { Outlet } from 'react-router-dom';
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
      <Donate/>
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
