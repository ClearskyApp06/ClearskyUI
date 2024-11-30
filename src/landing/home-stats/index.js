// @ts-check

import { useState } from 'react';

import { HomeStatsMain } from './home-stats-main';
import { useDashboardStats } from '../../api';
import { parseNumberWithCommas } from '../../api/core';
import { HomeStatsTable } from './home-stats-table';

/**
 * @typedef {{
 *  className: string | undefined;
 *  asofFormatted: any;
 *  activeAccounts: number | undefined;
 *  deletedAccounts: number | undefined;
 *  percentNumberBlocked1: number | undefined;
 *  percentNumberBlocking1: number | undefined;
 *  loading: boolean;
 *  stats: DashboardStats | undefined;
 *  onToggleTable?: () => void;
 * }} HomeStatsDetails
 */

/**
 * @param {{
 *  className?: string;
 * }} _
 */
export function HomeStats({ className }) {
  const [asTable, setAsTable] = useState(false);

  const { data: stats, isLoading } = useDashboardStats();

  const asofFormatted = stats?.asof && new Date(stats.asof) + '';

  const activeAccounts = parseNumberWithCommas(
    stats?.totalUsers.active_count?.value
  );
  const deletedAccounts = parseNumberWithCommas(
    stats?.totalUsers.deleted_count?.value
  );
  const percentNumberBlocked1 = stats?.blockStats.percentNumberBlocked1;
  const percentNumberBlocking1 = stats?.blockStats.percentNumberBlocking1;

  const arg = {
    className,
    asofFormatted,
    activeAccounts,
    deletedAccounts,
    percentNumberBlocked1,
    percentNumberBlocking1,
    loading: isLoading,
    stats,
  };

  if (asTable)
    return <HomeStatsTable {...arg} onToggleTable={() => setAsTable(false)} />;
  else return <HomeStatsMain {...arg} onToggleTable={() => setAsTable(true)} />;
}
