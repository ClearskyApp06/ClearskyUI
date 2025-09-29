// @ts-check

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

import { useDashboardStats } from '../api';
import HomeStatsTable from './home-stats/home-stats-table';
import { Logo } from './logo';

import './home.css';

/**
 * Standalone page for expanded block stats
 */
export default function ExpandedBlockStats() {
  const navigate = useNavigate();
  const { data: stats, isLoading } = useDashboardStats();

  // Ensure body and html have proper styling for the expanded stats page
  React.useEffect(() => {
    // Save original styles
    const originalBodyStyle = {
      height: document.body.style.height,
      overflow: document.body.style.overflow,
    };
    const originalHtmlStyle = {
      height: document.documentElement.style.height,
      overflow: document.documentElement.style.overflow,
    };

    // Apply styles for expanded stats page
    document.body.style.height = '100vh';
    document.body.style.overflow = 'hidden';
    document.documentElement.style.height = '100vh';
    document.documentElement.style.overflow = 'hidden';

    // Cleanup function to restore original styles
    return () => {
      document.body.style.height = originalBodyStyle.height;
      document.body.style.overflow = originalBodyStyle.overflow;
      document.documentElement.style.height = originalHtmlStyle.height;
      document.documentElement.style.overflow = originalHtmlStyle.overflow;
    };
  }, []);

  const asofFormatted = stats?.asof && new Date(stats.asof) + '';

  const activeAccounts = stats?.totalUsers?.active_count?.value;
  const deletedAccounts = stats?.totalUsers?.deleted_count?.value;
  const percentNumberBlocked1 = stats?.blockStats?.percentNumberBlocked1;
  const percentNumberBlocking1 = stats?.blockStats?.percentNumberBlocking1;

  /** @type {import('./home-stats').HomeStatsDetails} */
  const statsProps = {
    className: 'expanded-block-stats',
    asofFormatted,
    activeAccounts,
    deletedAccounts,
    percentNumberBlocked1,
    percentNumberBlocking1,
    loading: isLoading,
    stats,
    onToggleTable() {
      // Navigate back to home instead of toggling
      navigate('/');
    },
  };

  return (
    <div className="expanded-block-stats-page">
      <Logo />
      <div style={{ padding: '1em' }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/')}
          sx={{ mb: 2 }}
        >
          Back to Home
        </Button>
      </div>
      <React.Suspense fallback={<div>Loading stats...</div>}>
        <HomeStatsTable {...statsProps} />
      </React.Suspense>
    </div>
  );
}