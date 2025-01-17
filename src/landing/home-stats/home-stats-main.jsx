// @ts-check
import { isPromise } from '../../api';

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

      <NetworkCircle
        {...{
          activeAccounts,
          deletedAccounts,
          percentNumberBlocked1,
          percentNumberBlocking1,
          loading,
        }}
      />

      {stats && (
        <>
          <TopBlocked
            blocked={stats.topLists.blocked}
            blocked24={stats.topLists.blocked24}
          />

          <TopBlockers
            blockers={stats.topLists.blockers}
            blockers24={stats.topLists.blockers24}
          />
        </>
      )}
    </div>
  );
}
