// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useSingleBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';
import InfoTooltip from '../../common-components/info-tool-tip';

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
          <div style={{ fontWeight: '400', paddingBottom: '0.2em' }}>
            <InfoTooltip text="below list shows panel members that have blocked you" />
          </div>
          {localise(`Blocked by ${count.toLocaleString()}`, {
            uk: `Блокують ${count.toLocaleString()}`,
          })}
        </>
      )}
    />
  );
}
