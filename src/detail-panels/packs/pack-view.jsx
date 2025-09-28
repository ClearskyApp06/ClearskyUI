// @ts-check

import { FormatTimestamp } from '../../common-components/format-timestamp';
import { useResolveDidToProfile } from '../../api/resolve/did-to-profile';
import './list-packs.css';
import { ConditionalAnchor } from '../../common-components/conditional-anchor';
import { GoogleAdSlot } from '../../common-components/google-ad-slot';

const AD_FREQUENCY = 35;

/**
 * @param {{
 *  className?: string,
 *  packs?: PackListEntry[]
 * }}_
 */
export function PackView({ packs = [], className = '' }) {
  return (
    <ul className={`packs-as-pack-view ${className}`}>
      {packs.flatMap((pack, i) => {
        const elements = [<PackViewEntry key={`pack-${pack.did}-${pack.created_date}`} entry={pack} />];

        // Insert ad after every AD_FREQUENCY items
        if (i > 0 && i % AD_FREQUENCY === 0) {
          elements.push(
            <GoogleAdSlot
              key={`ad-${pack.did}-9114105783`}
              slot="9114105783"
              format="fluid"
              layoutKey="-fb+5w+4e-db+86"
            />
          );
        }

        return elements;
      })}

      {/* Ensure a final ad at the end */}
      <GoogleAdSlot
        key="ad-end-9114105783"
        slot="9114105783"
        format="fluid"
        layoutKey="-fb+5w+4e-db+86"
      />
    </ul>
  );



  /**
   * @param {{
   *  className?: string,
   *  entry: PackListEntry
   * }} _
   */
  function PackViewEntry({ className = '', entry }) {
    const originator = useResolveDidToProfile(entry.did);

    return (
      <li className={'pack-entry ' + (className || '')}>
        <div className="row">
          <span className="pack-name">
            <ConditionalAnchor
              condition={!originator.isError && originator.data}
              href={entry.url ?? ''}
              target="__blank"
            >
              <AvatarAndName
                name={entry.name}
                avatarUrl={originator.data?.avatarUrl}
              />
            </ConditionalAnchor>
          </span>
          <FormatTimestamp
            timestamp={entry.created_date ?? ''}
            noTooltip
            className="pack-add-date"
          />
        </div>
        <div className="row">
          <span className="pack-description">
            {entry.description && ' ' + entry.description}
          </span>
        </div>
      </li>
    );
  }
  /**
   * @param {{
   *  avatarUrl?: string,
   *  name: string
   * }} _
   */
  function AvatarAndName({ avatarUrl, name }) {
    return (
      <>
        <span
          className="pack-creator-avatar"
          style={
            !avatarUrl
              ? {
                background: 'none',
                color: 'cornflowerblue',
                textAlign: 'center',
                transform: 'scale(1.5)',
              }
              : {
                backgroundPosition: 'center',
                color: 'transparent',
                borderRadius: '200%',
                backgroundImage: `url(${avatarUrl})`,
                animationDelay: '10s',
              }
          }
        >
          ⓓ
        </span>
        {name}
      </>
    );
  }

  /*

    if (isLoading) {
        return (
          <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
            <CircularProgress size="1.5em" /> 
            <div style={{ marginTop: '0.5em' }}>
              {localise('Loading lists...', { uk: 'Завантаження списків...' })}
            </div>
          </div>
        );
      } 
    return (
        <>
            <div>
                Packs created
            </div>            
        </>

    );
    */
}
