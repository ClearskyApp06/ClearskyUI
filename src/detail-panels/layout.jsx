// @ts-check

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Outlet, Await, Link, useMatch, useNavigate, useParams, useLocation } from 'react-router-dom';

import { AccountHeader } from './account-header';
import './layout.css';
import { Box, Fade, useTheme, keyframes, Tab, Tabs, useMediaQuery } from '@mui/material';
import { activeTabRoutesPromise } from './tabs';
import { useAccountResolver } from './account-resolver';
import { useSpamStatus } from '../api/spam-status';
import { useFeatureFlag } from '../api/featureFlags';
import { ProfileSpamBanner } from './profile/profile-spam-banner';
import { GoogleAdSlot } from '../common-components/google-ad-slot';
import BlockingTabs from './blocking/blocking-tabs';
import StarterPacksTabs from './packs/starter-packs-tabs';
import { LoginButton } from '../auth/login-button';

/**
 *
 * @returns
 */
export function AccountLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { handle: urlHandle } = useParams();
  const resolved = useAccountResolver();

  // Update URL if the resolved handle is different from the URL handle
  useEffect(() => {
    if (resolved.isSuccess && resolved.data?.shortHandle) {
      const resolvedHandle = resolved.data.shortHandle;
      // Only update if the resolved handle is different from the URL parameter
      if (urlHandle && resolvedHandle !== urlHandle) {
        // Extract the path after the handle (e.g., /profile, /blocking/blocked-by, etc.)
        const handleIndex = location.pathname.indexOf(urlHandle);
        const pathAfterHandle = location.pathname.substring(handleIndex + urlHandle.length);
        // Build the new path with the resolved handle
        const newPath = `/${resolvedHandle}${pathAfterHandle}`;
        navigate(newPath, { replace: true });
      }
    }
  }, [resolved.isSuccess, resolved.data?.shortHandle, urlHandle, location.pathname, navigate]);

  const spamQuery = useSpamStatus(resolved.data?.shortHandle);
  const spamFeature = useFeatureFlag('spam-profile-overlay');
  const isSpam = spamFeature && spamQuery.data?.spam;
  const spamSource = spamQuery.data?.spam_source;

  return (
    <div className="layout">
      <div className="ad-lane">
        <GoogleAdSlot slot="4524958237" style={{ height: '100%' }} />
      </div>
      <div className="main-content">
        <Box sx={{
          position: "absolute",
          top: "16px",
          right: "16px",
          zIndex: 100
        }}>
          <LoginButton />
        </Box>
        <div className="detail-container">
          <AccountHeader className="account-header" />
          <Box
            sx={{
              background: 'white',
              position: 'sticky',
              top: 0,
              left: 0,
              zIndex: 15,
              width: '100%',
            }}
          >
            {isSpam && <ProfileSpamBanner spamSource={spamSource} />}

            <TabSelector className="" />
            <BlockingTabs />
            <StarterPacksTabs />
          </Box>
          <Box sx={{
            position: 'relative',
            overflow: 'auto',
            height: '100%',
          }}>
            <Outlet />
          </Box>
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
  const [id, setId] = useState("");

  const [showSwipeHint, setShowSwipeHint] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Shadow swipe animation
  const shadowSwipe = isMobile
    ? keyframes`
      0% { transform: translateX(90dvw); opacity: .3; }
      100% { transform: translateX(20dvw); opacity: 0; }
    `
    : keyframes`
      0% { transform: translateX(600px); opacity: .3; }
      100% { transform: translateX(300px); opacity: 0; }
    `;

  // ---- Show swipe hint on first mobile visit ----
  useEffect(() => {
    if (!isMobile) return;
    const firstVisit = localStorage.getItem('tabs-swipe-hint-shown');
    if (!firstVisit) {
      setShowSwipeHint(true);
      localStorage.setItem('tabs-swipe-hint-shown', 'true');
      setTimeout(() => setShowSwipeHint(false), 3500);
    }
  }, [isMobile]);

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

  // Helper: center selected tab
  const centerSelectedTab = useCallback((/** @type {string} */ newId = '') => {
    let selectedQuery;

    if (newId) {
      selectedQuery = `#${newId}`;
    } else if (id) {
      selectedQuery = `#${id}`;
    } else {
      selectedQuery = '[aria-selected="true"]';
    }


    const tabsContainer = tabsRef.current?.querySelector('.MuiTabs-scroller');
    const selected = tabsRef.current?.querySelector(selectedQuery);

    if (!tabsContainer || !selected) return;

    const containerWidth = tabsContainer.clientWidth;
    const selectedRect = selected.getBoundingClientRect();
    const containerRect = tabsContainer.getBoundingClientRect();
    const offset =
      selectedRect.left - containerRect.left - containerWidth / 2 + selectedRect.width / 2;

    tabsContainer.scrollTo({
      left: tabsContainer.scrollLeft + offset,
      behavior: 'smooth',
    });
  }, [id]);

  // Center tab after scroll inactivity or route change
  useEffect(() => {
    if (!isScrolling) centerSelectedTab();
  }, [isScrolling, centerSelectedTab]);

  const handleChange = (/** @type {string} */ id) => {
    centerSelectedTab(id);
  };

  return (
    <Box className={'tab-outer-container ' + (className || '')} style={{ position: 'sticky' }}>
      <Await resolve={activeTabRoutesPromise}>
        {(/** @type {Awaited<typeof activeTabRoutesPromise>} */ activeTabRoutes) => {
          const selectedIndex = activeTabRoutes.findIndex(route => route.path === tab);
          return (
            <Box sx={{ position: 'relative' }}>
              <Tabs
                sx={{
                  background: 'white',
                  borderBottom: { xs: 'none', md: '1px solid #ddd' },
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 15,
                  width: '100%',
                }}
                onChange={(e) => {
                  handleChange(e.currentTarget.id);
                  setId(e.currentTarget.id)
                }}
                ref={tabsRef}
                orientation="horizontal"
                centered={!isMobile}
                variant={isMobile ? 'scrollable' : 'standard'}
                allowScrollButtonsMobile
                value={selectedIndex === -1 ? false : selectedIndex}
              >
                {activeTabRoutes.map(route => (
                  <Tab
                    id={route.path}
                    key={route.path}
                    to={route.path || ''}
                    label={route.tab ? route.tab().label : ''}
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
    </Box>
  );
}






