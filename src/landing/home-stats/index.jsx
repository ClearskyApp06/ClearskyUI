// @ts-check

import { HomeStatsMain } from './home-stats-main';
import { useDashboardStats } from '../../api';

/**
 * @typedef {{
 *  className: string | undefined;
 *  asofFormatted: any;
 *  activeAccounts: number | undefined;
 *  deletedAccounts: number | undefined;
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
  const { data: stats, isLoading } = useDashboardStats();

  const asofFormatted = stats.asof && new Date(stats.asof) + '';

  const activeAccounts = stats.totalUsers?.active_count?.value;
  const deletedAccounts = stats.totalUsers?.deleted_count?.value;
  const percentNumberBlocked1 = stats.blockStats?.percentNumberBlocked1;
  const percentNumberBlocking1 = stats.blockStats?.percentNumberBlocking1;

  /** @type {HomeStatsDetails} */
  const arg = {
    className,
    asofFormatted,
    activeAccounts,
    deletedAccounts,
    percentNumberBlocked1,
    percentNumberBlocking1,
    loading: isLoading,
    stats,
    onToggleTable() {
      // This callback is no longer used since navigation is handled directly
      // in HomeStatsMain, but kept for interface compatibility
    },
  };

  return <HomeStatsMain {...arg} />;
}
