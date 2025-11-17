// @ts-check
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useMatch } from 'react-router-dom';
import { Tabs, Tab, Box, useTheme, useMediaQuery } from '@mui/material';
import { localise } from '../../localisation';
import { useFeatureFlag } from '../../api/featureFlags';
import { useAuth } from '../../context/authContext';

export default function BlockingTabs() {
  const baseMatch = useMatch('/:account/blocking/*');
  const tab = 'blocking' + (baseMatch?.params['*'] ? `/${baseMatch.params['*']}` : '');

  const { authenticated } = useAuth()

  const blockingEnabled = useFeatureFlag('blocking-tab');
  const blockedByEnabled = useFeatureFlag('blocked-by-tab');
  const listsBlockingEnabled = useFeatureFlag('lists-blocking-tab');
  const listsBlockedByEnabled = useFeatureFlag('lists-blocked-by-tab');

    // Auth flags
    const authBlockedByEnabled = useFeatureFlag('restricted-blocked-by') ? !!authenticated : true;
    const authListsBlockingEnabled = useFeatureFlag('restricted-lists-blocking') ? !!authenticated : true;
    const authListsBlockedByEnabled = useFeatureFlag('restricted-lists-blocked-by') ? !!authenticated : true;

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /** @type {React.RefObject<HTMLDivElement>} */
  const tabsRef = useRef(null);
  const [isScrolling, setIsScrolling] = useState(false);
  /** @type {React.MutableRefObject<ReturnType<typeof setTimeout> | null>} */
  const scrollTimeout = useRef(null);
  const [id, setId] = useState("");

  const childrenTabs = [
    { label: localise('Blocking'), to: 'blocking', enabled: blockingEnabled, id: 'blocking' },
    { label: localise('Blocked By'), to: 'blocking/blocked-by', enabled: blockedByEnabled && authBlockedByEnabled, id: 'blocked-by' },
    { label: localise('Lists Blocking'), to: 'blocking/blocking-lists', enabled: listsBlockingEnabled && authListsBlockingEnabled, id: 'blocking-lists' },
    { label: localise('Lists Blocked By'), to: 'blocking/blocked-by-lists', enabled: listsBlockedByEnabled && authListsBlockedByEnabled, id: 'blocked-by-lists' },
  ].filter((t) => t.enabled);

  const activeIndex = childrenTabs.findIndex(route => route.to === tab);


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

  if (!baseMatch) return null

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
        {childrenTabs.map((t) => (
          <Tab
            id={t.id}
            key={t.to || 'index'}
            label={t.label}
            component={Link}
            to={t.to}
            relative="path"
          />
        ))}
      </Tabs>
    </Box >
  );
}
