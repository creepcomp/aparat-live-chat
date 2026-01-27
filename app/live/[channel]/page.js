import { Box, Grid, Paper } from "@mui/material";
import Chat from "./components/Chat";
import StreamInfo from "./components/StreamInfo";
import { cookies } from "next/headers";
import Login from "./components/Login";
import { getCurrentUser } from "./actions";
import { ChatProvider } from "./contexts/ChatContext";

export default async function LivePage({ params, searchParams }) {
  const cookieStore = await cookies();
  const chatOnly = (await searchParams).chat_only === "true";

  const user = await getCurrentUser();
  const nicknameCookie = cookieStore.get("nickname");

  if (!user && !nicknameCookie) {
    return <Login />;
  }

  const { channel } = await params;

  if (!channel) {
    return <div>Channel not found</div>;
  }

  return (
    <ChatProvider channel={channel}>
      <Box width='100vw' height='100vh' p={2}>
        <Grid container sx={{ height: '100%' }} gap={2}>
          {!chatOnly && (
            <Grid size={{ xs: 12, md: 8 }} overflow='auto'>
              <Box component={Paper} height='80%' mb={2}>
                <iframe src={"https://www.aparat.com/embed/live/" + channel} style={{ width: "100%", height: "100%", border: 'none' }} allowFullScreen />
              </Box>
              <StreamInfo channel={channel} />
            </Grid>
          )}
          <Grid size='grow'>
            <Chat />
          </Grid>
        </Grid>
      </Box>
    </ChatProvider>
  );
}
