// @ts-check

/// <reference path="../../../types.d.ts" />

import { TopList } from './top-list';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  listsOn: BlockList | null,
 *  listsOn24: BlockList | null,
 *  limit?: number
 * }} _
 */
export function TopListsOn({ listsOn, listsOn24, limit }) {
  return (
    <TopList
      className="top-lists-on"
      header={(list) =>
        localise(`Top ${list.length || ''} Lists On`, {
          uk: `Топ ${list.length || ''} у списках`,
        })
      }
      list={listsOn}
      list24={listsOn24}
      limit={limit}
      show24hToggle={false}
    />
  );
}
