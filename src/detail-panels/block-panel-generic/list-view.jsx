// @ts-check
/// <reference path="../../types.d.ts" />
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { ProgressiveRender } from '../../common-components/progressive-render';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { localise } from '../../localisation';

/**
 * @param {{
 *  blocklist: (BlockedByRecord | { did: string; blocked_date: string })[];
 * }} _
 */
export function ListView({ blocklist }) {
  return (
    <ul className="block-list">
      <ProgressiveRender
        items={blocklist}
        renderItem={(item) => <ListViewEntry {...item} />}
      />
    </ul>
  );
}

/**
 * @param {{
 *  blocked_date: string;
 *  handle?: string;
 *  did?: string;
 *  className?: string;
 * }} _
 */
function ListViewEntry({ blocked_date, handle, did, className, ...rest }) {
  const result = (
    <li {...rest} className={'blocking-list-entry ' + (className || '')}>
      <AccountShortEntry
        className="blocking-account-link"
        withDisplayName
        accountTooltipPanel={
          !blocked_date ? undefined : (
            <div className="account-info-panel-blocked-timestamp">
              {localise('blocked', { uk: 'заблоковано' })}
              <div className="account-info-panel-blocked-timestamp-full">
                {new Date(blocked_date).toString()}
              </div>
            </div>
          )
        }
        account={handle || did}
      >
        <FormatTimestamp
          timestamp={blocked_date}
          noTooltip
          className="blocking-date"
        />
      </AccountShortEntry>
    </li>
  );

  return result;
}
