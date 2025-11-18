// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useSingleBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';
import { useAuth } from '../../context/authContext';
import { useFeatureFlag } from '../../api/featureFlags';

export default function BlockedByPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const blocklistQuery = useSingleBlocklist(did);
  const totalQuery = useSingleBlocklistCount(did);
  const enableBlockActionFeature = useFeatureFlag('restricted-blocked-action');

  const { accountInfo } = useAuth();

  const shortDID = accountInfo?.shortDID;

  return (
    <BlockPanelGeneric
      className="blocked-by-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
      showBlockRelationButton={enableBlockActionFeature && shortDID === did}
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
