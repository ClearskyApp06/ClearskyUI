// @ts-check

import { useBlocklist } from '../../api';
import { BlockPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';

/** @param {{ account: AccountInfo | { shortHandle: string; loading: true } }} _ */
export function BlockingPanel({ account }) {
  const did = 'shortDID' in account ? account.shortDID : '';
  const blocklistQuery = useBlocklist(did);
  return (
    <BlockPanelGeneric
      className="blocking-panel"
      blocklistQuery={blocklistQuery}
      account={account}
      header={({ count }) => <>{localise('Blocking', { uk: 'Блокує' })}</>}
    />
  );
}
