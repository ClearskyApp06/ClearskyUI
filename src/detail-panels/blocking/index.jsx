// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useBlocklistCount } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';
import InfoTooltip from '../../common-components/info-tool-tip';

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
          <div style={{ fontWeight: '400', paddingBottom: '0.2em' }}>
            <InfoTooltip text="this page shows panel member you have blocked" />
          </div>
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
