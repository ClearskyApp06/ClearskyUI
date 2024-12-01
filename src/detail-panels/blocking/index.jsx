// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useBlocklistCount } from '../../api/blocklist';

/** @param {{ account: AccountInfo | { shortHandle: string; loading: true } }} _ */
export default function BlockingPanel({ account }) {
  const did = 'shortDID' in account ? account.shortDID : '';
  const blocklistQuery = useBlocklist(did);
  const totalQuery = useBlocklistCount(did);
  return (
    <BlockPanelGeneric
      className="blocking-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
      account={account}
      header={({ count }) => (
        <>
          {localise(`Blocking ${count.toLocaleString()}`, {
            uk: `Блокує ${count.toLocaleString()}`,
          })}
        </>
      )}
    />
  );
}
