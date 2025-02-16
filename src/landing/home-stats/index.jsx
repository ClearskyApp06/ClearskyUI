// @ts-check

import { useState, lazy } from 'react';

import { HomeStatsMain } from './home-stats-main';
import { useDashboardStats } from '../../api';
import { useAllFeatures } from '../../api/featureFlags';

const HomeStatsTable = lazy(() => import('./home-stats-table'));

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
 *  features : FeatureFlagsResponse | undefined
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
  const { data: features} = useAllFeatures();

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
      setAsTable((prev) => !prev);
    },
    features,
  };

  if (asTable) return <HomeStatsTable {...arg} />;
  else return <HomeStatsMain {...arg} />;
}
