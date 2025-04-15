// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';

export default function BlockingPanel() {
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
          {localise(
            `Blocking ${
              totalQuery.isLoading ? 'loading...' : count.toLocaleString()
            }`,
            {
              uk: `Блокує ${
                totalQuery.isLoading ? 'loading...' : count.toLocaleString()
              }`,
            }
          )}
        </>
      )}
    />
  );
}
