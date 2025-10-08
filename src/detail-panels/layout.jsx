// @ts-check

import React, { useEffect, useRef, useState } from 'react';
import { Outlet, Await, Link, useMatch } from 'react-router-dom';

import { AccountHeader } from './account-header';
import './layout.css';
import '../donate.css';
import Donate from '../common-components/donate';
import { Box, Fade, useTheme, keyframes, Tab, Tabs, useMediaQuery } from '@mui/material';
import { activeTabRoutesPromise } from './tabs';
import { useAccountResolver } from './account-resolver';
import { useSpamStatus } from '../api/spam-status';
import { useFeatureFlag } from '../api/featureFlags';
import { ProfileSpamBanner } from './profile/profile-spam-banner';
import { GoogleAdSlot } from '../common-components/google-ad-slot';

/**
 *
 * @returns
 */
export function AccountLayout() {
  const resolved = useAccountResolver();

  const spamQuery = useSpamStatus(resolved.data?.shortDID);
  const spamFeature = useFeatureFlag('spam-profile-overlay');
  const isSpam = spamFeature && spamQuery.data?.spam;
  const spamSource = spamQuery.data?.spam_source;

  return (
    <div className="layout">
      <div className="ad-lane">
        <GoogleAdSlot slot="4524958237" style={{ height: '100%' }} />
      </div>
      <div className="main-content">
        <Donate />
        <div className="detail-container">
          <AccountHeader className="account-header" />
          <div className="account-tabs-container">
            {isSpam && <ProfileSpamBanner spamSource={spamSource} />}

            <TabSelector className="account-tabs-handles" />
          </div>
          <div className="account-tabs-content">
            <div className="account-tab account-tab-selected">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
      <div className="ad-lane">
        <GoogleAdSlot slot="4420483623" style={{ height: '100%' }} />
      </div>
    </div>
  );
}

/**
 * @param {{ className: string }} param0
 */
export function TabSelector({ className }) {
  const matches = useMatch('/:account/:tab/*');
  const tab = matches?.params.tab;
  /** @type {React.RefObject<HTMLDivElement>} */
  const tabsRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  /** @type {React.MutableRefObject<ReturnType<typeof setTimeout> | null>} */
  const scrollTimeout = useRef(null);

  const [showSwipeHint, setShowSwipeHint] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));


  // Shadow swipe animation
  const shadowSwipe = isMobile ?
    keyframes`
    0% { transform: translateX(90dvw); opacity: .3; }
    100% { transform: translateX(20dvw); opacity: 0; }
  `:
    keyframes`
    0% { transform: translateX(600px); opacity: .3; }
    100% { transform: translateX(300px); opacity: 0; }
  `;

  useEffect(() => {
    const firstVisit = localStorage.getItem('tabs-swipe-hint-shown');
    if (!firstVisit) {
      setShowSwipeHint(true);
      localStorage.setItem('tabs-swipe-hint-shown', 'true');
      setTimeout(() => setShowSwipeHint(false), 3500);
    }
  }, []);

  // Scroll inactivity logic
  useEffect(() => {
    if (!tabsRef.current) return;
    const scrollContainer = tabsRef.current.querySelector('.MuiTabs-scroller');
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      scrollTimeout.current = setTimeout(() => {
        setIsScrolling(false);
      }, 3000); // 3 seconds of inactivity
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // When user stops scrolling, center the selected tab
  useEffect(() => {
    if (isScrolling) return;
    const selected =
      tabsRef.current?.querySelector('[aria-selected="true"]');

    selected?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [isScrolling, tab]);

  return (
    <div className={'tab-outer-container ' + (className || '')} style={{ position: 'relative' }}>
      <Await
        resolve={activeTabRoutesPromise}      >
        {( /** @type {Awaited<typeof activeTabRoutesPromise>} */ activeTabRoutes) => {
          const selectedIndex = activeTabRoutes.findIndex(route => route.path === tab);
          return (
            <Box sx={{ position: 'relative' }}>
              <Tabs
                ref={tabsRef}
                TabIndicatorProps={{ style: { display: 'none' } }}
                TabScrollButtonProps={{ sx: { height: 54 } }}
                orientation="horizontal"
                variant="scrollable"
                allowScrollButtonsMobile
                onChange={() => {
                  const selected =
                    tabsRef.current?.querySelector('[aria-selected="true"]');
                  tabsRef.current?.querySelector('[aria-selected="true"]');
                  selected?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
                }}
                value={selectedIndex === -1 ? false : selectedIndex}
              >
                {activeTabRoutes.map(route => (
                  <Tab
                    key={route.path}
                    to={route.path}
                    label={route.tab().label}
                    component={Link}
                  />
                ))}
              </Tabs>

              {/* Shadow swipe hint */}
              <Fade in={showSwipeHint}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: 10,
                    left: 0,
                    width: 30,
                    height: 30,
                    background: 'rgba(0,0,0,0.5)',
                    borderRadius: 100,
                    pointerEvents: 'none',
                    animation: `${shadowSwipe} 2s ease-in-out infinite`,
                  }}
                />
              </Fade>
            </Box>
          );
        }}

      </Await>
    </div>
  );
}






