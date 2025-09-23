// @ts-check
/// <reference path="../types.d.ts" />

import { useQuery } from '@tanstack/react-query';
import { fetchClearskyApi } from './core';

import initialData from './dashboard-stats-base.json';
const initialDataUpdatedAt = new Date(initialData.asof).valueOf();

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardStatsApi,
    initialData,
    initialDataUpdatedAt,
  });
}

async function dashboardStatsApi() {
  /** @type {Promise<StatsEndpointResp<TotalUsers>>} */
  const totalUsersPromise = fetchClearskyApi('v1', 'total-users').catch(
    (err) => ({ totalUsers: err.message + ' CORS?' })
  );

  /** @type {Promise<StatsEndpointResp<FunFacts>>} */
  const funFactsPromise = fetchClearskyApi('v1', 'lists/fun-facts').catch(
    (err) => ({ funFacts: err.message + ' CORS?' })
  );

  /** @type {Promise<StatsEndpointResp<FunnerFacts>>} */
  const funerFactsPromise = fetchClearskyApi('v1', 'lists/funer-facts').catch(
    (err) => ({ funerFacts: err.message + ' CORS?' })
  );

  /** @type {Promise<StatsEndpointResp<BlockStats>>} */
  const blockStatsPromise = fetchClearskyApi('v1', 'lists/block-stats').catch(
    (err) => ({ blockStats: err.message })
  );

  const [totalUsers, funFacts, funnerFacts, blockStats] = await Promise.all([
    totalUsersPromise,
    funFactsPromise,
    funerFactsPromise,
    blockStatsPromise,
  ]);

  // Collect asof timestamps from each endpoint
  const totalUsersAsof = 'asof' in totalUsers ? totalUsers.asof : initialData.asof;
  const blockStatsAsof = 'asof' in blockStats ? blockStats.asof : initialData.asof;
  const funFactsAsof = 'asof' in funFacts ? funFacts.asof : initialData.asof;
  const funnerFactsAsof = 'asof' in funnerFacts ? funnerFacts.asof : initialData.asof;

  // Use blockStats asof as the main asof for backwards compatibility
  const asof = blockStatsAsof;

  /** @type {FunFacts | null} */
  const funFactsData = 'data' in funFacts ? funFacts.data : null;

  /** @type {FunnerFacts | null} */
  const funnerFactsData = 'data' in funnerFacts ? funnerFacts.data : null;

  /** @type {DashboardStats} */
  const result = {
    asof,
    asofTimestamps: {
      totalUsers: totalUsersAsof,
      blockStats: blockStatsAsof,
      funFacts: funFactsAsof,
      funnerFacts: funnerFactsAsof,
    },
    totalUsers: 'data' in totalUsers ? totalUsers.data : null,
    blockStats: 'data' in blockStats ? blockStats.data : null,
    topLists: {
      total: funFactsData || { blocked: null, blockers: null },
      '24h': funnerFactsData || { blocked: null, blockers: null },
    },
  };
  return result;
}
