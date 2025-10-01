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


      <React.Suspense>
        <HomeStats className="home-stats" />
      </React.Suspense>

      <Box sx={{
        position: { xs: 'fixed', sm: 'fixed' },
        bottom: 30,
        left: 0,
        width: '100%',
        height: '50px',
      }}>

        <GoogleAdSlot slot='4420483623' style={{ height: 50 }} />
      </Box>
    </div>
  );
}
