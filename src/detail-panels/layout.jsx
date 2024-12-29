// @ts-check

import { useState, lazy } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { unwrapShortHandle } from '../api';

const BlockedByPanel = lazy(() => import('./blocked-by'));
const BlockingPanel = lazy(() => import('./blocking'));
const HistoryPanel = lazy(() => import('./history/history-panel'));
const Lists = lazy(() => import('./lists'));
const Packs = lazy(()=>import('./packs') );
import { AccountHeader } from './account-header';
import { TabSelector } from './tab-selector';
import { useAccountResolver } from './account-resolver';

import './layout.css';
import { AccountExtraInfo } from './account-header';

export const accountTabs = /** @type {const} */ ([
  'blocking',
  'blocked-by',
  'lists',
  'history',
  'packs',
  'packed',
]);

export function AccountLayout() {
  const { handle } = useParams();
  let { tab } = useParams();
  if (!tab) tab = accountTabs[0];

  const navigate = useNavigate();

  return (
    <AccountLayoutCore
      selectedTab={tab}
      onSetSelectedTab={(selectedTab) => {
        navigate(
          `/${handle}/` + selectedTab,
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
    case 'packs':
      return <Packs created={true}/>;
    case 'packed':
      return <Packs created={false}/>;

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
