// @ts-check

import { useSingleBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';

/** @param {{ account: AccountInfo | { shortHandle: string; loading: true } }} _ */
export function BlockedByPanel({ account }) {
  const did = 'shortDID' in account ? account.shortDID : '';
  const blocklistQuery = useSingleBlocklist(did);
  return (
    <BlockPanelGeneric
      className="blocked-by-panel"
      blocklistQuery={blocklistQuery}
      account={account}
      header={({ count }) => <>{localise('Blocked by', { uk: 'Блокують' })}</>}
    />
  );
}
