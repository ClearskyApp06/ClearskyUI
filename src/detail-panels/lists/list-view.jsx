// @ts-check

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
// export function ListView({ className, list }) {
//   return (
//     <ul className={'lists-as-list-view ' + (className || '')}>
//       {(list || []).map((entry, i) => (
//         <ListViewEntry
//           key={i}
//           entry={entry}
//           style={{}}
//            />
//       ))}
//     </ul>
//   );
// }

/**
 * @param {{
 *  className?: string,
 *  entry: AccountListEntry,
 * style:any
 * listcount:number
 * }} _
 */
export function ListViewEntry({ className, entry, style, listcount }) {
  return (
    <li className={'lists-entry ' + (className || '')} style={style}>
      <div className="row">
        <AccountShortEntry
          className="list-owner"
          withDisplayName
          account={entry?.did}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className="list-add-date"
        />
      </div>
      <div className="row">
        {!!entry?.description && (
          <span className="list-count-no-desc">{listcount}</span>
        )}
        <span className="list-name">{entry.name}</span>
        <span className="list-description">
          {!!entry?.description && ' ' + entry?.description}
        </span>
        {!entry.description && (
          <span className="list-count">{' ' + listcount}</span>
        )}
      </div>
    </li>
  );
}


