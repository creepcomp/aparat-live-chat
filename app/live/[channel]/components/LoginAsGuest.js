'use client';

import { useState } from 'react';
import { Button, TextField, Typography, Stack } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function LoginAsGuest() {
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleContinue = () => {
    const _nickname = nickname.trim();

    if (_nickname.length < 3) {
      setError('Nickname must be at least 3 characters');
      return;
    }

    console.log(_nickname);

    document.cookie = `nickname=${_nickname}; path=/`;
    router.refresh();
  };

  return (
    <Stack spacing={1} margin="auto">
      <Typography variant="h5" align="center">Choose a Nickname</Typography>
      <TextField label="Nickname" value={nickname} error={!!error} helperText={error} fullWidth
        onChange={(e) => {
          setNickname(e.target.value);
          setError('');
        }}
      />
      <Button variant="contained" onClick={handleContinue}>Enter Chat</Button>
    </Stack>
  );
}
