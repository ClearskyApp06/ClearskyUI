// @ts-check
import React from 'react';

import { useNavigate } from 'react-router-dom';
import { unwrapShortHandle } from '../api';
import { HomeHeader } from './home-header';

import './home.css';
import '../donate.css';
import { Logo } from './logo';
import { HomeStats } from './home-stats';
import { About } from './about';
import { Box } from '@mui/material';
import { FirstPartyAd } from '../common-components/first-party-ad';
import { GoogleAdSlot } from '../common-components/google-ad-slot';

export default function Home() {
  const [searchText, setSearchText] = React.useState('');
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <div className={'home ' + (aboutOpen ? 'about-open' : '')}>
      <Logo />
      <About onToggleAbout={() => setAboutOpen(!aboutOpen)} />
      <HomeHeader
        className="home-header"
        searchText={searchText}
        onSearchTextChanged={(searchText) => {
          setSearchText(searchText);
        }}
        onAccountSelected={(account) => {
          if (account.shortHandle) {
            if (account.postID)
              navigate(
                '/' +
                unwrapShortHandle(account.shortHandle) +
                '/history/?q=' +
                account.postID
              );
            else navigate('/' + unwrapShortHandle(account.shortHandle));
          }
        }}
      />

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


      <React.Suspense>
        <HomeStats className="home-stats" />
      </React.Suspense>

      <Box sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '100vw',
        height: '50px',
      }}>

        <GoogleAdSlot slot='4420483623' style={{ height: 50 }} />
      </Box>
    </div>
  );
}
