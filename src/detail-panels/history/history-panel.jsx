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
import { useAccountResolver } from '../account-resolver';
import InfoTooltip from '../../common-components/info-tool-tip';

export default function HistoryPanel() {
  const accountQuery = useAccountResolver();
  const account = accountQuery.data;
  const history = usePostHistory(account?.shortDID);

  const [searchParams] = useSearchParams();
  const searchText = searchParams.get('q') || '';

  return (
    <>
      <div
        style={{
          fontWeight: '400',
          paddingTop: '0.3em',
          paddingLeft: '0.5em',
        }}
      >
        <InfoTooltip text="this page shows your posts" />
      </div>
      <SearchHeaderDebounced
        label={localise('Search history', { uk: 'Шукати в історії' })}
        setQ
      />
      {account?.obscurePublicRecords && (
        <div className="obscure-public-records-overlay">
          <div className="obscure-public-records-overlay-content">
            <AccountShortEntry
              account={account?.shortDID}
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
              <Tooltip title="To enable this for your profile you can do it in the bsky app via: Settings > Privacy and Security > Logged-out visibility">
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </div>
            <Button
              variant="outlined"
              target="_blank"
              href={`https://bsky.app/profile/${unwrapShortHandle(
                account?.shortHandle
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
          <HistoryLoading />
        ) : (
          <HistoryScrollableList history={history} searchText={searchText} />
        )}
      </div>
    </>
  );
}
