// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';

export function BlockingPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const blocklistQuery = useBlocklist(did);
  const totalQuery = useBlocklistCount(did);
  return (
    <BlockPanelGeneric
      className="blocking-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
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
