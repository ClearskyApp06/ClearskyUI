// @ts-check
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { Visible } from '../../common-components/visible';
import { useState } from 'react';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { localise } from '../../localisation';

const INITIAL_SIZE = 20;
const GROW_BLOCK_SIZE = 29;

/**
 * @param {{
 *  blocklist: (BlockedByRecord | { did: string; blocked_date: string } | { did: string; date_added: string } | BlockListSubscriberEntry)[];
 * }} _
 */
export function ListView({ blocklist }) {
  const [listSize, setListSize] = useState(INITIAL_SIZE);
  const showSize = Math.min(blocklist.length, listSize);

  return (
    <ul className="block-list">
      {blocklist.slice(0, showSize).map((block, index) => {
        const entry = <ListViewEntry key={index} {...block} />;
        return index < showSize - 1 ? (
          entry
        ) : (
          <Visible
            key={index}
            rootMargin="0px 0px 300px 0px"
            onVisible={handleBottomVisible}
          >
            {entry}
          </Visible>
        );
      })}
    </ul>
  );

  function handleBottomVisible() {
    const incrementListSize = listSize + GROW_BLOCK_SIZE;
    setListSize(incrementListSize);
    if (incrementListSize > blocklist.length) {
      // TODO: fetch more
    }
  }
}

/**
 * @param {{
 *  blocked_date?: string;
 *  date_added?: string;
 *  handle?: string;
 *  did?: string;
 *  className?: string;
 * }} _
 */
function ListViewEntry({ blocked_date, date_added, handle, did, className, ...rest }) {
  const account = handle || did;
  if (!account) return null;

  const entryDate = blocked_date ? blocked_date : date_added

  const result = (
    <li {...rest} className={'blocking-list-entry ' + (className || '')}>
      <AccountShortEntry
        className="blocking-account-link"
        withDisplayName
        accountTooltipPanel={
          !entryDate ? undefined : (
            <div className="account-info-panel-blocked-timestamp">
              {localise('blocked', { uk: 'заблоковано' })}
              <div className="account-info-panel-blocked-timestamp-full">
                {new Date(entryDate).toString()}
              </div>
            </div>
          )
        }
        account={account}
      >
        {
          entryDate?
            <FormatTimestamp
              timestamp={entryDate}
              noTooltip
              className="blocking-date"
            /> : 
            null
        }

      </AccountShortEntry>
    </li>
  );

  return result;
}
