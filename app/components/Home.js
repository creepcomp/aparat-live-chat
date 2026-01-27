"use client";

import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [liveUrl, setLiveUrl] = useState("");

  const handleWatch = () => {
    const regex = /^https?:\/\/www\.aparat\.com\/([^\/]+)\/live$/;
    const match = liveUrl.match(regex);

    if (match) {
      const username = match[1];
      router.push(`/live/${username}`);
    } else {
      alert("Invalid Aparat live URL format. Example: https://www.aparat.com/username/live");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h4" p={4} align="center">Aparat Live Chat</Typography>
      <Box display="flex" gap={1}>
        <TextField label="Live URL (Aparat)" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} size="small" fullWidth />
      <Button variant="contained" sx={{display: 'block', mx: 'auto'}} onClick={handleWatch}>Watch</Button>
      </Box>
    </Container>
  );
}
