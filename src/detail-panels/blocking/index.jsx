// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useBlocklistCount, useIsBlocking } from '../../api/blocklist';
import { useAccountResolver } from '../account-resolver';

export default function BlockingPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const blocklistQuery = useBlocklist(did);
  const totalQuery = useBlocklistCount(did);

  // console.log("/blocklist-search-blocking NON WORKING EXAMPLE 'georgetakei', 'bradtakeii'", useIsBlocking('georgetakei', 'bradtakeii').data); // Example usage
  console.log("/blocklist-search-blocking WORKING EXAMPLE 'chiefkeef', 'lovehyphen'", useIsBlocking('chiefkeef', 'lovehyphen').data); // Example usage

  return (
    <BlockPanelGeneric
      className="blocking-panel"
      blocklistQuery={blocklistQuery}
      totalQuery={totalQuery}
      userHandle={accountQuery.data?.shortHandle}
      isBlockingPanel={true}
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
