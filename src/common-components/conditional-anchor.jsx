import React from 'react';

/**
 * @param {{
 *  target:string,
 *  href: string,
 *  condition: boolean,
 *  className?: string,
 *  children?: React.ReactNode,
 *  style?: CSSProperties
 * }}
 */
export function ConditionalAnchor(props) {
  const { target, href, condition, className, children, style } = props;
  if (condition) {
    return (
      <a href={href} target={target} className={className} style={style}>
        {children}
      </a>
    );
  } else {
    return <span>{children}</span>;
  }
}
