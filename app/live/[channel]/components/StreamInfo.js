import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import { isArabicOrHebrew } from "./utils";
import { getAparatChannelInfo } from "../actions";

export default async function StreamInfo({ channel }) {
  const channelInfo = await getAparatChannelInfo(channel);

  const {
    title = "",
    descr = "",
    donate_link = {},
    streamer_details_cover,
  } = channelInfo;

  const covers = Array.isArray(streamer_details_cover) ? streamer_details_cover : [];

  return (
    <Box component={Paper} p={2}>
      <Grid container mb={1} sx={{ direction: isArabicOrHebrew(title) ? "rtl" : "ltr" }} alignItems="center">
        <Grid size={{ sm: 8 }}>
          <Typography variant="h5" noWrap>
            {title || " "}
          </Typography>
        </Grid>

        <Grid size="grow" display="flex" justifyContent="flex-end" gap={1}>
          {donate_link?.url && (
            <Button variant="contained" color="success" href={donate_link.url} target="_blank">
              {donate_link.title || "Donate"}
            </Button>
          )}

          <Button variant="contained" href={`https://www.aparat.com/${channel}`} color="error" target="_blank">
            دنبال کردن
          </Button>
        </Grid>
      </Grid>

      {descr && (
        <Box mb={1} dangerouslySetInnerHTML={{ __html: descr }} sx={{ direction: isArabicOrHebrew(descr) ? "rtl" : "ltr" }} />
      )}

      {covers.length > 0 && (
        <Box display="flex" gap={1} justifyContent="center" alignItems="center" p={2}>
          {covers.map((x, i) => (
            <Button key={i} href={x.url} target="_blank">
              <img src={x.image} alt={x.url} width={200} />
            </Button>
          ))}
        </Box>
      )}
    </Box>
  );
}
