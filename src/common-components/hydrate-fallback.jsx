import React from 'react'
import { CircularProgress, Container } from '@mui/material'

export const HydrateFallback = () => {
  return (
    <Container sx={{
      display: 'flex',
      placeItems: 'center',
      justifyContent: 'center',
      height: '100dvh',
      width: '100dvw',
    }}>
      <CircularProgress />
    </Container>
  )
}
