// @ts-check
import { NetworkCircle } from './infographics/network-circle';
import { TopBlocked } from './infographics/top-blocked';
import { TopBlockers } from './infographics/top-blockers';
import { useDeviceId } from '../../hooks/useDeviceId';

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
  const { deviceId, rolloutPercentage } = useDeviceId();
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
          {parseFloat(features?.['stats-page']?.rollout ?? "100") >= rolloutPercentage && <ViewList style={{ color: 'gray' }} />}
        </Button>
      )}

      {/* {features?.['total-users-wheel']?.status && ( */}
        <NetworkCircle
          {...{
            activeAccounts,
            deletedAccounts,
            percentNumberBlocked1,
            percentNumberBlocking1,
            loading,
          }}
        />
      {/* )} */}

      {stats && (
        <>
          {parseFloat(features?.['top-blocked']?.rollout ?? "100") >= rolloutPercentage && (
            <TopBlocked
              blocked={stats.topLists.total.blocked}
              blocked24={stats.topLists['24h'].blocked}
            />
          )}

          {parseFloat(features?.['top-blockers']?.rollout ?? "100") >= rolloutPercentage && (
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
