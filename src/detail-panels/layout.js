// @ts-check

import { useState } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { unwrapShortHandle } from '../api';

import { AccountHeader } from './account-header';
import { BlockedByPanel } from './blocked-by';
import { BlockingPanel } from './blocking';
import { HistoryPanel } from './history/history-panel';
import { TabSelector } from './tab-selector';
import { useAccountResolver } from './account-resolver';

import './layout.css';
import { AccountExtraInfo } from './account-header';
import { Lists } from './lists';

export const accountTabs = /** @type {const} */ ([
  'blocking',
  'blocked-by',
  'lists',
  'history',
]);

export function AccountLayout() {
  const account = useAccountResolver();
  let { tab } = useParams();
  if (!tab) tab = accountTabs[0];

  const navigate = useNavigate();

  return (
    <AccountLayoutCore
      selectedTab={tab}
      onSetSelectedTab={(selectedTab) => {
        navigate(
          '/' +
            unwrapShortHandle(account.data?.shortHandle) +
            '/' +
            selectedTab,
          { replace: true }
        );
      }}
      onCloseClick={() => {
        navigate('/');
      }}
    />
  );
}

/**
 *
 * @param {{
 *   selectedTab: string,
 * onCloseClick: () => void,
 * onSetSelectedTab: (tab:string) => void,
 * }} param0
 * @returns
 */
export function AccountLayoutCore({
  selectedTab,
  onCloseClick,
  onSetSelectedTab,
}) {
  const [revealInfo, setRevealInfo] = useState(false);

  const handleInfoClick = () => {
    setRevealInfo((prev) => !prev);
  };
  const result = (
    <>
      <div className="layout">
        <AccountHeader
          className="account-header"
          onCloseClick={onCloseClick}
          onInfoClick={handleInfoClick}
        />

        <AccountExtraInfo
          className={revealInfo ? 'account-extra-info-reveal' : ''}
        />

        <TabSelector
          className="account-tabs-handles"
          tab={selectedTab}
          onTabSelected={(selectedTab) => onSetSelectedTab(selectedTab)}
        />

        <div className="account-tabs-content">
          {accountTabs.map((tab) => {
            if (tab === selectedTab)
              return (
                <div
                  key={tab}
                  className={
                    'account-tab ' +
                    (tab === selectedTab ? 'account-tab-selected' : '')
                  }
                >
                  {renderTabContent(tab)}
                </div>
              );
          })}
        </div>
      </div>
    </>
  );
  return result;
}

/**
 *
 * @param {string} tab
 * @returns
 */
function renderTabContent(tab) {
  switch (tab) {
    case 'blocked-by':
      return <BlockedByPanel />;
    case 'blocking':
      return <BlockingPanel />;
    case 'lists':
      return <Lists />;
    case 'history':
      return <HistoryPanel />;

    default:
      return (
        <>
          <button>123</button>
          <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid <br />
          grid
        </>
      );
  }
}
