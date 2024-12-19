// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useSingleBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';

export default function BlockedByPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const blocklistQuery = useSingleBlocklist(did);
  const totalQuery = useSingleBlocklistCount(did);
  return (
    <BlockPanelGeneric
      className="blocked-by-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
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
