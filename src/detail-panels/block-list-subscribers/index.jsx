// @ts-check

import { BlockListPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useNavigate, Navigate, useParams } from 'react-router-dom';
import { useAccountResolver } from '../account-resolver';
import { CircularProgress } from '@mui/material';

/**
 */
export default function BlockListSubscribersPanel() {
  const { isLoading, data } = useAccountResolver();
  const { list_url } = useParams();

  // Show loader for initial load
  if (isLoading || !data) {
    return (
      <div style={{ padding: '1em', textAlign: 'center', opacity: '0.5' }}>
        <CircularProgress size="1.5em" />
        <div style={{ marginTop: '0.5em' }}>
          {localise('Loading lists...', { uk: 'Завантаження списків...' })}
        </div>
      </div>
    );
  }

  if (!list_url) {
    return <Navigate to=".." replace />;
  }

  return (
    <BlockListPanelGeneric
      className="blocked-by-panel"
      listUrl={list_url}
      header={({ blockListName, count }) => (
        <>
          {`${blockListName} has ${Intl.NumberFormat().format(
            count
          )} subscribers`}
        </>
      )}
    />
  );
}
