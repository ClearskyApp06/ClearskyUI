// @ts-check

/// <reference path="../../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  blocked: DashboardBlockData | undefined,
 *  blocked24: DashboardBlockData | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlocked({ blocked, blocked24, limit }) {
  return (
    <TopList
      className="top-blocked"
      header={(data) => {
        const count = Object.keys(data).length;
        return localise(`Top ${count} Blocked`, {
          uk: `Топ ${count} заблокованих`,
        });
      }}
      block={blocked}
      block24={blocked24}
      limit={limit}
    />
  );
}
