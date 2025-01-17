/**
 * @param {LegacyBlockData[] | BlockData[]} data
 * @returns {data is LegacyBlockData[]}
 */
function isLegacyBlockData(data) {
  return 'block_count' in data[0];
}

/**
 * TODO: remove when legacy blocklist data migration is complete
 * @param {LegacyBlockData[] | BlockData[] | null} listData
 * @returns {DashboardBlockListEntry[]}
 */
export function migrateOldBlocklistData(listData) {
  if (!listData) return [];
  if (isLegacyBlockData(listData)) {
    return listData.map((item) => ({
      did: item.did,
      count: item.block_count,
    }));
  } else {
    return listData;
  }
}
