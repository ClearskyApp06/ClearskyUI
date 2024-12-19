// @ts-check

import React from 'react';
import { AgGridReact } from '../../common-components/ag-grid';

import { AccountShortEntry } from '../../common-components/account-short-entry';

import './table-view.css';

/** @type {import('ag-grid-community').ColDef[]} */
const columnDefs = [
  {
    field: 'handle',
    cellRenderer: HandleCellRenderer,
  },
  {
    headerName: 'Blocked Date',
    field: 'blocked_date',
  },
];

/**
 * @param {{
 *  account: AccountInfo | { shortHandle: String, loading: true };
 *  blocklist: BlockedByRecord[];
 * }} _
 */
export function TableView({ account, blocklist }) {
  return (
    <AgGridReact
      className="block-panel-table-view"
      rowData={blocklist}
      columnDefs={columnDefs}
    />
  );
}

export function HandleCellRenderer({ value }) {
  return <AccountShortEntry account={value} />;
}
