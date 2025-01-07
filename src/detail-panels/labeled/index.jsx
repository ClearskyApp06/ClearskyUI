// @ts-check

import React, { useMemo } from 'react';


import { useLabeled, useLabelers } from '../../api/labled';
import { useAccountResolver } from '../account-resolver';
import './labeled.css';

/**
 * @param {{
  * ctx: string,
  * value: string
 * }} _
 */
function Labeled({ ctx,value }){
  return (
    <li className='labeled'>
      <span className='labeled-value'>{value}</span>
      <span className='labeled-context'>Labeled On{ctx}</span>
    </li>
  );
}

/**
 * @param {{
  * labels: { ctx: string, value: string,uri:string }[]
  * }} _
  *
  * @returns {JSX.Element}
*/
function LabeledList({labels}) {
  return (
    <ul className='labeled-view'>
      {labels.map((label, i) => (
        <Labeled key={label.uri} ctx={label.ctx} value={label.value} />
      ))}
    </ul>
  );
}

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
  const {data:labelers,isLoading:isLoadingLabelers} = useLabelers();

  const {data:labels,isLoading} = useLabeled(did,labelers);
  //Reduce pages to array of labels
  const flatLabels = useMemo(()  => {
    if(!labels){
      return [];
    }
    if(labels.pages){
      return labels.pages.filter(Boolean).flat();
    }
  },[labels]);
  console.log({labels,labelers,flatLabels})

  const count = 0;
  return (
    <div
      className={'labeled-panel'}
      style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%',
      }}
    >
        <h3 className='labeled-header'>
          Labeled {flatLabels?.length} Times
        </h3>

      {isLoadingLabelers || isLoading ? <div>Loading...</div>:(
        <>
        {flatLabels && flatLabels.length ? (
          <LabeledList labels={flatLabels} />
        ) : (
          <div className='labeled-view no-labels'>No labels</div>
        )}
        </>
      )}
    </div>
  );
}
