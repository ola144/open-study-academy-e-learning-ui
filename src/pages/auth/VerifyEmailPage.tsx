import { Link, useParams } from "react-router-dom";
import { AuthPageLayout } from "./AuthPageLayout";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import { useVerifyEmail } from "../../hooks/useAuth";
import { useEffect, useRef } from "react";
import { CheckCircleOutlineOutlined, ClearOutlined } from "@mui/icons-material";

const VerifyEmailPage = () => {
  const { token } = useParams();

  const verifyEmail = useVerifyEmail();
  const hasRequested = useRef(false);

  useEffect(() => {
    if (token && !hasRequested.current) {
      hasRequested.current = true;
      verifyEmail.mutate(token);
    }
  }, [token]);

  const failed = verifyEmail.isError;

  const message = failed
    ? (verifyEmail.error as { response?: { data?: { message?: string } } })
        .response?.data?.message ||
      "This verification link is invalid or expired."
    : verifyEmail.data?.message;

  return (
    <AuthPageLayout
      title="Email Verfication"
      pageTitle={
        failed ? "Verification link expired" : "Your email is verified"
      }
      description=""
      footer
    >
      <Box sx={{ textAlign: "center" }}>
        <Box
          sx={{
            width: 80,
            height: 80,
            mx: "auto",
            mb: 3,
            display: "grid",
            placeItems: "center",
            borderRadius: "50%",
            bgcolor: failed
              ? "#fef2f2"
              : verifyEmail.isPending
                ? "#fff7ed"
                : "#f0fdf4",
            color: failed
              ? "#ef4444"
              : verifyEmail.isPending
                ? "#e85d04"
                : "#16a34a",
          }}
        >
          {verifyEmail.isPending ? (
            <CircularProgress
              size={34}
              thickness={4}
              sx={{
                color: "#e85d04",
              }}
            />
          ) : failed ? (
            <ClearOutlined color="error" />
          ) : (
            <CheckCircleOutlineOutlined color="success" />
          )}
        </Box>

        <Typography
          sx={{
            fontSize: "0.875rem",
            lineHeight: 1.5,
            color: "#765f54",
          }}
        >
          {verifyEmail.isPending ? "Confirming your email address..." : message}
        </Typography>

        {!verifyEmail.isPending && (
          <Button
            component={Link}
            to={failed ? "/signup" : "/login"}
            fullWidth
            variant="contained"
            color="primary"
          >
            {failed ? "Create a new account" : "Continue to sign in"}
          </Button>
        )}
      </Box>
    </AuthPageLayout>
  );
};

export default VerifyEmailPage;
