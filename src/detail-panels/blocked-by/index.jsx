// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useSingleBlocklistCount } from '../../api/blocklist';

/** @param {{ account: AccountInfo | { shortHandle: string; loading: true } }} _ */
export default function BlockedByPanel({ account }) {
  const did = 'shortDID' in account ? account.shortDID : '';
  const blocklistQuery = useSingleBlocklist(did);
  const totalQuery = useSingleBlocklistCount(did);
  return (
    <BlockPanelGeneric
      className="blocked-by-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
      account={account}
      header={({ count }) => (
        <>
          {localise(`Blocked by ${count.toLocaleString()}`, {
            uk: `Блокують ${count.toLocaleString()}`,
          })}
        </>
      )}
    />
  );
}
