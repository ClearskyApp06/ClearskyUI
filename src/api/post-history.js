// @ts-check
/// <reference path="../types.d.ts" />

import { BskyAgent } from '@atproto/api';
import { breakFeedUri, unwrapShortDID } from '.';
import { patchBskyAgent, publicAtClient } from './core';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { usePdsUrl } from './pds';
import { useMemo } from 'react';

/**
 * Fetches the post history for a given DID.
 * 
 * @param {string | undefined | null} did - The DID to fetch post history for. If `did` is `null` or `undefined`, the query will be disabled and no data will be fetched.
 * @returns
 */
export function usePostHistory(did) {
  const fullDid = unwrapShortDID(did);
  const { pdsUrl, status: pdsStatus } = usePdsUrl(fullDid);
  const pdsClient = useMemo(() => {
    if (!pdsUrl) return publicAtClient;
    const client = new BskyAgent({ service: pdsUrl });
    patchBskyAgent(client);
    return client;
  }, [pdsUrl]);
  return useInfiniteQuery({
    enabled: !!fullDid && pdsStatus !== 'pending',
    queryKey: ['post-history', pdsUrl, fullDid],
    queryFn: async ({ pageParam }) =>
      // @ts-expect-error fullDid should never be undefined since the query won't be enabled
      fetchPostHistory(pdsClient, fullDid, pageParam),
    getNextPageParam: (page) => page.cursor,
    /** @type {string | undefined} */
    initialPageParam: undefined,
  });
}

/**
 *
 * @param {BskyAgent} pdsClient
 * @param {string} did
 * @param {string | undefined} cursor
 */
async function fetchPostHistory(pdsClient, did, cursor) {
  const history = await pdsClient.com.atproto.repo.listRecords({
    collection: 'app.bsky.feed.post',
    repo: did,
    cursor,
  });
  const nextCursor = history?.data?.cursor;

  if (history?.data?.records?.length) {
    const records = history.data.records.map((record) => {
      /** @type {PostDetails} */
      const post = {
        uri: record.uri,
        cid: record.cid,
        .../** @type {import('@atproto/api').AppBskyFeedPost.Record} */ (
          record.value
        ),
      };
      queryClient.setQueryData(queryKeyForPost(post.uri), post);
      return post;
    });
    return { records, cursor: nextCursor };
  }

  return { records: [], cursor: nextCursor };
}

/**
 * @typedef {PostDetails & {
 *  leading?: boolean;
 *  replies?: ThreadedPostDetails[];
 *  repliesLoaded?: boolean;
 *  speculativeRepliesBelow?: ThreadedPostDetails[];
 * }} ThreadedPostDetails
 */

/**
 * @param {string} uri
 * @returns {AsyncIterable<ThreadedPostDetails>}
 */
// export async function* getPostThread(uri) {
//   const originalThread = await publicAtClient.app.bsky.feed.getPostThread({
//     uri,
//     depth: 400,
//     parentHeight: 900,
//   });
//   // hm this never yields. seems like this was never fully implemented?
//   console.log(originalThread);
//   return;
// }

/**
 *
 * @param {string} uri
 * @returns {Promise<PostDetails>}
 */
async function fetchPostByUri(uri) {
  const uriEntity = breakFeedUri(uri);
  if (!uriEntity) throw new Error('Invalid post URI: ' + uri);

  const fullDid = unwrapShortDID(uriEntity.shortDID);
  if (!fullDid) {
    throw new Error('Could not find valid DID in URI');
  }

  const postRecord = await publicAtClient.com.atproto.repo.getRecord({
    repo: fullDid,
    collection: 'app.bsky.feed.post',
    rkey: uriEntity.postID,
  });

  return {
    uri: postRecord.data.uri,
    cid: postRecord.data.cid,
    .../** @type {*} */ (postRecord.data.value),
  };
}

const queryKeyForPost = (/** @type {string | null | undefined} */ uri) => [
  'post-by-uri',
  uri,
];

/**
 * @param {string | null | undefined} uri
 */
export function usePostByUri(uri) {
  return useQuery({
    enabled: !!uri,
    queryKey: queryKeyForPost(uri),
    // @ts-expect-error uri will be a string since query is disabled otherwise
    queryFn: () => fetchPostByUri(uri),
  });
}
