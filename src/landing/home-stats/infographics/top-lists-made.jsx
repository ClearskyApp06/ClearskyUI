// @ts-check

/// <reference path="../../../types.d.ts" />

import { TopList } from './top-list';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  listsMade: BlockList | null,
 *  listsMade24: BlockList | null,
 *  limit?: number
 * }} _
 */
export function TopListsMade({ listsMade, listsMade24, limit }) {
  return (
    <TopList
      className="top-lists-made"
      header={(list) =>
        localise(`Top ${list.length || ''} Lists Made`, {
          uk: `Топ ${list.length || ''} створених списків`,
        })
      }
      list={listsMade}
      list24={listsMade24}
      limit={limit}
    />
  );
}
