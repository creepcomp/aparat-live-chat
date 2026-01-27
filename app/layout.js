"use client";

import { Box, createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { AlertProvider } from "./contexts/AlertContext";

const theme = createTheme({
  palette: {
    mode: 'dark'
  }
});

export default function RootLayout({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <html lang="en">
        <head>
          <link rel="stylesheet" href="/style.css" />
        </head>
        <body>
          <AlertProvider>
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" flexDirection='column' gap={1}>
              {children}
            </Box>
          </AlertProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
