// @ts-check

import { Component, lazy } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { unwrapShortHandle } from '../api';

const BlockedByPanel = lazy(() => import('./blocked-by'));
const BlockingPanel = lazy(() => import('./blocking'));
const HistoryPanel = lazy(() => import('./history/history-panel'));
const Lists = lazy(() => import('./lists'));

import { AccountHeader } from './account-header';
import { TabSelector } from './tab-selector';
import { useAccountResolver } from './account-resolver';

import './layout.css';
import { AccountExtraInfo } from './account-header';
import { useHandleHistory } from '../api/handle-history';

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

  const did = 'shortDID' in account ? account.shortDID : '';
  const handleHistoryQuery = useHandleHistory(did);

  return (
    <AccountLayoutCore
      account={account}
      handleHistory={handleHistoryQuery.data?.handle_history}
      selectedTab={tab}
      onSetSelectedTab={(selectedTab) => {
        navigate(
          '/' + unwrapShortHandle(account?.shortHandle) + '/' + selectedTab,
          { replace: true }
        );
      }}
      onCloseClick={() => {
        navigate('/');
      }}
    />
  );
}

export class AccountLayoutCore extends Component {
  materializedTabs = {};

  clearOldTabsTimeout;

  render() {
    const selectedTab = this.props.selectedTab;

    let anyTabsBehind = false;
    const result = (
      <>
        <div className="layout">
          <AccountHeader
            account={this.props.account}
            className="account-header"
            handleHistory={this.props.handleHistory}
            onCloseClick={this.props.onCloseClick}
            onInfoClick={this.handleInfoClick}
          />

          <AccountExtraInfo
            className={
              this.state?.revealInfo ? 'account-extra-info-reveal' : ''
            }
            handleHistory={this.props.handleHistory}
            account={this.props.account}
          />

          <TabSelector
            className="account-tabs-handles"
            tab={selectedTab}
            onTabSelected={(selectedTab) =>
              this.props.onSetSelectedTab(selectedTab)
            }
          />

          <div className="account-tabs-content">
            {accountTabs.map((tab) => {
              if (tab === selectedTab && !this.materializedTabs[tab])
                this.materializedTabs[tab] = () =>
                  renderTabContent(tab, this.props.account);
              if (tab !== selectedTab && this.materializedTabs[tab])
                anyTabsBehind = true;

              const tabContentRender = this.materializedTabs[tab];
              if (!tabContentRender) return undefined;

              return (
                <div
                  key={tab}
                  className={
                    'account-tab ' +
                    (tab === selectedTab ? 'account-tab-selected' : '')
                  }
                >
                  {tabContentRender()}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );

    clearTimeout(this.clearOldTabsTimeout);
    if (anyTabsBehind) {
      this.clearOldTabsTimeout = setTimeout(this.clearOldTabs, 700);
    }

    return result;
  }

  handleInfoClick = () => {
    this.setState({
      revealInfo: !this.state?.revealInfo,
    });
  };

  clearOldTabs = () => {
    let anyTabsCleared = false;
    for (const tab of accountTabs) {
      if (tab !== this.props.selectedTab && this.materializedTabs[tab]) {
        delete this.materializedTabs[tab];
        anyTabsCleared = true;
      }
    }
    if (anyTabsCleared) {
      this.forceUpdate();
    }
  };
}

function renderTabContent(tab, account) {
  switch (tab) {
    case 'blocked-by':
      return <BlockedByPanel account={account} />;
    case 'blocking':
      return <BlockingPanel account={account} />;
    case 'lists':
      return <Lists account={account} />;
    case 'history':
      return <HistoryPanel account={account} />;

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
