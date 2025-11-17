// @ts-check
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { useFeatureFlag } from '../../api/featureFlags';
import { useAuth } from '../../context/authContext';

export default function StarterPacksTabs() {
  const match = useMatch('/:account/starter-packs/*');
  const tab = 'starter-packs' + (match?.params['*'] ? `/${match.params['*']}` : '');

  const { authenticated } = useAuth()

  // Feature flags
  const madeEnabled = useFeatureFlag('starter-packs-made-tab');
  const inEnabled = useFeatureFlag('starter-packs-in-tab');

  // Auth flags
  const madeAuthEnabled = useFeatureFlag('restricted-starter-packs-made') ?  !!authenticated : true;
  const inAuthEnabled = useFeatureFlag('restricted-starter-packs-in') ? !!authenticated : true;

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /** @type {React.RefObject<HTMLDivElement>} */
  const tabsRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  /** @type {React.MutableRefObject<ReturnType<typeof setTimeout> | null>} */
  const scrollTimeout = useRef(null);
  const [id, setId] = useState("");

  const routes = [
    { label: 'Starter Packs Made', to: 'starter-packs', enabled: madeEnabled && madeAuthEnabled, id: 'starter-packs' },
    { label: 'Starter Packs In', to: 'starter-packs/in', enabled: inEnabled && inAuthEnabled, id: 'starter-packs-in' },
  ].filter((r) => r.enabled);

  const activeIndex = routes.findIndex(route => route.to === tab);

  const value = activeIndex === -1 ? false : activeIndex;

  // ---- Scroll inactivity logic ----
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

  // ---- Helper: center selected tab ----
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

  // ---- Center tab after scroll inactivity or route change ----
  useEffect(() => {
    if (!isScrolling) centerSelectedTab();
  }, [isScrolling, centerSelectedTab]);


  const handleChange = (/** @type {string} */ id) => {
    centerSelectedTab(id);
  };

  if (!match) return null

  return (
    <Box sx={{
      position: 'relative',
      height: '100%',
      pt: '48px'
    }}>
      <Tabs
        ref={tabsRef}
        value={value}
        allowScrollButtonsMobile
        centered={!isMobile}
        variant={isMobile ? "scrollable" : "standard"}
        onChange={(e) => {
          handleChange(e.currentTarget.id);
          setId(e.currentTarget.id)
        }}
        sx={{
          background: 'white',
          borderBottom: { xs: 'none', md: '1px solid #ddd' },
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 15,
          width: '100%',
        }}
      >
        {routes.map((r) => (
          <Tab
            id={r.id}
            key={r.to || 'index'}
            label={r.label}
            component={Link}
            to={r.to}
            relative="path"
          />
        ))}
      </Tabs>
    </Box>
  );
}
