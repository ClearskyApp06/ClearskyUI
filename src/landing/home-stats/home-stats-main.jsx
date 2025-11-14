// @ts-check
import { NetworkCircle } from './infographics/network-circle';
import { TopBlocked } from './infographics/top-blocked';
import { TopBlockers } from './infographics/top-blockers';
import { TopListsOn } from './infographics/top-lists-on';
import { TopListsMade } from './infographics/top-lists-made';
import { useFeatureFlag } from '../../api/featureFlags';

import './home-stats-main.css';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

/**
 * @param {import('.').HomeStatsDetails} _
 */
export function HomeStatsMain({
  className,
  asofFormatted,
  activeAccounts,
  totalAccounts,
  deletedAccounts,
  percentNumberBlocked1,
  percentNumberBlocking1,
  loading,
  stats,
  onToggleTable,
}) {
  const navigate = useNavigate()
  const statsPage = useFeatureFlag('stats-page');
  const topBlocked = useFeatureFlag('top-blocked');
  const topBlockers = useFeatureFlag('top-blockers');
  const topListsOn = useFeatureFlag('top-lists-on');
  const topListsMade = useFeatureFlag('top-lists-made');
  const pdsInformation = useFeatureFlag('pds-information');
  const labelerInformationFlag = useFeatureFlag('labeler-information');


  const blueButtonStyle = {
    backgroundColor: '#d6e5ff',
    color: '#4f77bf',
    textTransform: 'none',
    px: { xs: 1, sm: 2 },
    fontSize: { xs: 12, sm: 13 },
    py: 1,
    borderRadius: 2,
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#afcbfdff',
    },
  }

  const orangeButtonStyle = {
    backgroundColor: '#ffc7a1',
    textTransform: 'none',
    px: { xs: 1, sm: 2 },
    fontSize: { xs: 12, sm: 13 },
    py: 1,
    color: '#ab6002',
    borderRadius: 2,
    fontWeight: 500,
    '&:hover': {
      backgroundColor: '#ffb583ff',
    },
  }

  return (
    <div
      className={'home-stats-main ' + (className || '')}
      style={{ padding: '0 1em' }}
    >
      <div style={{ fontSize: '60%', textAlign: 'right', color: 'silver' }}>
        <i>{asofFormatted}</i>
      </div>

      <NetworkCircle
        {...{
          activeAccounts,
          deletedAccounts,
          totalAccounts,
          percentNumberBlocked1,
          percentNumberBlocking1,
          loading,
        }}
      />

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          mb: 2,
          alignItems: 'center',
          justifyContent: { xs: 'center', md: 'start' }
        }}
      >
        {
          pdsInformation &&
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate("/pds")}
            sx={blueButtonStyle}
          >
            PDS Information
          </Button>
        }
        {
          statsPage &&
          <Button
            size="small"
            variant="contained"
            onClick={() => { onToggleTable?.() }}
            sx={orangeButtonStyle}
          >
            Block Stats
          </Button>
        }{
          labelerInformationFlag &&
          <Button
            size="small"
            variant="contained"
            onClick={() => navigate("/labelers")}
            sx={blueButtonStyle}
          >
            Labeler Information
          </Button>
        }
      </Box>



      {
        stats && (
          <>
            {topBlocked && (
              <TopBlocked
                blocked={stats.topLists.total.blocked}
                blocked24={stats.topLists['24h'].blocked}
              />
            )}

            {topBlockers && (
              <TopBlockers
                blockers={stats.topLists.total.blockers}
                blockers24={stats.topLists['24h'].blockers}
              />
            )}

            {topListsOn && (
              <TopListsOn
                listsOn={stats.topLists.total.listsOn}
                listsOn24={stats.topLists['24h'].listsOn}
                limit={20}
              />
            )}

            {topListsMade && (
              <TopListsMade
                listsMade={stats.topLists.total.listsMade}
                listsMade24={stats.topLists['24h'].listsMade}
                limit={20}
              />
            )}
          </>
        )
      }
    </div >
  );
}
