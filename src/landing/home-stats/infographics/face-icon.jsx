// @ts-check

/// <reference path="../../../types.d.ts" />

import React from 'react';

import {
  AccountCircle,
  Face, Face2, Face3, Face4, Face5, Face6,
  //FaceOutlined, Face2Outlined, Face3Outlined, Face4Outlined, Face6Outlined,
  //FaceTwoTone, Face2TwoTone, Face3TwoTone, Face4TwoTone, Face6TwoTone,
  SentimentDissatisfied, SentimentNeutral, SentimentSatisfied, SentimentSatisfiedAlt, SentimentVerySatisfied,
  AccountCircleOutlined
} from '@mui/icons-material';

import { FaceSvg } from './face-svg';
import { calcHash, nextRandom } from '../../../api/core';

const FaceIcons = [
  AccountCircle,
  Face, Face2, Face3, Face4, Face4, Face5, Face6, FaceSvg, FaceSvg,
  //FaceOutlined, Face2Outlined, Face3Outlined, Face4Outlined, Face6Outlined,
  //FaceTwoTone, Face2TwoTone, Face3TwoTone, Face4TwoTone, Face6TwoTone,
  SentimentNeutral, SentimentSatisfied, SentimentSatisfiedAlt, SentimentVerySatisfied
];

const RemovedIcon = AccountCircleOutlined;

const UPDATE_INTERVAL_MSEC = 10000;

/**
 * @typedef {{
 *  rnd?: number | string,
 *  removed?: boolean,
 *  className?: string,
 *  style?: import('react').CSSProperties
 * }} Props
 */

/**
 * @extends React.Component<Props, {
 *  currentIcon: number,
 *  prevIcon: number,
 *  rnd: number
 * }>
 */
export class FaceIcon extends React.Component {
  /** @type {*} */
  timeout = 0;

  componentWillUnmount() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.timeout = 0;
    }
  }

  render() {
    const { rnd, removed, style, ...rest } = this.props;
    if (this.props.removed) {
      return (
        <RemovedIcon style={style} {...rest} />
      );
    }

    if (!this.state) {
      const useRnd = rnd ? nextRandom(calcHash(rnd)) : Math.random();
      this.state = {
        currentIcon: 0,
        prevIcon: 0,
        rnd: rnd ? useRnd : 0
      };

      this.timeout = setTimeout(this.nextIcon, UPDATE_INTERVAL_MSEC / 2 + UPDATE_INTERVAL_MSEC * useRnd);
    }

    /** @type {*} */
    const CurrentIcon = FaceIcons[this.state.currentIcon];
    /** @type {*} */
    const PrevIcon = FaceIcons[this.state.prevIcon];

    return (
      <span style={{ position: 'relative' }}>
        <PrevIcon
          key={this.state.prevIcon === this.state.currentIcon ? this.state.currentIcon - 1 : this.state.prevIcon}
          {...rest}
          style={{ ...style, transition: 'opacity 300ms', opacity: 0, position: 'absolute', zIndex: 1 }} />
        <CurrentIcon
          key={this.state.currentIcon}
          {...rest}
          style={{ ...style, transition: 'opacity 300ms' }} />
      </span>
    );
  }

  nextIcon = () => {
    const useRnd = this.state.rnd ? nextRandom(calcHash(this.state.rnd)) : Math.random();
    let nextIcon = Math.floor(useRnd * (FaceIcons.length - 1));
    if (nextIcon >= this.state.currentIcon) nextIcon++;

    this.setState({
      prevIcon: this.state.currentIcon,
      currentIcon: nextIcon,
      rnd: this.state.rnd ? useRnd : 0
    });

    this.timeout = setTimeout(this.nextIcon, UPDATE_INTERVAL_MSEC / 2 + UPDATE_INTERVAL_MSEC * useRnd);
  };
}
