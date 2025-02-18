// @ts-check
import { NetworkCircle } from './infographics/network-circle';
import { TopBlocked } from './infographics/top-blocked';
import { TopBlockers } from './infographics/top-blockers';

import './home-stats-main.css';
import { Button } from '@mui/material';
import { ViewList } from '@mui/icons-material';

/**
 * @param {import('.').HomeStatsDetails} _
 */
export function HomeStatsMain({
  className,
  asofFormatted,
  activeAccounts,
  deletedAccounts,
  percentNumberBlocked1,
  percentNumberBlocking1,
  loading,
  stats,
  onToggleTable,
  features,
}) {
  return (
    <div
      className={'home-stats-main ' + (className || '')}
      style={{ padding: '0 1em' }}
    >
      <div style={{ fontSize: '60%', textAlign: 'right', color: 'silver' }}>
        <i>{asofFormatted}</i>
      </div>

      {loading ? undefined : (
        <Button size="small" className="toggle-table" onClick={onToggleTable}>
          <ViewList style={{ color: 'gray' }} />
        </Button>
      )}

      {features?.['total-users-wheel']?.status && (
        <NetworkCircle
          {...{
            activeAccounts,
            deletedAccounts,
            percentNumberBlocked1,
            percentNumberBlocking1,
            loading,
          }}
        />
      )}

      {stats && (
        <>
          {features?.['top-blocked']?.status && (
            <TopBlocked
              blocked={stats.topLists.total.blocked}
              blocked24={stats.topLists['24h'].blocked}
            />
          )}

          {features?.['top-blockers']?.status && (
            <TopBlockers
              blockers={stats.topLists.total.blockers}
              blockers24={stats.topLists['24h'].blockers}
            />
          )}
        </>
      )}
    </div>
  );
}
