// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useSingleBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';
import { useFeatureFlag } from '../../api/featureFlags';

export default function BlockedByPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const blocklistQuery = useSingleBlocklist(did);
  const shouldFetchBlockedbyCount = useFeatureFlag('blocked-by-count')
  const totalQuery = useSingleBlocklistCount(did, shouldFetchBlockedbyCount);
  return (
    <BlockPanelGeneric
      className="blocked-by-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
      header={({ count }) => (shouldFetchBlockedbyCount ? (<>
        {localise(`Blocked by ${count.toLocaleString()}`, {
          uk: `Блокують ${count.toLocaleString()}`,
          })}
        </>) : null
      )}
    />
  );
}
