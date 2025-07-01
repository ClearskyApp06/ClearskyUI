// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';
import { useFeatureFlag } from '../../api/featureFlags';

export default function BlockingPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const blocklistQuery = useBlocklist(did);
  const shouldFetchBlockingCount = useFeatureFlag('blocking-count')
  const totalQuery = useBlocklistCount(did,shouldFetchBlockingCount);
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
