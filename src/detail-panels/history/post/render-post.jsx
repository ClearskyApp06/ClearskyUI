// @ts-check

import {
  breakFeedUri,
  likelyDID,
  unwrapShortDID,
  unwrapShortHandle,
  useResolveHandleOrDid,
} from '../../../api';
import { usePostByUri } from '../../../api/post-history';

import { Tooltip } from '@mui/material';
import { AccountShortEntry } from '../../../common-components/account-short-entry';
import { FormatTimestamp } from '../../../common-components/format-timestamp';
import { PostContentText } from './post-content-text';
import { PostEmbed } from './post-embed';

import './render-post.css';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  post: PostDetails,
 *  className?: string,
 *  disableEmbedQT?: boolean | ((level: number, post: PostDetails) => boolean),
 *  level?: number,
 *  textHighlights?: string,
 *  textLightHighlights?: string
 * }} _
 */
export function RenderPost({
  post,
  className,
  disableEmbedQT,
  level,
  textHighlights,
  textLightHighlights,
  ...rest
}) {
  const postUri = breakFeedUri(post.uri);
  const account = useResolveHandleOrDid(postUri?.shortDID);

  return (
    <div
      {...rest}
      className={'post-with-content ' + (className || '')}
      onClick={(e) => {
        e.preventDefault();
        // TODO render threads somehow?
        // (async () => {
        //   console.log('clicked post', post);
        //   for await (const p of getPostThread(post.uri)) {
        //     console.log('thread post', p);
        //   }
        // });
      }}
    >
      <h4 className="post-header">
        {!postUri?.shortDID ? (
          <UnknownAccountHeader post={post} />
        ) : (
          <>
            <AccountShortEntry account={postUri?.shortDID} />
            <FormatTimestamp
              className="post-timestamp"
              timestamp={post.createdAt}
              Component="a"
              href={createPostHref(account.data?.shortHandle, postUri?.postID)}
              target="_blank"
              tooltipExtra={
                <div className="post-timestamp-tooltip">
                  <div className="post-timestamp-tooltip-post-uri">
                    {post.uri}
                  </div>
                  {localise('Open in new tab', {
                    uk: 'Відкрити в новій вкладці',
                  })}
                </div>
              }
            />
          </>
        )}
        {!post.reply ? undefined : (
          <>
            <ReplyToLink post={post} className="post-replying-to-marker" />
          </>
        )}
      </h4>
      <PostContentText
        className="post-content"
        highlightClassNameBase="post-content-highlight"
        facets={post.facets}
        textHighlights={textHighlights}
        textLightHighlights={textLightHighlights}
        text={post.text}
      />
      {
        <PostEmbed
          post={post}
          embed={post.embed}
          disableEmbedQT={disableEmbedQT}
          level={(level || 0) + 1}
        />
      }
    </div>
  );
}

/**
 * @param {{
 *  post: PostDetails,
 * }} _
 */
function UnknownAccountHeader({ post }) {
  const postUri = breakFeedUri(/** @type {string} */ (post.uri));
  return (
    localise('Unknown account ', { uk: 'Невідомий акаунт ' }) +
    (postUri?.shortDID || post.uri)
  );
}

/**
 * @param {{
 *  post: PostDetails,
 *  className?: string
 * }} _
 */
function ReplyToLink({ post, ...rest }) {
  const replyUri = breakFeedUri(post.reply?.parent?.uri);
  const rootUri = breakFeedUri(post.reply?.root?.uri);

  const replyAccount = useResolveHandleOrDid(replyUri?.shortDID);
  const rootAccount = useResolveHandleOrDid(rootUri?.shortDID);

  if (!post.reply) return undefined;

  return (
    <span {...rest}>
      {!replyUri ? undefined : (
        <>
          <span className="post-replying-to-marker-text">&lsaquo;</span>
          <Tooltip
            title={<RenderPostInTooltip postUri={post.reply?.parent?.uri} />}
          >
            <a
              href={createPostHref(
                replyAccount.data?.shortHandle,
                replyUri?.postID
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MiniAvatar
                className="post-replying-to-resolved"
                account={replyAccount.data}
              />
            </a>
          </Tooltip>
        </>
      )}
      {!replyUri || rootUri?.shortDID === replyUri?.shortDID ? undefined : (
        <>
          <span className="post-replying-to-marker-text">&lsaquo;</span>
          <Tooltip
            title={<RenderPostInTooltip postUri={post.reply?.root?.uri} />}
          >
            <a
              href={createPostHref(
                rootAccount.data?.shortHandle,
                rootUri?.postID
              )}
              target="_blank"
              rel="noreferrer"
            >
              <MiniAvatar
                className="post-replying-to-resolved post-replying-to-root"
                account={rootAccount?.data}
              />
            </a>
          </Tooltip>
        </>
      )}
    </span>
  );
}

/**
 * @param {{
 *  postUri: string | null | undefined
 * }} _
 */
function RenderPostInTooltip({ postUri }) {
  const { data } = usePostByUri(postUri);
  if (!data) return null;
  return (
    <RenderPost post={data} disableEmbedQT className="post-content-embed-qt" />
  );
}

/**
 * @param {{
 *  account: AccountInfo | null | undefined,
 *  className?: string
 * }} _
 */
function MiniAvatar({ account, className, ...rest }) {
  return (
    <span
      className={'post-replying-mini-avatar ' + (className || '')}
      style={
        !account?.avatarUrl
          ? undefined
          : { backgroundImage: `url(${account?.avatarUrl})` }
      }
      {...rest}
    >
      {account?.displayName}
    </span>
  );
}

/**
 * @param {string | null | undefined } handleOrDID
 * @param {string | null | undefined} postID
 */
function createPostHref(handleOrDID, postID) {
  if (!handleOrDID || !postID) return;
  const identifier = likelyDID(handleOrDID)
    ? unwrapShortDID(handleOrDID)
    : unwrapShortHandle(handleOrDID);
  return `https://bsky.app/profile/${identifier}/post/${postID}`;
}
