// @ts-check

import React from 'react';
import './face-svg.css';

/**
 *
 * @param {React.SVGProps<SVGSVGElement>} _
 * @returns
 */
export function FaceSvg({ className, ...props }) {
  return (
    <svg
      {...props}
      className={
        'MuiSvgIcon-root MuiSvgIcon-fontSizeMedium MuiBox-root SvgIcon-FaceSvg ' +
        (className || '')
      }
      viewBox="0 0 24 24"
      data-testid="FaceSvg"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M 12 2 C 6.48 2 2 6.48 2 12 C 2 17.52 6.48 22 12 22 C 17.52 22 22 17.52 22 12 C 22 6.48 17.52 2 12 2 Z M 12 20 C 7.59 20 4 16.41 4 12 L 4 11.97 C 6.31 11.75 4.112 9.608 5.577 8.196 C 6.094 7.697 8.453 7.785 9.24 8 C 11.753 8.418 12.676 8.377 14.77 8 C 15.696 7.851 17.871 7.747 18.455 8.434 C 19.757 9.968 17.65 11.74 20 11.96 L 20 11.99 C 20 16.41 16.41 20 12 20 Z"></path>
      <circle cx="9" cy="13" r="1.25"></circle>
      <circle cx="15" cy="13" r="1.25"></circle>
      <path d="M 2.332 13.448 C 0.748 11.017 0.542 8.436 0.894 6.5 C 1.653 2.322 5.209 0.037 8.786 0.003 C 8.974 0.001 13.902 -0.009 15.233 0.032 C 19.47 0.162 22.604 2.452 23.338 6.682 C 23.607 8.229 23.437 11.04 21.684 12.901 C 21.201 7.931 11.075 -0.592 2.729 10.702"></path>
    </svg>
  );
}
