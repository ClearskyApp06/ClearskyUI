// @ts-check
import { useState, cloneElement } from 'react';
import { Visible } from './visible';
import { GoogleAdSlot } from './google-ad-slot';

const INITIAL_SIZE = 20;
const GROW_BLOCK_SIZE = 29;
const AD_FREQUENCY = 35;

/**
 * @template ItemType
 * @param {{ items: Array<ItemType>, renderItem(item: ItemType): import('react').ReactElement }} props
 * Given a list of items, only renders the first 20 by default,
 * and then more whenever the last item is close to being on screen
 */
export function ProgressiveRender(props) {
  const [listSize, setListSize] = useState(INITIAL_SIZE);
  const showSize = Math.min(props.items.length, listSize);

  return (
    <>
      {props.items.slice(0, showSize).map((item, index) => {
        const entry = cloneElement(props.renderItem(item), { key: index });
        if (index % AD_FREQUENCY === 0 && index > 0) {
          return (
            <GoogleAdSlot
              key={`ad-${index}-prog-9114105783`}
              slot="9114105783"
              format="fluid"
              layoutKey="-fb+5w+4e-db+86"
            />
          );
        }
        return index < showSize - 1 ? (
          entry
        ) : (
          <Visible
            key={index}
            rootMargin="0px 0px 300px 0px"
            onVisible={handleBottomVisible}
          >
            {entry}
          </Visible>
        );
      })}
    </>
  );

  function handleBottomVisible() {
    const incrementListSize = listSize + GROW_BLOCK_SIZE;
    setListSize(incrementListSize);
    if (incrementListSize > props.items.length) {
      // TODO: control fetch more from here?
    }
  }
}
