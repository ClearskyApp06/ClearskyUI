// @ts-check

/// <reference path="../../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  blocked: DashboardBlockListEntry[] | undefined,
 *  blocked24: DashboardBlockListEntry[] | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlocked({ blocked, blocked24, limit }) {
  return (
    <TopList
      className='top-blocked'
      header={(list) =>
        localise(`Top ${list.length || ''} Blocked`,
          { uk: `Топ ${list.length || ''} заблокованих` })}
      list={blocked}
      list24={blocked24}
      limit={limit} />
  );
}