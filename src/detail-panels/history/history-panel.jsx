import React, { Component } from 'react';
import { useSearchParams } from 'react-router-dom';
import { isPromise, postHistory, unwrapShortHandle } from '../../api';
import { localise } from '../../localisation';
import { HistoryLoading } from './history-loading';
import { HistoryScrollableList } from './history-scrollable-list';
import { SearchHeaderDebounced } from './search-header';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { Button, Link, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import './history-panel.css';

export default class HistoryPanel extends Component {
  accountPostHistory;

  render() {
    if (this.accountPostHistory) {
      if (!this.isRelevant(this.accountPostHistory))
        this.accountPostHistory = undefined;
    }

    if (!this.accountPostHistory) {
      this.accountPostHistory = postHistory(
        this.props.account.shortHandle || this.props.account.shortDID
      );
      if (
        !this.accountPostHistory.shortHandle &&
        !this.accountPostHistory.shortDID
      ) {
        this.accountPostHistory.shortHandle = this.props.account.shortHandle;
        this.accountPostHistory.shortDID = this.props.account.shortDID;
      }
      (async () => {
        try {
          const postHistory = await this.accountPostHistory;
          if (!this.isRelevant(postHistory)) return;

          this.accountPostHistory = postHistory;
          this.setState({ error: null, loaded: Date.now() });

          await this.accountPostHistory?.fetchMore();
          if (!this.isRelevant(postHistory)) return;

          this.setState({ error: null, loaded: Date.now() });
        } catch (err) {
          this.setState({ error: err, loaded: Date.now() });
        }
      })();
    }

    return (
      <SearchParamsHelper>
        {({ searchParams, setSearchParams }) => {
          const searchText = searchParams.get('q') || '';

          return (
            <>
              <SearchHeaderDebounced
                label={localise('Search history', { uk: 'Шукати в історії' })}
                setQ
              />
              {this.props.account?.obscurePublicRecords && (
                <div className="obscure-public-records-overlay">
                  <div className="obscure-public-records-overlay-content">
                    <AccountShortEntry
                      account={this.props.account}
                      withDisplayName
                      link={false}
                    />
                    <div className="obscure-public-records-caption">
                      {localise(
                        'has requested to obscure their records from unauthenticated users',
                        {
                          uk: 'просить приховати свої повідомлення від неавтентифікованих користувачів',
                        }
                      )}
                      <Tooltip title="To enable this for your profile you can do it in the bsky app via: Settings > Moderation > Logged-out visibility">
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </div>
                    <Button
                      variant="outlined"
                      target="_blank"
                      href={`https://bsky.app/profile/${unwrapShortHandle(
                        this.props.account.shortHandle
                      )}`}
                    >
                      {localise('Authenticate', {
                        uk: 'Автентифікація',
                      })}
                    </Button>
                  </div>
                </div>
              )}
              <div
                className={
                  this.props.account?.obscurePublicRecords
                    ? 'history-panel-container history-panel-container-obscurePublicRecords'
                    : 'history-panel-container'
                }
                style={
                  {
                    // background: 'tomato',
                    // backgroundColor: '#fffcf5',
                    // backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
                  }
                }
              >
                {isPromise(this.accountPostHistory) ? (
                  <HistoryLoading account={this.props.account} />
                ) : (
                  <HistoryScrollableList
                    account={this.props.account}
                    history={this.accountPostHistory}
                    searchText={searchText}
                  />
                )}
              </div>
            </>
          );
        }}
      </SearchParamsHelper>
    );
  }

  /** @param {{ shortDID?: string, shortHandle?: string } | undefined} account */
  isRelevant(account) {
    return (
      account &&
      (account.shortDID === this.props.account.shortDID ||
        account.shortHandle === this.props.account.shortHandle)
    );
  }
}

function SearchParamsHelper({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  return children({ searchParams, setSearchParams });
}
