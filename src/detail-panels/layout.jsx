// @ts-check

import { lazy, useState } from 'react';

import { useLocation, useNavigate, useParams } from 'react-router-dom';

const BlockedByPanel = lazy(() => import('./blocked-by'));
const BlockingPanel = lazy(() => import('./blocking'));
const HistoryPanel = lazy(() => import('./history/history-panel'));
const Lists = lazy(() => import('./lists'));
const BlockingLists = lazy(() => import('./blocking-lists'));
const BlockedByLists = lazy(() => import('./blocked-by-lists'));
const LabeledPanel = lazy(() => import('./labeled'));
const Packs = lazy(()=>import('./packs') );

import { AccountHeader } from './account-header';
import { TabSelector } from './tab-selector';

import { AccountExtraInfo } from './account-header';
import './layout.css';
import { Packed } from './packs/packed';
import BlockListSubscribersPanel from './block-list-subscribers';

export const accountTabs = /** @type {const} */ ([
  'blocking',
  'blocked-by',
  'blocking-lists',
  'blocked-by-lists',
  'lists',
  'history',
  'labeled',
  'packs',
  'packed',
]);

export function AccountLayout() {
  const { handle } = useParams();
  let { tab } = useParams();
  if (!tab) tab = accountTabs[0];

  const navigate = useNavigate();
  const { state } = useLocation();

  return (
    <AccountLayoutCore
      // @ts-expect-error no guarantee that the url param is one of our known tabs
      selectedTab={tab}
      state={state}
      onSetSelectedTab={(selectedTab) => {
        navigate(`/${handle}/` + selectedTab, { replace: true });
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
 *  selectedTab: import('./tab-selector').AnyTab,
 *  onCloseClick: () => void,
 *  onSetSelectedTab: (tab:string) => void,
 *  state: any,
 * }} param0
 * @returns
 */
export function AccountLayoutCore({
  selectedTab,
  onCloseClick,
  onSetSelectedTab,
  state
}) {
  const [revealInfo, setRevealInfo] = useState(false);

  const handleInfoClick = () => {
    setRevealInfo((prev) => !prev);
  };
  const result = (
    <>
      <div className="layout">
        <div className="account-info">
        <AccountHeader 
          className="account-header"
          onCloseClick={onCloseClick}
          onInfoClick={handleInfoClick}
        />

        <AccountExtraInfo
          className={revealInfo ? 'account-extra-info-reveal' : ''}
          onInfoClick={handleInfoClick}
        />
        </div>
        <div className='detail-container'>
        <TabSelector
          className="account-tabs-handles"
          tab={selectedTab}
          onTabSelected={(selectedTab) => onSetSelectedTab(selectedTab)}
        />

        <div key={selectedTab} className="account-tabs-content">
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
                  {renderTabContent(tab, state)}
                </div>
              );
          })}
        </div>
        </div> 
      </div>
    </>
  );
  return result;
}

/**
 *
 * @param {string} tab
 * @param {any} state
 * @returns
 */
function renderTabContent(tab, state) { 
  switch (tab) {
    case 'blocked-by':
      return <BlockedByPanel />;
    case 'blocking':
      return <BlockingPanel />;
    case 'blocking-lists':
      return <BlockingLists />;
    case 'blocked-by-lists':
      return state ? <BlockListSubscribersPanel blockListEntry={state}/> : <BlockedByLists/>;
    // case 'blocked-by-list-subscribers':
    //   return <BlockListSubscribersPanel blockListEntry={state}/>;
    case 'lists':
      return <Lists />;
    case 'history':
      return <HistoryPanel />;
    case 'labeled':
      return <LabeledPanel />;
    case 'packs':
      return <Packs/>;
    case 'packed':
      return <Packed/>;

    default:
      return (
        <>
          {tab}
        </>
      );
  }
}
