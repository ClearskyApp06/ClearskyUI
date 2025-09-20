// @ts-check
/// <refererence path="./types.d.ts" />

import React, { useState, useEffect } from 'react';
import { SearchAutoComplete } from './search-autocomplete';
import Donate from '../common-components/donate';
import TrackerBanner from '../common-components/tracker-banner';

/**
 * @param {{
 *  className?: string,
 *  searchText?: string,
 *  onSearchTextChanged?: (text: string) => void,
 *  onAccountSelected?: (account: Partial<AccountInfo & SearchMatch>) => void
 * }} _
 */
export function HomeHeader({ className, searchText, onSearchTextChanged, onAccountSelected }) {
  return (
    <div className={className} style={{ padding: '0 1em' }}>
      <SearchAutoComplete
        searchText={searchText}
        onSearchTextChanged={onSearchTextChanged}
        onAccountSelected={onAccountSelected}
      />
      
      <div className="header-actions">
        <Donate className="donate-home"/>
        <TrackerBanner className="tracker-banner-home"/>
      </div>
    </div>
  );
}
