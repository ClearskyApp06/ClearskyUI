// @ts-check
import React from 'react';

import { FaceIcon } from './face-icon';

import './network-circle.css';
import { localise } from '../../../localisation';

/**
 * @param {{
 *  activeAccounts?: number,
 *  deletedAccounts?: number,
 *  totalAccounts?: number,
 *  percentNumberBlocked1?: number,
 *  percentNumberBlocking1?: number,
 *  loading?: boolean
 * }} _
 */
export function NetworkCircle({
  activeAccounts = 5041681,
  deletedAccounts = 358084,
  totalAccounts = 5399765,
  percentNumberBlocked1 = 48.4,
  percentNumberBlocking1 = 42.53,
  loading,
}) {
  return (
    <div className="network-circle">
      <div className="network-circle-circle">
        <SvgCircles
          circles={[
            {
              percent: percentNumberBlocking1,
              caption: localise('blocking someone', { uk: 'блокують когось' }),
              className: 'arc-percentNumberBlocking1',
            },
            {
              percent: percentNumberBlocked1,
              caption: localise('blocked at least by one', {
                uk: 'заблоковані хоч одним',
              }),
              className: 'arc-percentNumberBlocked1',
              outside: true,
            },
          ]}
        />

        <div className="network-crowd network-active-crowd">
          <div className="network-crowd-active-count-container">
            <div className="network-crowd-active-count">
              {activeAccounts.toLocaleString()}
            </div>
            <div className="network-crowd-active-label">
              {localise('active accounts', { uk: 'активних акаунтів' })}
            </div>
          </div>
          {/* 9 faces */}
          <FaceIcon className="crowd-icon" />
          <FaceIcon className="crowd-icon" />
          <FaceIcon className="crowd-icon" />
          <br />
          <FaceIcon className="crowd-icon" />
          <FaceIcon className="crowd-icon" />
          <FaceIcon className="crowd-icon" />
          <FaceIcon className="crowd-icon" />
          <br />
          <FaceIcon className="crowd-icon" />
          <FaceIcon className="crowd-icon" />
        </div>
        <div className="network-crowd network-total-crowd">
          <div className="network-crowd-total-count-container">
            <div className="network-crowd-total-count">
              {totalAccounts.toLocaleString()}
            </div>
            <div className="network-crowd-total-label">
              {localise('total users', { uk: 'всього користувачів' })}
            </div>
          </div>
        </div>
        <div className="network-crowd network-deleted-crowd">
          <div className="network-crowd-deleted-count-container">
            <div className="network-crowd-deleted-count">
              {deletedAccounts.toLocaleString()}
            </div>
            <div className="network-crowd-deleted-label">
              {localise('deleted', { uk: 'закрито' })}
            </div>
          </div>

          <FaceIcon removed className="crowd-icon crowd-icon-deleted" />
        </div>
      </div>
    </div>
  );
}

/**
 * @param {{
 *  className?: string,
 *  circles: {
 *   percent: number,
 *   caption: string,
 *   className?: string,
 *   fill?: string,
 *   outside?: boolean
 *  }[]
 * }} _
 */
function SvgCircles({ className, circles, ...rest }) {
  const expandSize = 19;
  const outsidePathPadding = -15;
  const insidePathPadding = +3;

  /** @type {Array<React.JSX.Element>} */
  const defPaths = [];

  const circleElements = circles.map(
    ({ percent, caption, className, fill, outside }, index) => {
      const startPath = `M ${200 - expandSize},100`;
      const valueRad = (Math.PI * 2 * (100 - percent)) / 100;
      const valueX = Math.cos(valueRad) * (100 - expandSize) + 100;
      const valueY = Math.sin(valueRad) * (100 - expandSize) + 100;
      const largeArc = percent > 50 ? 1 : 0;

      const arcPath = `A ${100 - expandSize}, ${
        100 - expandSize
      } 0 ${largeArc},0 ${valueX.toFixed(4)},${valueY.toFixed(4)}`;

      const expandDirection = outside ? expandSize : -expandSize;

      const expandX =
        Math.cos(valueRad) * (100 - expandSize + expandDirection) + 100;
      const expandY =
        Math.sin(valueRad) * (100 - expandSize + expandDirection) + 100;

      const closeArcPath =
        `L ${expandX.toFixed(4)},${expandY.toFixed(4)} ` +
        `A ${100 - expandSize + expandDirection},${
          100 - expandSize + expandDirection
        } 0 ${largeArc},1 ${200 - expandSize + expandDirection},100`;

      const wholePath = startPath + ' ' + arcPath + ' ' + closeArcPath + ' Z';

      const padding = outside ? outsidePathPadding : insidePathPadding;

      const textArcX =
        Math.cos(valueRad + 0.03) *
          (100 - expandSize + expandDirection + padding) +
        100;
      const textArcY =
        Math.sin(valueRad + 0.04) *
          (100 - expandSize + expandDirection + padding) +
        100;
      const textArc =
        `M ${textArcX.toFixed(4)},${textArcY.toFixed(4)} ` +
        `A ${100 - expandSize + expandDirection + padding}, ${
          100 - expandSize + expandDirection + padding
        } 0 ${largeArc},1 ${200 - expandSize + expandDirection + padding},100`;

      const textArcPathId = 'path' + index;
      defPaths.push(<path key={index} id={textArcPathId} d={textArc} />);
      const percentText = percent.toLocaleString() + '%';

      return (
        <React.Fragment key={index}>
          <path className={className} fill={fill} d={wholePath} />
          <text className={className + '-text'}>
            <textPath
              className="arc-text arc-text-percent"
              href={'#' + textArcPathId}
              xlinkHref={'#' + textArcPathId}
            >
              {percentText}
            </textPath>
            <textPath
              className="arc-text arc-text-caption"
              href={'#' + textArcPathId}
              xlinkHref={'#' + textArcPathId}
              startOffset={percentText.length * 0.93 + 'em'}
            >
              {caption}
            </textPath>
          </text>
        </React.Fragment>
      ); // startOffset='50%' textAnchor='middle'
    }
  );

  return (
    <svg
      className={'arc-text-svg ' + (className || '')}
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...rest}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <defs>{defPaths}</defs>
      {circleElements}
      <circle
        fill="none"
        className="arc-circle"
        cx="100"
        cy="100"
        r={100 - expandSize}
      />
    </svg>
  );
}
