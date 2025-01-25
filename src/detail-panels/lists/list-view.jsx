// @ts-check

import { CircularProgress } from '@mui/material';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { useListSize } from '../../api/lists';
import './list-view.css';

/**
 * @param {{
 *  className?: string,
 *  list?: AccountListEntry[]
 * }} _
 */
export function ListView({ className, list }) {
  return (
    <ul className={'lists-as-list-view ' + (className || '')}>
      {(list || []).map((entry, i) => (
        <ListViewEntry key={i} entry={entry} style={{}} />
      ))}
    </ul>
  );
}

/**
 * @param {{
 *  className?: string,
 *  entry: AccountListEntry,
 * style:any
 * }} _
 */
export function ListViewEntry({ className, entry, style }) {
  const { data: sizeData, isLoading } = useListSize(entry?.url);
  const count = sizeData?.count || '';

  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className="row">
        <AccountShortEntry
          className="list-owner"
          withDisplayName
          account={entry.did}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className="list-add-date"
        />
      </div>
      <div className="row">
        <span className="list-name">
          <a href={entry.url} target="__blank">
            {entry.name}
          </a>
        </span>
        <span className="list-count">
          {isLoading ? (
            <CircularProgress color="inherit" size="0.75em" />
          ) : (
            count
          )}
        </span>
      </div>
      {entry.description && (
        <div className="row">
          <span className="list-description">{' ' + entry.description}</span>
        </div>
      )}
    </li>
  );
}
