// @ts-check
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { ProgressiveRender } from '../../common-components/progressive-render';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { localise } from '../../localisation';
import { GoogleAdSlot } from '../../common-components/google-ad-slot';

/**
 * @param {{
 *  blocklist: (BlockedByRecord | { did: string; blocked_date: string } | { did: string; date_added: string } | BlockListSubscriberEntry)[];
 * }} _
 */
export function ListView({ blocklist }) {
  return (
    <ul className="block-list">
      <ProgressiveRender
        items={blocklist}
        renderItem={(item) => <ListViewEntry {...item} />}
      />
      <GoogleAdSlot
        slot="9114105783"
        format="fluid"
        layoutKey="-fb+5w+4e-db+86"
      />
    </ul>
  );
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
function ListViewEntry({
  blocked_date,
  date_added,
  handle,
  did,
  className,
  ...rest
}) {
  const account = handle || did;
  if (!account) return null;

  const entryDate = blocked_date ? blocked_date : date_added;

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
        showBlockRelationButton
      >
        {entryDate ? (
          <FormatTimestamp
            timestamp={entryDate}
            noTooltip
            className="blocking-date"
          />
        ) : null}
      </AccountShortEntry>
    </li>
  );

  return result;
}
