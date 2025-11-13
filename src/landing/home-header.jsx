// @ts-check
/// <refererence path="./types.d.ts" />

import React from 'react';
import { SearchAutoComplete } from './search-autocomplete';
import Donate from '../common-components/donate';
import { FirstPartyAd } from '../common-components/first-party-ad';
import { TimeFormatToggle } from '../common-components/time-format-toggle';
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
      <Box sx={{
        mt: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: "flex-start",
        flexDirection: 'row',
        gap: 2,
        flexWrap: 'wrap',
      }}>

        <Donate className="donate-home" />
        <TimeFormatToggle />
        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <FirstPartyAd placementId="227845" size="banner" />
        </Box>
      </Box>


      <Box
        sx={{
          mt: 2,
          display: { xs: 'none', md: 'flex' },
          alignItems: 'start',
          flexDirection: 'column',
          gap: 2,

        }}
      >
        <FirstPartyAd placementId="447632" size="responsiveBanner" />
        <FirstPartyAd placementId="764383" size="responsiveBanner" />
      </Box>

    </div>
  );
}
