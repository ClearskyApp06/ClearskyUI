// @ts-check

import { useState } from 'react';
import { IconButton, Tooltip, tooltipClasses } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { AccountShortEntry } from '../../common-components/account-short-entry';
import { FormatTimestamp } from '../../common-components/format-timestamp';

import './list-view.css';

/**
 * @param {{
 *  className?: string,
 *  list?: AccountListEntry[]
 * }} _
 */
export function ListView({ className, list }) {
  return (
    <ul className={'lists-as-list-view ' + (className || '')} style={{padding:0}}>
      {(list || []).map((entry, i) => (
        <ListViewEntry
          key={i}
          entry={entry} />
      ))}
    </ul>
  );
}

/**
 * @param {{
 *  className?: string,
 *  entry: AccountListEntry
 * }} _
 */
function ListViewEntry({ className, entry }) {

  const [open, setOpen] = useState(false);

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const opacity = entry.spam? 0.4 : 1;

  return (
    <li className={'lists-entry ' + (className || '')}>
      <div className='row' style={{opacity}}>
        <AccountShortEntry
          className='list-owner'
          withDisplayName
          account={entry.did}
        />
        <FormatTimestamp
          timestamp={entry.date_added}
          noTooltip
          className='list-add-date' />
      </div>
      {/* <div className='row'  > */}
      <div>
        <span className='list-name'>
          <a href={entry.url} target='__blank' style={{opacity}}>
          {entry.name}
          </a>
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
      </div>
      {entry.description && <div className='row' style={{opacity}}>
        <span className='list-description'>
          {' ' + entry.description}
        </span>
      </div>}
    </li>
  );
}
