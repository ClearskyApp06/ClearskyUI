// @ts-check
import React from 'react';

import { useNavigate } from 'react-router-dom';
import { unwrapShortHandle } from '../api';
import { HomeHeader } from './home-header';

import './home.css';
import { Logo } from './logo';
import { HomeStats } from './home-stats';
import { About } from './about';
import Donate from '../common-components/Donate';

export function Home() {
  const [searchText, setSearchText] = React.useState('');
  const [aboutOpen, setAboutOpen] = React.useState(false);
  const navigate = useNavigate();

  return (
    <div className={'home ' + (aboutOpen ? 'about-open' : '')}>
      <Logo />
      <Donate/>
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
    </div>
  );
}
