// @ts-check
import { useEffect, useRef, useState } from 'react';
import { List } from 'react-window';
import { GoogleAdSlot } from './google-ad-slot';

const AD_FREQUENCY = 35;
const DEFAULT_ITEM_HEIGHT = 80;
const AD_ITEM_HEIGHT = 100;

/**
 * @template ItemType
 * @param {{
 *   items: Array<ItemType>,
 *   renderItem: (item: ItemType, index: number) => import('react').ReactElement,
 *   itemHeight?: number,
 *   overscanCount?: number,
 *   onReachEnd?: () => void,
 *   className?: string,
 *   endAdSlot?: boolean
 * }} props
 */
export function VirtualizedList({
  items,
  renderItem,
  itemHeight = DEFAULT_ITEM_HEIGHT,
  overscanCount = 5,
  onReachEnd,
  className,
  endAdSlot = true,
}) {
  const listRef = useRef(/** @type {import('react-window').ListImperativeAPI | null} */ (null));
  const [containerHeight, setContainerHeight] = useState(600);
  const containerRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  // Calculate container height
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const availableHeight = viewportHeight - rect.top - 20;
        setContainerHeight(Math.max(400, Math.min(availableHeight, 2000)));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Create combined list with ads
  /** @type {Array<{type: 'item', index: number, data: ItemType} | {type: 'ad', adKey: string}>} */
  const itemsWithAds = [];
  for (let i = 0; i < items.length; i++) {
    itemsWithAds.push({ type: 'item', index: i, data: items[i] });
    
    // Insert ad after every AD_FREQUENCY items
    if (i > 0 && (i + 1) % AD_FREQUENCY === 0) {
      itemsWithAds.push({ type: 'ad', adKey: `ad-${i}` });
    }
  }

  // Add end ad if needed
  if (endAdSlot && items.length > 0) {
    itemsWithAds.push({ type: 'ad', adKey: 'ad-end' });
  }

  /**
   * @param {{
   *   index: number,
   *   style: import('react').CSSProperties,
   *   ariaAttributes: {
   *     "aria-posinset": number,
   *     "aria-setsize": number,
   *     role: "listitem"
   *   }
   * }} props
   */
  const RowComponent = ({ index, style, ariaAttributes }) => {
    const item = itemsWithAds[index];

    if (!item) {
      return <div style={style} {...ariaAttributes} />;
    }

    if (item.type === 'ad') {
      return (
        <div style={style} {...ariaAttributes}>
          <GoogleAdSlot
            slot="9114105783"
            format="fluid"
            layoutKey="-fb+5w+4e-db+86"
          />
        </div>
      );
    }

    // Check if we're near the end and trigger callback
    if (onReachEnd && index >= itemsWithAds.length - overscanCount - 1) {
      // Use setTimeout to avoid calling during render
      setTimeout(() => onReachEnd(), 0);
    }

    return (
      <div style={style} {...ariaAttributes}>
        {renderItem(item.data, item.index)}
      </div>
    );
  };

  return (
    <div ref={containerRef} className={className}>
      <List
        listRef={listRef}
        defaultHeight={containerHeight}
        style={{ height: containerHeight }}
        rowCount={itemsWithAds.length}
        rowHeight={itemHeight}
        rowComponent={RowComponent}
        rowProps={{}}
        overscanCount={overscanCount}
      />
    </div>
  );
}
