// @ts-check

import React, { useMemo } from 'react';


import { useLabeled, useLabelers } from '../../api/labled';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { useAccountResolver } from '../account-resolver';
import './labeled.css';

/**
 * @param {{
  * cts: string,
  * val: string,
  * src: string,
 * }} _
 */
function Labeled({ cts,val,src }){
  return (
    <>
    <li className={'labeled'}>
          <div className='row'>
            <AccountShortEntry
              className='labeler-owner'
              withDisplayName
              account={src}
            />
             <FormatTimestamp
              timestamp={cts}
              noTooltip
              className='labeled-date'
          />
          </div>
          <div>
            <span className='label-name'>
              {val}
            </span>
          </div>
        </li>
    </>
  );
}

/**
 * @param {{
  * labels: { cts: string, val: string,uri:string,src:string }[]
  * }} _
  *
  * @returns {JSX.Element}
*/
function LabeledList({labels}) {
  return (
    <ul className='labeled-view'>
      {labels.map(({src,cts,val}) => (
        <Labeled key={`${src}-$.cts}`} src={src} cts={cts} val={val} />
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
