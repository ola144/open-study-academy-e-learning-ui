import { Logout } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { useLogout } from "../hooks/useAuth";
import { toast } from "react-toastify";
import { useState } from "react";

interface Props {
  open: boolean;
  setOpen: (value: boolean) => void;
}

const LogoutModal = ({ open, setOpen }: Props) => {
  const logoutMutation = useLogout();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logoutMutation
      .mutateAsync()
      .then(() => {
        setOpen(false);
      })
      .catch(() => {
        toast.error("Something went wrong. Try again!");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="logout-dialog-title"
      aria-describedby="logout-dialog-description"
      role="alertdialog"
    >
      <Logout
        color="error"
        sx={{
          mx: "20px",
          mt: "20px",
          mb: "0px",
          fontSize: "24px",
        }}
      />

      <DialogTitle id="logout-dialog-title" color="error">
        Logout out of One Study?
      </DialogTitle>

      <DialogContent>
        <DialogContentText id="logout-dialog-description">
          Are you sure you want to end your current session? You'll need to log
          back in to access your account features.
        </DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          color="info"
          variant="contained"
          disabled={loading}
          onClick={handleClose}
        >
          Cancel
        </Button>
        <Button
          color="error"
          variant="contained"
          disabled={loading}
          onClick={handleLogout}
        >
          {loading ? "Loadding..." : "Logout"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogoutModal;
