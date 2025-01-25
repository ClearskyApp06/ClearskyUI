// @ts-check

import { AccountShortEntry } from './account-short-entry';
import { FormatTimestamp } from './format-timestamp';

import './block-lists-view.css';

/**
 * @param {{
 *  className?: string,
 *  list?: BlockListEntry[]
 * }} _
 */
export function BlockListsView({ className, list }) {
  return (
    <ul className={'lists-as-list-view ' + (className || '')}>
      {(list || []).map((entry, i) => (
        <BlockListsViewEntry
          key={i}
          entry={entry} />
      ))}
    </ul>
  );
}

/**
 * @param {{
 *  className?: string,
 *  entry: BlockListEntry
 * }} _
 */
function BlockListsViewEntry({ className, entry }) {

  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className='row'>
        <AccountShortEntry
          className='list-owner'
          withDisplayName
          account={entry.list_owner}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className='list-add-date' />
      </div>
      {/* <div className='row'  > */}
      <div>
        <span className='list-name'>
          <a href={entry.list_url} target='__blank'>
          {entry.list_name}
          </a>
        </span>
      </div>
      {entry.description && <div className='row'>
        <span className='list-description'>
          {' ' + entry.description}
        </span>
      </div>}
    </li>
  );
}
