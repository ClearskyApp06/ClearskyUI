// @ts-check

import React, { useEffect, useState } from 'react';

import { breakFeedUri, getFeedBlobUrl } from '../../../api';
import { getPost } from '../../../api/post-history';

import { RenderPost } from './render-post';
import { forAwait } from '../../../common-components/for-await';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  post: PostDetails | undefined,
 *  embed: PostDetails['embed'],
 *  disableEmbedQT?: Parameters<RenderPost>[0]['disableEmbedQT'],
 *  level?: number
 * }} _
 */
export function PostEmbed({ post, embed, disableEmbedQT, level }) {

  if (!embed || !post) return null;
  if (disableEmbedQT === true) return null;
  if (typeof disableEmbedQT === 'function' && disableEmbedQT(level || 0, post)) return null;

  switch (embed.$type) {
    // @ts-ignore
    case 'app.bsky.embed.record': return <PostEmbedRecord post={post} embed={embed} disableEmbedQT={disableEmbedQT} level={(level || 0) + 1} />;
    // @ts-ignore
    case 'app.bsky.embed.images': return <PostEmbedImages post={post} embed={embed} />;
    // @ts-ignore
    case 'app.bsky.embed.recordWithMedia': return <PostEmbedRecordWithMedia post={post} embed={embed} />;
    // @ts-ignore
    case 'app.bsky.embed.external': return <PostEmbedExternal post={post} embed={embed} />;
    default: return (
      <pre style={{ font: 'inherit', border: 'solid 1px silver', borderRadius: '1em' }}>
        {JSON.stringify(embed, null, 2)}
      </pre>
    );
  }
}

/**
 * @param {{
 *  post: PostDetails,
 *  embed: import('@atproto/api').AppBskyEmbedRecord.Main,
 *  disableEmbedQT?: Parameters<RenderPost>[0]['disableEmbedQT'],
 *  level?: number
 * }} _
 */
function PostEmbedRecord({ embed, disableEmbedQT, level }) {
  const post = forAwait(embed.record.uri, getPost);
  return !post ? 'Loading...' : (
    <div className='post-content-embed'>
      <RenderPost post={post} disableEmbedQT={disableEmbedQT} level={level} className='post-content-embed-qt' />
    </div>
  );
}

/**
 * @param {{
 *  post: PostDetails,
 *  embed: import('@atproto/api').AppBskyEmbedImages.Main
 * }} _
 */
function PostEmbedImages({ post, embed }) {
  if (!embed.images?.length) return null;

  const postUri = breakFeedUri(post.uri);

  if (embed.images.length === 1) {
    return (
      <div className='post-content-embed'>
        <ImageWithAlt
          className='post-content-embed-image-with-alt post-content-embed-image-with-alt-single'
          src={getFeedBlobUrl(postUri?.shortDID, embed.images[0].image.ref + '')}
          imageClassName='post-content-embed-image post-content-embed-image-single'
          altClassName='post-content-embed-image-alt'
          alt={embed.images[0].alt} />
      </div>
    );
  }

  return (
    <div className='post-content-embed'>
      {
        embed.images.map((image, i) =>
          <ImageWithAlt
            key={image.ref + '\n' + i}
            className='post-content-embed-image-with-alt post-content-embed-image-with-alt-multiple'
            src={getFeedBlobUrl(postUri?.shortDID, image.image.ref + '')}
            imageClassName='post-content-embed-image post-content-embed-image-single'
            altClassName='post-content-embed-image-alt'
            alt={image.alt} />)
      }
    </div>
  );
}

function ImageWithAlt({ className, Component = 'span', imageClassName, altClassName, src, alt, ...rest }) {
  const [expanded, setExpanded] = useState(/** @type {boolean | undefined} */(undefined));

  return (
    // @ts-ignore
    <Component {...rest} className={className}>
      <img src={src} className={imageClassName} />
      {
        alt &&
        <div className={altClassName}
          style={expanded ? { height: 'auto' } : undefined}
          onClick={() => setExpanded(!expanded)}>
          {alt}
        </div> || undefined
      }
    </Component>
  );
}

/**
 * @param {{
 *  post: PostDetails,
 *  embed: import('@atproto/api').AppBskyEmbedRecordWithMedia.Main
 * }} _
 */
function PostEmbedRecordWithMedia({ post, embed }) {
  const images = /** @type {import('@atproto/api').AppBskyEmbedImages.Main['images']} */(embed.media?.images);
  const postUri = breakFeedUri(post.uri);
  const embedPost = forAwait(embed.record.record.uri, getPost);
  return (
    <div className='post-content-embed'>
      {
        !images?.length ? null :
          images.length === 1 ?
            <ImageWithAlt
              className='post-content-embed-image-with-alt post-content-embed-image-with-alt-single'
              src={getFeedBlobUrl(postUri?.shortDID, images[0].image.ref + '')}
              imageClassName='post-content-embed-image post-content-embed-image-single'
              altClassName='post-content-embed-image-alt'
              alt={images[0].alt} /> :
            images.map((image, i) =>
              <ImageWithAlt
                key={image.ref + ''}
                className='post-content-embed-image-with-alt post-content-embed-image-with-alt-multiple'
                src={getFeedBlobUrl(postUri?.shortDID, image.image.ref + '')}
                imageClassName='post-content-embed-image post-content-embed-image-single'
                altClassName='post-content-embed-image-alt'
                alt={image.alt} />)
      }
      {
        !embedPost ? localise('Loading...', {uk: 'Зачекайте...'}) :
          <RenderPost post={embedPost} disableEmbedQT className='post-content-embed-qt' />
      }
    </div>
  );
}

/**
 * @param {{
 *  post: PostDetails,
 *  embed: import('@atproto/api').AppBskyEmbedExternal.Main
 * }} _
 */
function PostEmbedExternal({ post, embed }) {
  const postUri = breakFeedUri(post.uri);
  return (
    <div className='post-content-embed'>
      <a className='post-embed-external'
        href={embed.external.uri}
        target='_blank'>
        <div className='post-embed-external-title'>{embed.external.title}</div>
        <div className='post-embed-external-description'>{embed.external.description}</div>
        {
          embed.external.thumb &&
          <img src={getFeedBlobUrl(postUri?.shortDID, embed.external.thumb.ref + '')} className='post-embed-external-thumb' />
        }
      </a>
    </div>
  );
}