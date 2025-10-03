// @ts-check

import { AccountShortEntry } from './account-short-entry';
import { FormatTimestamp } from './format-timestamp';

import './block-lists-view.css';
import { Link } from 'react-router-dom';
import { ConditionalAnchor } from './conditional-anchor';
import { useResolveHandleOrDid } from '../api';
import { GoogleAdSlot } from './google-ad-slot';

const AD_FREQUENCY = 35;

/**
 * @param {{
 *  className?: string,
 *  list?: BlockListEntry[],
 *  handle?: string
 * }} _
 */
export function BlockListsView({ className, list, handle }) {
  return (
    <ul className={'lists-as-list-view ' + (className || '')}>
      {(list || []).flatMap((entry, i) => {
        const elements = [
          <BlockListsViewEntry key={entry.date_added ?? i} entry={entry} handle={handle} />
        ];

        if (i > 0 && i % AD_FREQUENCY === 0) {
          elements.push(
            <GoogleAdSlot
              key={`ad-${i}-blocked-list-9114105783`}
              slot="9114105783"
              format="fluid"
              layoutKey="-fb+5w+4e-db+86"
            />
          );
        }

        return elements;
      })}

      <GoogleAdSlot
        key="ad-end-blocked-list-9114105783"
        slot="9114105783"
        format="fluid"
        layoutKey="-fb+5w+4e-db+86"
      />
    </ul>
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
