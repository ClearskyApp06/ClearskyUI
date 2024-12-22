// @ts-check

import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';

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
        <ListViewEntry
          key={i}
          entry={entry} />
      ))}
    </ul>
  );
}

/**
 * @param {{
 *  className?: string,
 *  entry: AccountListEntry
 * }} _
 */
function ListViewEntry({ className, entry }) { 
  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className='row'>
        <AccountShortEntry
          className='list-owner'
          withDisplayName
          account={entry.did}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className='list-add-date' />
      </div>
      <div className='row'>      
        <span className='list-name'>
          <a href={entry.url} target='__blank'>
          {entry.name}
          </a>
        </span>
        <span className='list-description'>
          {entry.description && ' ' + entry.description}
        </span>
      </div>
    </li>
  );
}