// @ts-check

import { useMemo } from 'react';

import { useLabeled, useLabelers } from '../../api/labled';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { useAccountResolver } from '../account-resolver';
import './labeled.css';
import { GoogleAdSlot } from '../../common-components/google-ad-slot';

/**
 * @param {{
 * cts: string,
 * val: string,
 * src: string,
 * }} _
 */
function LabeledListItem({ cts, val, src }) {
  const value = useMemo(() => {
    let v = val;
    //https://docs.bsky.app/docs/advanced-guides/moderation#global-label-values
    if (val.startsWith('!')) {
      switch (val) {
        case '!hide':
          return 'Hidden';
        case '!warn':
          return 'Warning';
        case '!no-unauthenticated':
          return 'Private Account';
        default:
          //This should never happen.
          v = val.slice(1, 2).toUpperCase() + val.slice(2);
          break; //intenitionally not returning yet.
      }
    }

    //has a  - in it?
    if (v.includes('-')) {
      //split, uppercase first letter of each word, join with space
      v = v
        .split('-')
        .map((s) => s.slice(0, 1).toUpperCase() + s.slice(1))
        .join(' ');
    } else {
      v = v.slice(0, 1).toUpperCase() + v.slice(1);
    }
    return v;
  }, [val]);
  return (
    <>
      <li className={'labeled'}>
        <div className="row">
          <AccountShortEntry
            className="labeler-owner"
            withDisplayName
            account={src}
          />
          <FormatTimestamp timestamp={cts} noTooltip className="labeled-date" />
        </div>
        <div>
          <span className="label-name">{value}</span>
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
function LabeledList({ labels }) {
  return (
    <ul className="labeled-view">
      {labels.map(({ src, cts, val }, i) => {
        if (i % 10 === 0 && i > 0) {
          return (
            <GoogleAdSlot
              key={`ad-${i}-9114105783`}
              slot="9114105783"
              format="fluid"
              layoutKey="-fb+5w+4e-db+86"
            />
          );
        }
        return (
          <LabeledListItem
            key={`${src}-${val}-${cts}`}
            src={src}
            cts={cts}
            val={val}
          />
        );
      })}
      <GoogleAdSlot
        slot="9114105783"
        format="fluid"
        layoutKey="-fb+5w+4e-db+86"
      />
    </ul>
  );
}

/**
 * @this {never}
 */
export default function LabeledPanel() {
  const accountQuery = useAccountResolver();
  const did = accountQuery.data?.shortDID;
  const { data: labelers, isLoading: isLoadingLabelers } = useLabelers();

  const { data: labels, isLoading } = useLabeled(did, labelers);

  return (
    <div
      className={'labeled-panel'}
      style={{
        backgroundColor: '#fefafa',
        backgroundImage: 'linear-gradient(to bottom, white, transparent 2em)',
        minHeight: '100%',
      }}
    >
      <h3 className="labeled-header">Labeled {labels?.length} Times</h3>

      {isLoadingLabelers || isLoading ? (
        <div>Loading...</div>
      ) : (
        <>
          {labels?.length ? (
            <LabeledList labels={labels} />
          ) : (
            <div className="labeled-view no-labels">
              <div>No labels</div>
              <GoogleAdSlot
                slot="9114105783"
                format="fluid"
                layoutKey="-fb+5w+4e-db+86"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
