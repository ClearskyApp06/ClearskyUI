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
export function ProgressiveRender({ items, renderItem }) {
  const [listSize, setListSize] = useState(INITIAL_SIZE);
  const showSize = Math.min(items.length, listSize);

  const elements = items.slice(0, showSize).flatMap((item, index) => {
    const entryElement = renderItem(item);
    const keyBase = entryElement.key ?? index;

    const result = [
      cloneElement(entryElement, { key: keyBase })
    ];

    // Insert ad after every AD_FREQUENCY items
    if (index > 0 && index % AD_FREQUENCY === 0) {
      result.push(
        <GoogleAdSlot
          key={`ad-${index}-prog-9114105783`}
          slot="9114105783"
          format="fluid"
          layoutKey="-fb+5w+4e-db+86"
        />
      );
    }

    // If this is the last item in the slice, wrap in Visible
    if (index === showSize - 1) {
      return (
        <Visible
          key={`visible-${keyBase}`}
          rootMargin="0px 0px 300px 0px"
          onVisible={() => setListSize(listSize + GROW_BLOCK_SIZE)}
        >
          {result}
        </Visible>
      );
    }

    return result;
  });

  return <>{elements}</>;
}
