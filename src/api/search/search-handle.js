// @ts-check

import {
  breakFeedUri,
  breakPostURL,
  resolveHandleOrDID,
  shortenDID,
  shortenHandle,
} from '..';

/**
 * @typedef {{ [shortDID: string]: CompactHandleOrHandleDisplayName }} IndexedBucket
 */

/** @type {{ [searchText: string]: SearchMatch[] }}*/
const cachedSearches = {};

/**
 * @param {string} searchText
 * @return {Promise<SearchMatch[]>}
 */
export async function searchHandle(searchText) {
  if (cachedSearches[searchText]) return cachedSearches[searchText];

  const directResolvesOrPromises = searchText
    .split(/\s+/)
    .filter((word) => !!word)
    .map(async (word) => {
      const postLink = breakPostURL(word) || breakFeedUri(word);
      if (postLink) {
        let authorAccount = await resolveHandleOrDID(postLink.shortDID);
        if (!authorAccount) return null;
        return expandResolvedAccountToSearchMatch(
          word,
          authorAccount,
          postLink.postID
        );
      }

      let account = await resolveHandleOrDID(word);
      if (!account) return null;
      return expandResolvedAccountToSearchMatch(word, account);
    });

  const wordStarts = [
    ...new Set([
      ...searchText.split(/\s+/g).filter((chunk) => chunk.length >= 3),
      searchText,
    ]),
  ];
  if (!wordStarts.length) return [];

  const wordPublicSearchPromises = wordStarts.map((w) =>
    fetch(
      'https://public.api.bsky.app/xrpc/app.bsky.actor.searchActorsTypeahead?term=' +
        encodeURIComponent(w)
    )
      .then((x) => x.json())
      .catch((x) => {})
  );

  // const bucketsOrPromises = wordStarts.map(wordStart => getBucket(wordStart));
  // const allStaticallyResolved =
  //   !directResolvesOrPromises.some(accountOrPromise => isPromise(accountOrPromise)) &&
  //   !bucketsOrPromises.some(bucket => isPromise(bucket));
  //
  // if (allStaticallyResolved) {
  //   let searchMatches = performSearchOverBuckets(
  //     searchText,
  //     /** @type {IndexedBucket[]} */(bucketsOrPromises));
  //
  //   const exactMatches = /** @type {(SearchMatch & AccountInfo)[]} */(directResolvesOrPromises);
  //
  //   searchMatches = combineAndLimit(exactMatches, searchMatches);
  //
  //   cachedSearches[searchText] = searchMatches;
  //   return searchMatches;
  // }

  const wordPublicSearches = await Promise.all(wordPublicSearchPromises);

  // const buckets = await Promise.all(bucketsOrPromises);
  const directResolves = (await Promise.all(directResolvesOrPromises)).filter(
    Boolean
  );
  let searchMatches = []; // Part of hack to get rid of coldsky
  for (let searchWordResult of wordPublicSearches) {
    if (searchWordResult?.actors?.length) {
      for (const ac of searchWordResult.actors) {
        searchMatches.push({
          ...ac,
          shortDID: shortenDID(ac.did),
          shortHandle: shortenHandle(ac.handle),
        });
      }
    }
  }

  const exactMatches = /** @type {(SearchMatch & AccountInfo)[]} */ (
    directResolves
  );
  searchMatches = combineAndLimit(exactMatches, searchMatches);

  cachedSearches[searchText] = searchMatches;
  return searchMatches;
}

var wordStartRegExp = /[A-Z]*[a-z]*/g;
/**
 * @param {string} str
 * @param {number=} count
 * @param {string[]=} wordStarts
 */
function getWordStartsLowerCase(str, count, wordStarts) {
  if (typeof count !== 'number' || !Number.isFinite(count)) count = 3;
  if (!wordStarts) wordStarts = [];
  str.replace(wordStartRegExp, function (match) {
    const wordStart = match && match.slice(0, count).toLowerCase();
    if (
      wordStart &&
      wordStart.length === count &&
      /** @type {string[]} */ (wordStarts).indexOf(wordStart) < 0
    )
      /** @type {string[]} */ (wordStarts).push(wordStart);
    return match;
  });
  return wordStarts;
}

/**
 * @param {SearchMatch[]} exactMatches
 * @param {SearchMatch[]} searchMatches
 */
function combineAndLimit(exactMatches, searchMatches) {
  const result = [];
  const resultShortDIDs = new Set();
  for (const ex of exactMatches) {
    if (resultShortDIDs.has(ex.shortDID)) continue;
    result.push(ex);
    resultShortDIDs.add(ex.shortDID);
  }
  for (const sm of searchMatches) {
    if (resultShortDIDs.has(sm.shortDID)) continue;
    result.push(sm);
    resultShortDIDs.add(sm.shortDID);
  }

  return result.slice(0, 60);
}

// /** @type {{ [threeLetterPrefix: string]: Promise<IndexedBucket> | IndexedBucket }} */
// const buckets = {};
//
// /**
//  * @param {string} threeLetterPrefix
//  * @returns {Promise<IndexedBucket> | IndexedBucket}
//  */
// function getBucket(threeLetterPrefix) {
//   if (buckets[threeLetterPrefix]) return buckets[threeLetterPrefix];
//
//
//   return buckets[threeLetterPrefix] = (async () => {
//     const bucketPath =
//       'https://accounts.colds.ky/' +
//       threeLetterPrefix[0] + '/' +
//       threeLetterPrefix.slice(0, 2) + '/' +
//       threeLetterPrefix.slice(1) + '.json';
//
//     const bucket = await fetch(bucketPath)
//       .then(r => r.json())
//       .catch(err => {
//         console.warn(
//           'Failed to fetch bucket for ' + threeLetterPrefix,
//           err);
//       });
//
//     return bucket;
//   })();
// }

/**
 *
 * @param {string} handleOrDID
 * @param {AccountInfo | undefined} account
 * @param {string | undefined} [postID]
 * @returns {SearchMatch & AccountInfo | undefined}
 */
function expandResolvedAccountToSearchMatch(handleOrDID, account, postID) {
  return (
    account && {
      ...account,
      rank: 2000,
      shortDIDMatches:
        shortenDID(handleOrDID) === account.shortDID
          ? account.shortDID
          : undefined,
      shortHandleMatches:
        shortenHandle(handleOrDID) === account.shortHandle
          ? account.shortHandle
          : undefined,
      displayNameMatches: undefined,
      postID,
    }
  );
}
