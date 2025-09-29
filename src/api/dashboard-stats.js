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
    (err) => ({ data: initialData.totalUsers })
  );

  /** @type {Promise<StatsEndpointResp<FunFacts>>} */
  const funFactsPromise = fetchClearskyApi('v1', 'lists/fun-facts').catch(
    (err) => ({ data: initialData.topLists.total })
  );

  /** @type {Promise<StatsEndpointResp<FunnerFacts>>} */
  const funerFactsPromise = fetchClearskyApi('v1', 'lists/funer-facts').catch(
    (err) => ({ data: initialData.topLists['24h'] })
  );

  /** @type {Promise<StatsEndpointResp<BlockStats>>} */
  const blockStatsPromise = fetchClearskyApi('v1', 'lists/block-stats').catch(
    (err) => ({ data: initialData.blockStats })
  );

  const [totalUsers, funFacts, funnerFacts, blockStats] = await Promise.all([
    totalUsersPromise,
    funFactsPromise,
    funerFactsPromise,
    blockStatsPromise,
  ]);

  const asof = 'asof' in blockStats ? blockStats.asof : initialData.asof;

  /** @type {FunFacts | null} */
  const funFactsData = 'data' in funFacts ? funFacts.data : null;

  /** @type {FunnerFacts | null} */
  const funnerFactsData = 'data' in funnerFacts ? funnerFacts.data : null;

  /** @type {DashboardStats} */
  const result = {
    asof,
    totalUsers: 'data' in totalUsers ? totalUsers.data : null,
    blockStats: 'data' in blockStats ? blockStats.data : null,
    topLists: {
      total: funFactsData || { blocked: null, blockers: null },
      '24h': funnerFactsData || { blocked: null, blockers: null },
    },
  };
  return result;
}
