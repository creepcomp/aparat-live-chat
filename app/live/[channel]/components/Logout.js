"use client";

import { useAlert } from "@/app/contexts/AlertContext";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import { logout } from "../actions";

export default function LogoutButton() {
  const { showAlert } = useAlert();
  const router = useRouter();

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      showAlert(result.message, "success");
      router.refresh();
    }
    router.refresh();
  };

  return (
    <Button color="error" size="small" onClick={handleLogout}>Logout</Button>
  );
}
