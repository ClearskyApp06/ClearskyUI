// @ts-check
import React from 'react';
import { 
  ToggleButtonGroup, 
  ToggleButton,
  Box,
  Typography 
} from '@mui/material';
import { useSettings } from '../utils/settings-context';
import { localise } from '../localisation';

/**
 * @param {{ className?: string }} props
 */
export function TimeFormatToggle({ className }) {
  const { timeFormat, setTimeFormat } = useSettings();

  const handleChange = (
    /** @type {React.MouseEvent<HTMLElement>} */ _,
    /** @type {import('../utils/settings-context').TimeFormat | null} */ newFormat
  ) => {
    if (newFormat !== null) {
      setTimeFormat(newFormat);
    }
  };

  return (
    <Box className={className} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
        {localise('Time format:', { uk: 'Формат часу:' })}
      </Typography>
      <ToggleButtonGroup
        value={timeFormat}
        exclusive
        onChange={handleChange}
        size="small"
        aria-label="time format"
        sx={{
          '& .MuiToggleButton-root': {
            fontSize: '0.75rem',
            padding: '4px 8px',
            textTransform: 'none',
          },
        }}
      >
        <ToggleButton value="auto" aria-label="auto time format">
          {localise('Auto', { uk: 'Авто' })}
        </ToggleButton>
        <ToggleButton value="12" aria-label="12 hour format">
          12h
        </ToggleButton>
        <ToggleButton value="24" aria-label="24 hour format">
          24h
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
