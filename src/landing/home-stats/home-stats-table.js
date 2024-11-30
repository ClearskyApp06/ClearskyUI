// @ts-check

import { useMemo } from 'react';

import { AgGridReact } from 'ag-grid-react';

import { ViewList } from '@mui/icons-material';
import { Button } from '@mui/material';

import './home-stats-table.css';
import { localise } from '../../localisation';

/**
 * @param {import('.').HomeStatsDetails} _
 */
export function HomeStatsTable({
  className,
  asofFormatted,
  loading,
  stats,
  onToggleTable,
}) {
  const { rows } = useMemo(() => getGridRowsAndColumns(stats), [stats]);

  return (
    <div
      className={'home-stats-table ' + (className || '')}
      style={{ padding: '0 1em' }}
    >
      <div className="home-stats-table-container">
        <div
          className="as-of-subtitle"
          style={{ fontSize: '60%', color: 'silver' }}
        >
          <i>{asofFormatted}</i>
        </div>

        {loading ? undefined : (
          <Button
            variant="contained"
            size="small"
            className="toggle-table"
            onClick={onToggleTable}
          >
            <ViewList />
          </Button>
        )}

        <div className="home-stats-table-host">
          <AgGridReact
            defaultColDef={{
              sortable: false,
            }}
            columnDefs={[
              { field: 'Handle' },
              {
                field: 'block_count',
                headerName: 'Count',
                cellStyle: { textAlign: 'right' },
              },
              { field: 'ProfileURL', headerName: 'Profile URL' },
              { field: 'did', headerName: 'DID' },
            ]}
            getRowClass={(params) =>
              !params?.data?.title
                ? undefined
                : /blocked/i.test(params?.data?.Handle || '')
                ? 'home-stats-table-title home-stats-table-title-blocked'
                : /blockers/i.test(params?.data?.Handle || '')
                ? 'home-stats-table-title home-stats-table-title-blockers'
                : 'home-stats-table-title'
            }
            rowData={rows}
          />
        </div>
      </div>
    </div>
  );
}

/** @param {DashboardStats} stats */
function getGridRowsAndColumns(stats) {
  /** @type {Partial<Omit<DashboardBlockListEntry, "block_count"> & { title: boolean, block_count?: string }>[]} */
  const rows = [];

  rows.push({ Handle: localise('Stats', {}), title: true });
  if (stats.asof) {
    rows.push({
      Handle: localise('as of', {}),
      block_count: new Date(stats.asof).toLocaleString(),
    });
  }

  if (stats.totalUsers) {
    /** @type {ValueWithDisplayName[]} */
    const totalStats = Object.values(stats.totalUsers);
    for (const stat of totalStats) {
      rows.push({
        Handle: stat.displayName,
        block_count: stat.value?.toLocaleString(),
      });
    }
  }

  if (stats.blockStats) {
    for (const [key, value] of Object.entries(stats.blockStats)) {
      rows.push({
        // @ts-ignore would like a cast here
        Handle: getLabelForStatKey(key),
        block_count: value.toLocaleString(),
      });
    }
  }

  if (stats.topLists.blocked?.length) {
    rows.push({ Handle: localise('Blocked', {}), title: true });

    for (const blocked of stats.topLists.blocked) {
      rows.push({
        ...blocked,
        block_count: blocked.block_count.toLocaleString(),
      });
    }
  }

  if (stats.topLists.blocked24?.length) {
    rows.push({ Handle: localise('Blocked 24h', {}), title: true });

    for (const blocked of stats.topLists.blocked24) {
      rows.push({
        ...blocked,
        block_count: blocked.block_count.toLocaleString(),
      });
    }
  }

  if (stats.topLists.blockers?.length) {
    rows.push({ Handle: localise('Blockers', {}), title: true });

    for (const blocked of stats.topLists.blockers) {
      rows.push({
        ...blocked,
        block_count: blocked.block_count.toLocaleString(),
      });
    }
  }

  if (stats.topLists.blockers24?.length) {
    rows.push({ Handle: localise('Blockers 24h', {}), title: true });

    for (const blocked of stats.topLists.blockers24) {
      rows.push({
        ...blocked,
        block_count: blocked.block_count.toLocaleString(),
      });
    }
  }

  return {
    rows,
  };
}

/**
 *
 * @param {keyof BlockStats} key
 */
function getLabelForStatKey(key) {
  switch (key) {
    case 'averageNumberOfBlocked':
      return localise('Average Number of Users Blocked', {});
    case 'averageNumberOfBlocks':
      return localise('Average Number of Blocks', {});
    case 'numberBlock1':
      return localise('Number of Users Blocking 1 User', {});
    case 'numberBlocked1':
      return localise('Number of Users Blocked by 1 User', {});
    case 'numberBlocked101and1000':
      return localise('Number of Users Blocked by 101-1000 Users', {});
    case 'numberBlocked2and100':
      return localise('Number of Users Blocked by 2-100 Users', {});
    case 'numberBlockedGreaterThan1000':
      return localise('Number of Users Blocked by More than 1000 Users', {});
    case 'numberBlocking101and1000':
      return localise('Number of Users Blocking 101-1000 Users', {});
    case 'numberBlocking2and100':
      return localise('Number of Users Blocking 2-100 Users', {});
    case 'numberBlockingGreaterThan1000':
      return localise('Number of Users Blocking More than 1000 Users', {});
    case 'numberOfTotalBlocks':
      return localise('Number of Total Blocks', {});
    case 'numberOfUniqueUsersBlocked':
      return localise('Number of Unique Users Blocked', {});
    case 'numberOfUniqueUsersBlocking':
      return localise('Number of Unique Users Blocking', {});
    case 'percentNumberBlocked1':
      return localise('Percent of Users Blocked by 1 User', {});
    case 'percentNumberBlocked101and1000':
      return localise('Percent of Users Blocked by 101-1000 Users', {});
    case 'percentNumberBlocked2and100':
      return localise('Percent of Users Blocked by 2-100 Users', {});
    case 'percentNumberBlockedGreaterThan1000':
      return localise('Percent of Users Blocked by More than 1000 Users', {});
    case 'percentNumberBlocking1':
      return localise('Percent of Users Blocking 1 User', {});
    case 'percentNumberBlocking101and1000':
      return localise('Percent of Users Blocking 101-1000 Users', {});
    case 'percentNumberBlocking2and100':
      return localise('Percent of Users Blocking 2-100 Users', {});
    case 'percentNumberBlockingGreaterThan1000':
      return localise('Percent of Users Blocking More than 1000 Users', {});
    case 'percentUsersBlocked':
      return localise('Percent Users Blocked', {});
    case 'percentUsersBlocking':
      return localise('Percent Users Blocking', {});
    case 'totalUsers':
      return localise('Total Users', {});
  }
}
