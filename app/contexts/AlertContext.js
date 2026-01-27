"use client";

import { Alert, Box, Snackbar } from "@mui/material";
import { createContext, useState, useContext, useCallback } from "react";
import { isArabicOrHebrew } from "../live/[channel]/components/utils";

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children, duration = 3000 }) => {
  const [alerts, setAlerts] = useState([]);

  const showAlert = useCallback((message, severity = "info") => {
    const id = Date.now() + Math.random();
    setAlerts(prev => [...prev, { id, message, severity }]);

    setTimeout(() => {
      setAlerts(prev => prev.filter(alert => alert.id !== id));
    }, duration);
  }, [duration]);

  const removeAlert = useCallback((id) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  }, []);

  return (
    <AlertContext.Provider value={{ alerts, showAlert, removeAlert }}>
      <Snackbar open={alerts.length > 0} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Box display="flex" flexDirection="column" gap={1}>
          {alerts.map(alert => (
            <Alert
              key={alert.id}
              severity={alert.severity || "info"}
              variant="filled"
              onClose={() => removeAlert(alert.id)}
              sx={{ boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.3)" }}
              dir={isArabicOrHebrew(alert.message) ? "rtl" : "ltr"}
            >
              {alert.message}
            </Alert>
          ))}
        </Box>
      </Snackbar>
      {children}
    </AlertContext.Provider>
  );
};
