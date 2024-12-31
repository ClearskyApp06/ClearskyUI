// @ts-check

import { useMemo, useState } from 'react';

import { AgGridReact } from '../../common-components/ag-grid';

import { ViewList } from '@mui/icons-material';
import { Box, Button } from '@mui/material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import './home-stats-table.css';
import { localise } from '../../localisation';
import { unwrapShortHandle } from '../../api';
import { Link } from 'react-router-dom';

/**
 * @param {import('.').HomeStatsDetails} _
 */
export default function HomeStatsTable({
  className,
  asofFormatted,
  loading,
  stats,
  onToggleTable,
}) {
  const { allBlockedStats, topBlocked, topBlocked24, topBlockers, topBlockers24 } = useMemo(() => getGridRowsAndColumns(stats), [stats]);

  const [activeTab, setActiveTab] = useState(0);
  const tableData = [
    { id: 1, name: localise('Overall Stats', {}), data: allBlockedStats, columnDefs: [
        { field: 'category', headerName: 'Stats' },
        { field: 'value'}
      ]
    },
    { id: 2, name: localise('Top Blocked', {}), data: topBlocked, columnDefs: [
        { field: 'handle', cellRenderer: HandleLinkRenderer},
        {
          field: 'count',
          headerName: 'Count',
          cellStyle: { textAlign: 'right' },
        },
        { field: 'did', headerName: 'DID' },
      ]
    },
    { id: 3, name: localise('Top Blocked Last 24h', {}), data: topBlocked24, columnDefs: [
        { field: 'handle', cellRenderer: HandleLinkRenderer},
        {
          field: 'count',
          headerName: 'Count',
          cellStyle: { textAlign: 'right' },
        },
        { field: 'did', headerName: 'DID' },
      ]
    },
    { id: 4, name: localise('Top Blockers', {}), data: topBlockers, columnDefs: [
        { field: 'handle', cellRenderer: HandleLinkRenderer},
        {
          field: 'count',
          headerName: 'Count',
          cellStyle: { textAlign: 'right' },
        },
        { field: 'did', headerName: 'DID' },
      ]
    },
    { id: 5, name: localise('Top Blockers Last 24h', {}), data: topBlockers24, columnDefs: [
        { field: 'handle', cellRenderer: HandleLinkRenderer},
        {
          field: 'count',
          headerName: 'Count',
          cellStyle: { textAlign: 'right' },
        },
        { field: 'did', headerName: 'DID' },
      ]
    }
  ];
  const handleChange = (event, newValue) => setActiveTab(newValue);

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

        <div className="tabs">
          <Box sx={{ width: '100%' }}>
            <Tabs
              value={activeTab}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons
              allowScrollButtonsMobile            
              textColor="primary"
              indicatorColor="primary"
              aria-label="primary scrollable block-stats tabs"
            >
              {tableData.map((table, index) => (
                <Tab key={table.id} value={index} label={table.name} />
              ))}
            </Tabs>
          </Box>
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
            autoSizeStrategy={{type: 'fitCellContents', colIds: ['category', 'did']}}
            defaultColDef={{
              resizable: true,
              sortable: false
            }}
            columnDefs={tableData[activeTab].columnDefs}
            rowData={tableData[activeTab].data}
          />
        </div>
      </div>
    </div>
  );
}

/** 
 * @param {DashboardStats} stats
 */
function getGridRowsAndColumns(stats) {
  const blockedData = {'allBlockedStats': [], 'topBlocked': [], 'topBlocked24': [], 'topBlockers': [], 'topBlockers24': []};

  if (stats.totalUsers) {
    /** @type {ValueWithDisplayName[]} */
    const totalStats = Object.values(stats.totalUsers);
    for (const stat of totalStats) {
      if (typeof stat.displayName === "undefined") {
        continue
      }
      blockedData['allBlockedStats'].push({
        category: stat.displayName,
        value: stat.value?.toLocaleString(),
      });
    }
  }

  if (stats.blockStats) {
    for (const [key, value] of Object.entries(stats.blockStats)) {
      blockedData['allBlockedStats'].push({
        // @ts-ignore would like a cast here
        category: getLabelForStatKey(key),
        value: value.toLocaleString(),
      });
    }
  }

  if (stats.topLists.blocked && Object.keys(stats.topLists.blocked).length) {
    for (const [key, value] of Object.entries(stats.topLists.blocked)) {
      blockedData['topBlocked'].push({
        did: key,
        profile_url: null,
        handle: value.handle,
        count: value.count.toLocaleString()
      });
    }

    blockedData['topBlocked'].sort((a, b) => parseInt(b.count) - parseInt(a.count))
  }

  if (stats.topLists.blocked24 && Object.keys(stats.topLists.blocked24).length) {
    for (const [key, value] of Object.entries(stats.topLists.blocked24)) {
      blockedData['topBlocked24'].push({
        did: key,
        profile_url: null,
        handle: value.handle,
        count: value.count.toLocaleString()
      });
    }

    blockedData['topBlocked24'].sort((a, b) => parseInt(b.count) - parseInt(a.count))
  }

  if (stats.topLists.blockers && Object.keys(stats.topLists.blockers).length) {
    for (const [key, value] of Object.entries(stats.topLists.blockers)) {
      blockedData['topBlockers'].push({
        did: key,
        profile_url: null,
        handle: value.handle,
        count: value.count.toLocaleString()
      });
    }

    blockedData['topBlockers'].sort((a, b) => parseInt(b.count) - parseInt(a.count))
  }

  if (stats.topLists.blockers24 && Object.keys(stats.topLists.blockers24).length) {
    for (const [key, value] of Object.entries(stats.topLists.blockers24)) {
      blockedData['topBlockers24'].push({
        did: key,
        profile_url: null,
        handle: value.handle,
        count: value.count.toLocaleString()
      });
    }

    blockedData['topBlockers24'].sort((a, b) => parseInt(b.count) - parseInt(a.count))
  }

  return blockedData;
}

/**
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

/**
 * @param {import('ag-grid-community').ICellRendererParams} params
 * 
 * @returns {JSX.Element | string}
 */
function HandleLinkRenderer(params) {
    try{
      return (<Link to={`/${unwrapShortHandle(params.data.handle)}/history`} className={'account-short-entry'}>
        {params.data.handle}
        </Link>)
    }catch(error){
      return params.data.handle
    }
}