// @ts-check

import { BlockListPanelGeneric } from '../block-panel-generic';
import { localise } from '../../localisation';
import { useNavigate } from 'react-router-dom';
import { useAccountResolver } from '../account-resolver';
import { CircularProgress } from '@mui/material';

/**
 * @this {never}
 * @param {{
 *  blockListEntry: BlockListEntry | null
 * }} _
 */
export default function BlockListSubscribersPanel({blockListEntry}) {
  const navigate = useNavigate();
  const { isLoading, error, data } = useAccountResolver();
  
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

  const shortHandle = data.shortHandle;
  if (!blockListEntry) {
    navigate(`/${shortHandle}/` + 'blocked-by-lists');
    return null
  }

  return (
    <BlockListPanelGeneric
      className="blocked-by-panel"
      handle={shortHandle}
      blockListEntry={blockListEntry}
      header={({ blockListName, count }) => (
        <>
          {`${blockListName} has ${Intl.NumberFormat().format(count)} subscribers`}
        </>
      )}
      onCloseClick={(handle) => (
        navigate(`/${handle}/` + 'blocked-by-lists')
      )}
    />
  );
}
