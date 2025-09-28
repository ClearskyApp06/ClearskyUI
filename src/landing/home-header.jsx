// @ts-check
/// <refererence path="./types.d.ts" />

import React from 'react';
import { SearchAutoComplete } from './search-autocomplete';
import Donate from '../common-components/donate';
import { FirstPartyAd } from '../common-components/first-party-ad';
import { Box } from '@mui/material';

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
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'start', justifyContent: "flex-start", flexDirection: 'row', gap: 2 }}>

        <Donate className="donate-home" />
        <Box sx={{ display: { xs: 'bloack', md: 'none' } }}>
          <FirstPartyAd placementId="227845" size="banner" />
        </Box>
      </Box>
    </div>
  );
}
