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
import { Box, Grid } from '@mui/material';
import { GoogleAdSlot } from '../common-components/google-ad-slot';
import { useFeatureFlag } from '../api/featureFlags';

export default function Home() {
  const [searchText, setSearchText] = React.useState('');
  const navigate = useNavigate();
  const googleAdFooterSlot = '3279981713'
  const showGoogleAds = useFeatureFlag('google-ads');
  const showFooterAd = useFeatureFlag(`google-ad-${googleAdFooterSlot}`);
  const showAd = showGoogleAds && showFooterAd;

  return (
    <Grid
      container
      className='home'
      sx={{
        height: showAd ? 'calc(100dvh - 80px)' : 'calc(100dvh - 30px)'
      }}>

      <Grid
        item
        xs={12}
        md={6}
        sx={{
          position: 'relative',
          paddingTop: { xs: 0, md: '30px' },
        }}
        alignContent={'start'}
      >
        <About />
        <Box>
          <Logo />
          <HomeHeader
            className='home-header'
            searchText={searchText}
            onSearchTextChanged={setSearchText}
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
        </Box>
      </Grid>

      <Grid alignContent={'center'} item xs={12} md={6} sx={{ height: '100%' }}>
        <React.Suspense>
          <HomeStats className='home-stats' />
        </React.Suspense>
      </Grid>

      <Box sx={{ position: 'fixed', bottom: 30, left: 0, width: '100%', maxHeight: '50px' }}>
        <GoogleAdSlot slot={googleAdFooterSlot} style={{ maxHeight: 50 }} />
      </Box>

    </Grid>
  );
}
