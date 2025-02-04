// @ts-check

import { CircularProgress } from '@mui/material';
import { useState } from 'react';
import { IconButton, Tooltip, tooltipClasses } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';
import { useListSize } from '../../api/lists';
import './list-view.css';
import { ProgressiveRender } from '../../common-components/progressive-render';
import { ConditionalAnchor } from '../../common-components/conditional-anchor';
import { useResolveHandleOrDid } from '../../api';

/**
 * @param {{
 *  className?: string,
 *  list?: AccountListEntry[]
 * }} _
 */
export function ListView({ className, list }) {
  return (
    <ul
      className={'lists-as-list-view ' + (className || '')}
      style={{ padding: 0 }}
    >
      <ProgressiveRender
        items={list || []}
        renderItem={(entry) => <ListViewEntry entry={entry} />}
      />
    </ul>
  );
}

/**
 * @param {{
 *  className?: string,
 *  entry: AccountListEntry
 * }} _
 */
export function ListViewEntry({ className, entry }) {
  const { data: sizeData, isLoading } = useListSize(entry?.url);
  const count = sizeData?.count?.toLocaleString() || '';

  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const opacity = entry.spam ? 0.4 : 1;
  const resolved = useResolveHandleOrDid(entry.did);

  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className="row" style={{ opacity }}>
        <AccountShortEntry
          className="list-owner"
          withDisplayName
          account={entry.did}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className="list-add-date"
        />
      </div>
      <div className="row">
        <span className="list-name">
          <ConditionalAnchor
            target="__blank"
            style={{ opacity }}
            href={entry.url}
            condition={!resolved.isError && resolved.data}
          >
            {entry.name}
          </ConditionalAnchor>
          {entry.spam && (
            <ClickAwayListener onClickAway={handleTooltipClose}>
              <Tooltip
                title={`Flagged as spam. Source: ${entry.source || 'unknown'}`}
                onClose={handleTooltipClose}
                open={open}
                disableFocusListener
                disableHoverListener
                disableTouchListener
                slotProps={{
                  popper: {
                    disablePortal: true,
                    sx: {
                      [`&.${tooltipClasses.popper}[data-popper-placement*="bottom"] .${tooltipClasses.tooltip}`]:
                        {
                          marginTop: '0px',
                        },
                    },
                  },
                }}
              >
                <IconButton onClick={handleTooltipOpen}>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </ClickAwayListener>
          )}
        </span>
        <span className="list-count">
          {isLoading ? (
            <CircularProgress color="inherit" size="0.75em" />
          ) : (
            count
          )}
        </span>
      </div>
      {entry.description && (
        <div className="row">
          <span className="list-description">{' ' + entry.description}</span>
        </div>
      )}
    </li>
  );
}
