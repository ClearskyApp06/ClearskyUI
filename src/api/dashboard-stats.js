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

  /** @type {Promise<StatsEndpointResp<BlockList>>} */
  const topListsOnPromise = fetchClearskyApi('v1', 'lists/get-top-lists-on').catch(
    (err) => ({ topListsOn: err.message })
  );

  /** @type {Promise<StatsEndpointResp<BlockList>>} */
  const topListsMadePromise = fetchClearskyApi('v1', 'lists/get-top-lists-made').catch(
    (err) => ({ topListsMade: err.message })
  );

  const [totalUsers, funFacts, funnerFacts, blockStats, topListsOn, topListsMade] = await Promise.all([
    totalUsersPromise,
    funFactsPromise,
    funerFactsPromise,
    blockStatsPromise,
    topListsOnPromise,
    topListsMadePromise,
  ]);

  /**
   * @param {StatsEndpointResp<any>} obj
   * @param {keyof TimeStamps} key
   */
  function getAsof(obj, key) {
    return ('asof' in obj && obj.asof) ? obj.asof : initialData.asofTimestamps[key];
  }

  const asofTimestamps = {
    totalUsers: getAsof(totalUsers, 'totalUsers'),
    blockStats: getAsof(blockStats, 'blockStats'),
    funFacts: getAsof(funFacts, 'funFacts'),
    funnerFacts: getAsof(funnerFacts, 'funnerFacts'),
  };
  
  /** @type {FunFacts | null} */
  const funFactsData = 'data' in funFacts ? funFacts.data : null;

  /** @type {FunnerFacts | null} */
  const funnerFactsData = 'data' in funnerFacts ? funnerFacts.data : null;

  /** @type {BlockList | null} */
  const topListsOnData = 'data' in topListsOn ? topListsOn.data : null;

  /** @type {BlockList | null} */
  const topListsMadeData = 'data' in topListsMade ? topListsMade.data : null;

  /** @type {DashboardStats} */
  const result = {
    asofTimestamps,
    totalUsers: 'data' in totalUsers ? totalUsers.data : null,
    blockStats: 'data' in blockStats ? blockStats.data : null,
    topLists: {
      total: {
        blocked: funFactsData?.blocked || null,
        blockers: funFactsData?.blockers || null,
        listsOn: topListsOnData,
        listsMade: topListsMadeData,
      },
      '24h': {
        blocked: funnerFactsData?.blocked || null,
        blockers: funnerFactsData?.blockers || null,
        listsOn: funnerFactsData?.listsOn || null,
        listsMade: funnerFactsData?.listsMade || null,
      },
    },
  };
  return result;
}
