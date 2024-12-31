// @ts-check

/// <reference path="../../../types.d.ts" />

import React, { useState } from 'react';
import { TopList } from './top-list';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  blockers: DashboardBlockData | undefined,
 *  blockers24: DashboardBlockData | undefined,
 *  limit?: number
 * }} _
 */
export function TopBlockers({ blockers, blockers24, limit }) {
  return (
    <TopList
      className="top-blockers"
      header={(data) => {
        const count = Object.keys(data).length;
        return localise(`Top ${count} Blockers`, {
          uk: `Топ ${count} блок-берсеркерів`,
        });
      }}
      block={blockers}
      block24={blockers24}
      limit={limit}
    />
  );
}
