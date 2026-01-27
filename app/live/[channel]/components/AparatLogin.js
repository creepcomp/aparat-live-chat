'use client';

import React, { useState } from 'react';
import { TextField, Button, Typography, Box, CircularProgress } from '@mui/material';
import { loginAparatWithPassword } from '../actions';
import { useAlert } from '@/app/contexts/AlertContext';
import { useRouter } from 'next/navigation';

export default function AparatLogin() {
  const { showAlert } = useAlert();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await loginAparatWithPassword(username, password);

    setLoading(false);

    if (result.success) {
      showAlert(result.message, 'success');
      router.refresh();
    } else {
      showAlert(result.error, 'error');
    }
  };

  return (
    <Box component="form" onSubmit={handleLogin}>
      <Typography variant="h5" textAlign="center" mb={2}>ورود با حساب آپارات</Typography>

      <Box mb={2} p={1} border={1} borderColor="grey.400" bgcolor="grey.800">
        <Typography variant="body2" color="textPrimary" dir="rtl">
          جهت حفاظت از حریم خصوصی کاربران، اطلاعات حساب شما در هیچ پایگاه داده‌ای ذخیره نمی‌شود. ورود به حساب شما به‌صورت امن و از طریق متدهای مجاز آپارات (<a href="https://www.aparat.com/api#login" target="_blank" rel="noopener noreferrer" style={{ color: '#90caf9' }}>Aparat API</a>) انجام می‌گیرد. لطفاً با اطمینان نام کاربری و رمز عبور خود را وارد نمایید.
        </Typography>
      </Box>


      <TextField label="نام کاربری آپارات" fullWidth required sx={{ mb: 1 }} dir="ltr" disabled={loading} value={username} onChange={(e) => setUsername(e.target.value)} />

      <TextField label="رمز عبور" type="password" fullWidth required sx={{ mb: 1 }} dir="ltr" disabled={loading} value={password} onChange={(e) => setPassword(e.target.value)} />

      <Button type="submit" fullWidth variant="contained" sx={{ mb: 1 }} disabled={loading || !username || !password}>
        {loading ? <CircularProgress size={24} /> : 'ورود'}
      </Button>
    </Box>
  );
}
