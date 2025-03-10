// @ts-check
import React from 'react';
import { useEffect, useRef, useState, useCallback } from 'react';

/** @typedef {{
 *  Component?: React.ElementType,
 *  onVisible?: () => void,
 *  onObscured?: () => void,
 *  rootMargin?: string;
 *  threshold?: number | number[];
 *  children?: React.ReactNode,
 *  className?: string
 * }} VisibleProps */

/**
 * Notifies when it becomes visible or obscured (by scrolling, usually)
 * @param {VisibleProps} _
 */
export function Visible({
  Component = 'div',
  onVisible,
  onObscured,
  rootMargin,
  threshold,
  children,
  ...rest
}) {
  let [visible, setVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting !== visible) {
          setVisible(entry.isIntersecting);
          if (entry.isIntersecting) onVisible?.();
          else onObscured?.();
        }
      },
      {
        rootMargin,
        threshold,
      }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref.current]);

  return (
    <Component ref={ref} {...rest}>
      {children}
    </Component>
  );
}

/**
 * Notifies when it becomes visible, but only after a given delay,
 * and notifications are cancelled if obscured during the delay.
 * @param {VisibleProps & { delayMs: number }} _
 */
export function VisibleWithDelay({
  delayMs,
  onVisible: onVisibleAfterDelay,
  onObscured: onObscuredOriginal,
  ...rest
}) {
  /** @type {React.MutableRefObject<number | undefined>} */
  const nextPageTimeout = useRef();
  useEffect(() => {
    return () => {
      if (nextPageTimeout.current) {
        clearTimeout(nextPageTimeout.current);
      }
    };
  }, []);

  const onVisible = useCallback(() => {
    if (nextPageTimeout.current) return;
    nextPageTimeout.current = setTimeout(() => {
      onVisibleAfterDelay?.();
      nextPageTimeout.current = undefined;
    }, delayMs);
  }, [delayMs, onVisibleAfterDelay]);

  const onObscured = useCallback(() => {
    onObscuredOriginal?.();
    if (nextPageTimeout.current) {
      clearTimeout(nextPageTimeout.current);
      nextPageTimeout.current = undefined;
    }
  }, [onObscuredOriginal]);

  return <Visible {...rest} onVisible={onVisible} onObscured={onObscured} />;
}
