// @ts-check

import React, { Component } from 'react';

import { useNavigate, useParams } from 'react-router-dom';
import { isPromise, resolveHandleOrDID, shortenHandle, unwrapShortHandle } from '../api';

import { AccountHeader } from './account-header';
import { BlockedByPanel } from './blocked-by';
import { BlockingPanel } from './blocking';
import { HistoryPanel } from './history/history-panel';
import { TabSelector } from './tab-selector';
import { AccountResolver } from './account-resolver';

import './layout.css';
import { AccountExtraInfo } from './account-header';
import { Lists } from './lists';
import { getHandleHistory } from '../api/handle-history';
import { forAwait } from '../common-components/for-await';

export const accountTabs = /** @type {const} */(['history', 'blocking', 'blocked-by', 'lists']);

export function AccountLayout() {

  return (
    <AccountResolver.Consumer>
      {account => <WithAccount account={account} />}
    </AccountResolver.Consumer>
  );
}

function WithAccount({ account }) {
  let { tab } = useParams();
  if (!tab) tab = accountTabs[0];

  const navigate = useNavigate();

  // const handleHistory = forAwait(
  //   [account?.shortDID, account?.shortHandle],
  //   getHandleHistory);

  return (
    <AccountLayoutCore
      account={account}
      // handleHistory={handleHistory && !isPromise(handleHistory) ? handleHistory.handle_history : undefined}
      selectedTab={tab}
      onSetSelectedTab={(selectedTab) => {
        navigate(
          '/' + unwrapShortHandle(account?.shortHandle) +
          '/' + selectedTab,
          { replace: true });
      }}
      onCloseClick={() => {
        navigate('/');
      }} />
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
            className='account-header'
            handleHistory={this.props.handleHistory}
            onCloseClick={this.props.onCloseClick}
            onInfoClick={this.handleInfoClick}
          />
          
          <AccountExtraInfo
            className={this.state?.revealInfo ? 'account-extra-info-reveal' : ''}
            handleHistory={this.props.handleHistory}
            account={this.props.account} />

          <TabSelector
            className='account-tabs-handles'
            tab={selectedTab}
            onTabSelected={selectedTab => this.props.onSetSelectedTab(selectedTab)} />

          <div className='account-tabs-content'>

            {
              accountTabs.map(tab => {
                if (tab === selectedTab && !this.materializedTabs[tab])
                  this.materializedTabs[tab] = () => renderTabContent(tab, this.props.account);
                if (tab !== selectedTab && this.materializedTabs[tab]) anyTabsBehind = true;

                const tabContentRender = this.materializedTabs[tab];
                if (!tabContentRender) return undefined;

                return (
                  <div key={tab} className={
                    'account-tab ' + (tab === selectedTab ? 'account-tab-selected' : '')}>
                    {tabContentRender()}
                  </div>
                );
              })
            }

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
      revealInfo: !this.state?.revealInfo
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
  }
}

function renderTabContent(tab, account) {
  switch (tab) {
    case 'blocked-by': return <BlockedByPanel account={account} />
    case 'blocking': return <BlockingPanel account={account} />;
    case 'lists': return <Lists account={account} />;
    case 'history': return <HistoryPanel account={account} />;

    default: return (
      <>
        <button>123</button><br />
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
