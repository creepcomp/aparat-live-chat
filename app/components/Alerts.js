"use client";

import { Snackbar, Alert as MUIAlert, Box } from "@mui/material";
import { useAlert } from "../contexts/AlertContext";

export default function Alerts({ position = { vertical: "top", horizontal: "right" } }) {
  const { alerts, removeAlert } = useAlert();

  return (
    <Snackbar open={alerts.length > 0} anchorOrigin={position}>
      <Box display="flex" flexDirection="column" gap={1}>
        {alerts.map(alert => (
          <MUIAlert
            key={alert.id}
            severity={alert.severity || "info"}
            variant="filled"
            onClose={() => removeAlert(alert.id)}
            sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)" }}
          >
            {alert.message}
          </MUIAlert>
        ))}
      </Box>
    </Snackbar>
  );
}
