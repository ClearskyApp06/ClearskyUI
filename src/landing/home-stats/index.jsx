// @ts-check

import { useState, lazy } from 'react';

import { HomeStatsMain } from './home-stats-main';
import { useDashboardStats } from '../../api';

const HomeStatsTable = lazy(() => import('./home-stats-table'));

/**
 * @typedef {{
 *  className: string | undefined;
 *  asofTimestamps: TimeStamps;
 *  activeAccounts: number | undefined;
 *  deletedAccounts: number | undefined;
 *  totalAccounts: number | undefined;
 *  percentNumberBlocked1: number | undefined;
 *  percentNumberBlocking1: number | undefined;
 *  loading: boolean;
 *  stats: DashboardStats;
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

  const activeAccounts = stats.totalUsers?.active_count?.value;
  const deletedAccounts = stats.totalUsers?.deleted_count?.value;
  const totalAccounts = stats.totalUsers?.total_count?.value;
  const percentNumberBlocked1 = stats.blockStats?.percentNumberBlocked1;
  const percentNumberBlocking1 = stats.blockStats?.percentNumberBlocking1;

  /** @type {HomeStatsDetails} */
  const arg = {
    className,
    asofTimestamps: stats.asofTimestamps,
    activeAccounts,
    deletedAccounts,
    totalAccounts,
    percentNumberBlocked1,
    percentNumberBlocking1,
    loading: isLoading,
    stats,
    onToggleTable() {
      setAsTable((prev) => !prev);
    },
  };

  if (asTable) return <HomeStatsTable {...arg} />;
  else return <HomeStatsMain {...arg} />;
}
