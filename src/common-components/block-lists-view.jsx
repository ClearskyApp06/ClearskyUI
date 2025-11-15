// @ts-check

import { AccountShortEntry } from './account-short-entry';
import { FormatTimestamp } from './format-timestamp';

import './block-lists-view.css';
import { Link } from 'react-router-dom';
import { ConditionalAnchor } from './conditional-anchor';
import { useResolveHandleOrDid } from '../api';
import { VirtualizedList } from './virtualized-list';

/**
 * @param {{
 *  className?: string,
 *  list?: BlockListEntry[],
 *  handle?: string
 * }} _
 */
export function BlockListsView({ className, list, handle }) {
  return (
    <VirtualizedList
      items={list || []}
      renderItem={(entry) => <BlockListsViewEntry entry={entry} handle={handle} />}
      itemHeight={100}
      className={'lists-as-list-view ' + (className || '')}
    />
  );
}

/**
 * @param {{
 *  className?: string,
 *  entry: BlockListEntry
 *  handle?: string
 * }} _
 */
function BlockListsViewEntry({ className, entry, handle }) {
  const resolved = useResolveHandleOrDid(entry.list_owner);

  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className="row">
        <AccountShortEntry
          className="list-owner"
          withDisplayName
          account={entry.list_owner}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className="list-add-date"
        />
      </div>
      {/* <div className='row'  > */}
      <div className="list-name">
        <span className="list-name-text">
          <ConditionalAnchor
            target="__blank"
            style={{ opacity: 1 }}
            href={entry.list_url}
            condition={!resolved.isError && resolved.data}
          >
            {entry.list_name}
          </ConditionalAnchor>
        </span>
      </div>
      {entry.description && (
        <div className="row">
          <span className="list-description">{entry.description}</span>
        </div>
      )}
      {handle && (
        <div className="list-actions">
          <Link
            className="list-subscribers-link"
            to={`./subscribers/${encodeURIComponent(entry.list_url)}`}
          >
            view subscribers
          </Link>
        </div>
      )}
    </li>
  );
}
