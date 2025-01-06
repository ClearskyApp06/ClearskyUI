// @ts-check

import React from 'react';


import { useLabeled, useLabelers } from '../../api/labled';
import { useAccountResolver } from '../account-resolver';
import './labeled.css';

/** @typedef {import('@tanstack/react-query').InfiniteData<{ blocklist: (BlockedByRecord | { did: string; blocked_date: string })[]; count?: number }>} InfBlockData */

/**
 * @this {never}
 * @param {{
 *  className?: string,
 *  blocklistQuery: import('@tanstack/react-query').UseInfiniteQueryResult<InfBlockData>,
 *  totalQuery: import('@tanstack/react-query').UseQueryResult<{ count: number }>,
 *  header?: React.ReactNode | ((args: { count: number, blocklist: any[] }) => React.ReactNode)
 * }} _
 */
export default function LabeledPanel({

}) {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const labelers = useLabelers();

  const {data:labels,isLoading} = useLabeled(did);
  console.log({labels})

  const count = 0;
  return (
    <div
      className={'lableded-panel'}
      style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%',
      }}
    >

      {isLoading ? <div>Loading...</div>:(
        <>
        {labels && labels.length ? (
          <>Show Labels Here</>

        ) : (
          <div>No labels</div>
        )}
        </>
      )}
    </div>
  );
}
