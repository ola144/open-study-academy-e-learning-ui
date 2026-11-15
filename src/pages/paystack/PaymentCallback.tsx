/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { CheckCircleOutlined, ErrorOutlined } from "@mui/icons-material";
import api from "../../app/axios";
import { queryClient } from "../../app/queryClient";

export default function PaymentCallback() {
  const [params] = useSearchParams();

  const navigate = useNavigate();

  const [returnInvoiceId, setReturnInvoiceId] = useState("");
  const [state, setState] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    const reference = params.get("reference") || params.get("trxref");
    const invoiceId = sessionStorage.getItem("payment-return-invoice-id") ?? "";
    sessionStorage.removeItem("payment-return-invoice-id");
    setReturnInvoiceId(invoiceId);

    if (!reference) {
      setState("error");
      setMessage("No payment reference was provided.");
      return;
    }

    let active = true;
    api
      .post("/student/payments/verify", { reference })
      .then(({ data }) => {
        if (!active) return;
        if (data.data.status === "SUCCESS") {
          setState("success");
          setMessage("Payment confirmed successfully.");
        } else {
          setState("error");
          setMessage(
            "Payment is not confirmed yet. Please check your invoice again shortly.",
          );
        }
        void queryClient.invalidateQueries({ queryKey: ["student-invoice"] });
        void queryClient.invalidateQueries({ queryKey: ["student-invoices"] });
        void queryClient.invalidateQueries({
          queryKey: ["student-invoice-summary"],
        });
        void queryClient.invalidateQueries({
          queryKey: ["payment", "history"],
        });
      })
      .catch(() => {
        if (active) {
          setState("error");
          setMessage(
            "We could not confirm this payment. Do not retry payment until the invoice balance is checked.",
          );
          void queryClient.invalidateQueries({ queryKey: ["student-invoice"] });
          void queryClient.invalidateQueries({
            queryKey: ["student-invoices"],
          });
        }
      });
    return () => {
      active = false;
    };
  }, [params]);

  useEffect(() => {
    document.title = `Confirm Payment | OpenStudy`;
  }, []);

  return (
    <Box
      sx={{ minHeight: "70vh", display: "grid", placeItems: "center", p: 2 }}
    >
      <Paper
        variant="outlined"
        sx={{ width: "min(100%, 480px)", p: 4, textAlign: "center" }}
      >
        <Stack sx={{ alignItems: "center" }} spacing={2}>
          {state === "loading" ? (
            <CircularProgress />
          ) : state === "success" ? (
            <CheckCircleOutlined color="success" sx={{ fontSize: 56 }} />
          ) : (
            <ErrorOutlined color="error" sx={{ fontSize: 56 }} />
          )}
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {state === "loading"
              ? "Confirming payment"
              : state === "success"
                ? "Payment complete"
                : "Payment status"}
          </Typography>
          <Alert
            severity={
              state === "loading"
                ? "info"
                : state === "success"
                  ? "success"
                  : "warning"
            }
            sx={{ width: "100%", textAlign: "left" }}
            role="status"
          >
            {message}
          </Alert>
          {state !== "loading" && (
            <Button
              variant="contained"
              onClick={() =>
                navigate(
                  returnInvoiceId
                    ? `/student/invoices/${returnInvoiceId}`
                    : "/student/invoices",
                )
              }
            >
              {returnInvoiceId ? "View invoice" : "View my invoices"}
            </Button>
          )}
        </Stack>
      </Paper>
    </Box>
  );
}
