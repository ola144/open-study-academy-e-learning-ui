import { useState, type ReactNode } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { ArrowBack, Close } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import "./admin-detail-pages.css";

type AdminDetailShellProps = {
  backTo: string;
  backLabel: string;
  title: string;
  subtitle: string;
  initials: string;
  profilePic?: string;
  status?: string;
  loading: boolean;
  error?: string;
  notFound?: boolean;
  onRetry?: () => void;
  children?: ReactNode;
};

export default function AdminDetailShell({
  backTo,
  backLabel,
  title,
  subtitle,
  initials,
  profilePic,
  status,
  loading,
  error,
  notFound,
  onRetry,
  children,
}: AdminDetailShellProps) {
  const [showImage, setshowImage] = useState(false);

  return (
    <div className="admin-page admin-detail-page">
      <Button
        component={RouterLink}
        to={backTo}
        className="admin-detail-back"
        startIcon={<ArrowBack />}
      >
        {backLabel}
      </Button>

      {loading ? (
        <Paper className="admin-detail-loading" elevation={0}>
          <CircularProgress aria-label={`Loading ${backLabel}`} />
          <Typography>Loading details…</Typography>
        </Paper>
      ) : error ? (
        <Alert
          severity="error"
          action={
            onRetry ? (
              <Button color="inherit" size="small" onClick={onRetry}>
                Retry
              </Button>
            ) : undefined
          }
        >
          {error}
        </Alert>
      ) : notFound ? (
        <Alert severity="warning">
          This record could not be found. It may have been removed or you may
          not have permission to view it.
        </Alert>
      ) : (
        <>
          <Paper className="admin-detail-hero" elevation={0}>
            {profilePic ? (
              <img
                style={{
                  width: "64px",
                  height: "64px",
                  border: "2px solid #fff",
                  background: "#e7efe9",
                  borderRadius: "100%",
                  cursor: "pointer",
                }}
                onClick={() => setshowImage(true)}
                src={profilePic}
                alt={title}
              />
            ) : (
              <Avatar className="admin-detail-avatar">{initials || "?"}</Avatar>
            )}

            <div className="admin-detail-heading-copy">
              <Typography className="admin-eyebrow">
                SCHOOL DIRECTORY
              </Typography>
              <Typography component="h2" className="admin-page-title">
                {title}
              </Typography>
              <Typography className="admin-page-description">
                {subtitle}
              </Typography>
            </div>
            {status && (
              <Chip
                label={status}
                className={`admin-status-chip ${status.toLowerCase()}`}
              />
            )}
          </Paper>
          <Stack spacing={2.5}>{children}</Stack>
        </>
      )}

      <Dialog open={showImage} fullWidth>
        <DialogContent sx={{ position: "relative" }}>
          <img
            src={profilePic}
            style={{
              width: "100%",
              height: "100%",
            }}
            alt={title}
          />

          <IconButton
            sx={{
              position: "absolute",
              right: 5,
              top: 4,
              bgcolor: "gold",
              color: "black",
            }}
            onClick={() => setshowImage(false)}
          >
            <Close sx={{ fontSize: 12 }} />
          </IconButton>
        </DialogContent>
      </Dialog>
    </div>
  );
}
