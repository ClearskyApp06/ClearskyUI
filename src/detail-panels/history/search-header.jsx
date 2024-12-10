// @ts-check
import React from 'react';

import { TextField } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

import './search-header.css';
import { OnChangeDebounced } from '../../common-components/on-change-debounced';
import { useSearchParams } from 'react-router-dom';

/**
 * @param {Parameters<typeof TextField>[0]} _
 */
export function SearchHeader({ className, label, ...props }) {
  return (
    <div className={'history-header ' + (className || '')}>
      <TextField
        aria-label={typeof label === 'string' ? label : undefined}
        name='q'
        className='history-search-text-field'
        label={
          <>
            <span className='history-search-text-search-icon'><SearchIcon /></span>
            <span className='history-search-text-search-label'>{label}</span>
          </>
        }
        variant='standard'
        {...props}
      />
    </div>
  );
}

/**
 * @param {Parameters<typeof TextField>[0] & { delay?: number, setQ?: boolean | string }} _
 */
export function SearchHeaderDebounced({ value, onChange, delay, setQ, ...props }) {
  const [searchParams, setSearchParams] = useSearchParams();
  return (
    <OnChangeDebounced
      component={SearchHeader}
      value={/** @type {string} */(value ?? (searchParams.get('q') || ''))}
      onChange={e => {
        /** @type {*} */(onChange)?.(e);
        if (setQ) {
          const text = typeof e.target?.value === 'string' ? e.target.value : String(e.target?.value ?? '');
          const q = setQ === true ? 'q' : setQ;
          const params = { ...searchParams };
          if (text) params[q] = text;
          else delete params[q];
          setSearchParams(params);
        }
      }}
      delay={delay}
      {...props}
    />
  );
}
