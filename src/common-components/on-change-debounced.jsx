// @ts-check

import React, { createContext, useState } from 'react';

/**
 * @param {{
 *  component: any,
 *  delay?: number,
 *  value: string | null | undefined,
 *  onChange?: (e: { target: { value: string | null | undefined } }) => void
 * }} _
 */
export function OnChangeDebounced({
  component: Component,
  delay, value, onChange, ...props
}) {

  const [valueState, setValueState] = useState({
    value: '',
    valueInstant: '',
    timeout: 0
  });

  let valueInstant = typeof value === 'string' ? value : String(value ?? '');

  if (valueState.value !== valueInstant) {
    valueState.valueInstant = valueState.value = valueInstant;
    valueState.timeout = 0;
    clearTimeout(valueState.timeout);
  } else {
    valueInstant = valueState.valueInstant;
  }

  return (
    <Component
      value={valueInstant}
      onChange={handleOnChange}
      {...props} />
  );

  /** @param {{ target: { value: string | null | undefined } }} e */
  function handleOnChange(e) {
    const value = typeof e.target?.value === 'string' ? e.target.value : String(e.target?.value ?? '');

    // second fire of change event on the same value, ignore
    if (value === valueState.valueInstant) return;

    // value changed back before debounce triggered, cancel debounce
    if (value === valueState.value) {
      valueState.valueInstant = value;
      clearTimeout(valueState.timeout);
      valueState.timeout = 0;
      return;
    }

    valueState.valueInstant = value;
    clearTimeout(valueState.timeout);
    valueState.timeout = /** @type {*} */(setTimeout(fireEvent, delay || 500));
    setValueState({ ...valueState });

    function fireEvent() {
      clearTimeout(valueState.timeout);
      valueState.timeout = 0;
      onChange?.(e);
    }
  }
}