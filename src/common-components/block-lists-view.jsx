// @ts-check

import { AccountShortEntry } from './account-short-entry';
import { FormatTimestamp } from './format-timestamp';

import './block-lists-view.css';
import { useNavigate, useParams } from 'react-router-dom'

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
      {(list || []).map((entry, i) => (
        <BlockListsViewEntry
          key={i}
          entry={entry}
          handle={handle} />
      ))}
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
  const navigate = useNavigate();
  const { tab } = useParams();

  const handleClick = () => {
    navigate(`/${handle}/${tab}/subscribers`, { state: entry });
  };
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
      <div className='list-name'>
        <span className='list-name-text'>
          <a href={entry.list_url} target='__blank'>
          {entry.list_name}
          </a>
        </span>
      </div>
      {handle && <div className='list-followers'>
        <span> - </span>
        <span className='list-followers-text' onClick={handleClick}>view subscribers</span>
      </div>}
      {entry.description && <div className='row'>
        <span className='list-description'>
          {' ' + entry.description}
        </span>
      </div>}
    </li>
  );
}