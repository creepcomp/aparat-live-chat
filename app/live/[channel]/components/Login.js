'use client';

import React, { useState } from 'react';
import { Box, Container, Paper, Button, Typography, Stack } from '@mui/material';
import AparatLogin from './AparatLogin';
import GuestNickname from './GuestNickname';

export default function Login() {
  const [view, setView] = useState(null);

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Box component={Paper} elevation={3} sx={{ width: '100%', p: 2 }}>
        {view === null && (
          <Stack spacing={1} alignItems="center">
            <Typography variant="h5" p={2} align="center">Choose Login Method</Typography>
            <Button variant="contained" color='success' fullWidth size="large" onClick={() => setView('guest')}>Continue as Guest</Button>
            <Button variant="outlined" color="error" fullWidth size="large" onClick={() => setView('aparat')}>Login with Aparat (Streamer)</Button>
          </Stack>
        )}

        {view === 'aparat' && (
          <Box>
            <AparatLogin />
            <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={() => setView(null)}>بازگشت</Button>
          </Box>
        )}

        {view === 'guest' && (
          <Box>
            <GuestNickname />
            <Button variant="outlined" fullWidth sx={{ mt: 1 }} onClick={() => setView(null)}>Back</Button>
          </Box>
        )}
      </Box>
    </Container>
  );
}
