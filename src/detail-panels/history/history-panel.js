// @ts-check
import { useSearchParams } from 'react-router-dom';
import { unwrapShortHandle, usePostHistory } from '../../api';
import { localise } from '../../localisation';
import { HistoryLoading } from './history-loading';
import { HistoryScrollableList } from './history-scrollable-list';
import { SearchHeaderDebounced } from './search-header';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { Button, Tooltip, IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import './history-panel.css';

/**
 * @param {{
 *  account: Partial<AccountInfo> & { shortHandle: String, loading: true }
 * }} _
 */
export function HistoryPanel({ account }) {
  const history = usePostHistory(account.shortDID);

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
            {account?.obscurePublicRecords && (
              <div className="obscure-public-records-overlay">
                <div className="obscure-public-records-overlay-content">
                  <AccountShortEntry
                    account={account}
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
                      account.shortHandle
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
                account?.obscurePublicRecords
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
              {history.isLoading ? (
                <HistoryLoading account={account} />
              ) : (
                <HistoryScrollableList
                  history={history}
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

function SearchParamsHelper({ children }) {
  const [searchParams, setSearchParams] = useSearchParams();
  return children({ searchParams, setSearchParams });
}
