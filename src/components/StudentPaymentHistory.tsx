/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Check,
  CheckCircleOutlined,
  DownloadOutlined,
  ErrorOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { formatDateAndTime, naira } from "../utils/helperFunctions";
import { useState } from "react";
import {
  PAYMENT_KEY,
  usePaymentHistoryQuery,
} from "../hooks/usePaymentHistory";
import { downloadPaymentReceipt } from "../api/paymentHistory";
import { toast } from "react-toastify";
import axios from "axios";
import { useStudentVerifyPaymentMutation } from "../hooks/usePaymet";
import { queryClient } from "../app/queryClient";

const StudentPaymentHistory = () => {
  const [paymentStatus, setPaymentStatus] = useState("");
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentLimit, setPaymentLimit] = useState(10);
  const [downloadingId, setDownloadingId] = useState("");
  const [result, setResult] = useState<{
    reference: any;
    status: string;
    alreadyProcessed: boolean;
    amountKobo?: undefined;
    currency?: undefined;
    paidAt?: undefined;
  }>({
    reference: null,
    status: "",
    alreadyProcessed: false,
    amountKobo: undefined,
    currency: undefined,
    paidAt: undefined,
  });
  const [message, setMessage] = useState("");
  const [verify, setVerify] = useState<boolean>(false);

  // const navigate = useNavigate();

  const verifyPayment = useStudentVerifyPaymentMutation();

  const paymentHistory = usePaymentHistoryQuery(
    paymentPage + 1,
    paymentLimit,
    paymentStatus,
  );

  const handleReceiptDownload = async (id: string) => {
    try {
      setDownloadingId(id);
      await downloadPaymentReceipt(id);
    } catch (error) {
      toast.error(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ?? "Receipt could not be downloaded")
          : "Receipt could not be downloaded",
      );
    } finally {
      setDownloadingId("");
    }
  };

  const handleVerifyPayment = (reference: string) => {
    setVerify(true);
    verifyPayment.mutate(
      { reference: reference },
      {
        onSuccess: (res) => {
          setResult(res.data);
          setMessage(res.message);
          queryClient.invalidateQueries({ queryKey: [...PAYMENT_KEY] });
        },
        onError: (err: any) => {
          setMessage(err.response.data.message);
        },
      },
    );
  };

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        sx={{ justifyContent: "space-between", alignItems: "center", mb: 2 }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Payment history
        </Typography>
        <TextField
          select
          size="small"
          label="Status"
          value={paymentStatus}
          onChange={(event) => {
            setPaymentPage(0);
            setPaymentStatus(event.target.value);
          }}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">All payments</MenuItem>
          {[
            "PENDING",
            "SUCCESS",
            "FAILED",
            "ABANDONED",
            "REFUNDED",
            "PARTIALLY_REFUNDED",
          ].map((value) => (
            <MenuItem key={value} value={value}>
              {value.replaceAll("_", " ")}
            </MenuItem>
          ))}
        </TextField>
      </Stack>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Payment date</TableCell>
              <TableCell>Invoice(s)</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paymentHistory.isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 7 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : paymentHistory.data?.data.transactions.length ? (
              paymentHistory.data.data.transactions.map((transaction) => {
                const paymentId = transaction.id;
                const paymentStatusColor:
                  | "default"
                  | "success"
                  | "warning"
                  | "error" =
                  transaction.status === "SUCCESS"
                    ? "success"
                    : transaction.status === "PENDING"
                      ? "warning"
                      : transaction.status === "FAILED"
                        ? "error"
                        : "default";
                return (
                  <TableRow hover key={paymentId}>
                    <TableCell>
                      {transaction.paidAt
                        ? formatDateAndTime(transaction.paidAt)
                        : formatDateAndTime(transaction.createdAt)}
                    </TableCell>
                    <TableCell>
                      {transaction.invoices
                        ?.map((invoice) => invoice.invoiceNumber)
                        .join(", ") || "—"}
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700 }}>
                        {naira(transaction.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={paymentStatusColor}
                        label={transaction.status.replaceAll("_", " ")}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {/* {transaction.status === "SUCCESS" && ( */}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DownloadOutlined />}
                        disabled={downloadingId === paymentId}
                        onClick={() => handleReceiptDownload(paymentId)}
                      >
                        {downloadingId === paymentId
                          ? "Downloading…"
                          : "Receipt"}
                      </Button>
                      {/* )} */}

                      {transaction.status === "PENDING" && (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={verifyPayment.isPending}
                          onClick={() =>
                            handleVerifyPayment(transaction.reference)
                          }
                          startIcon={<Check />}
                        >
                          Verify
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                  <ReceiptLongOutlined
                    sx={{ fontSize: 48, color: "text.disabled" }}
                  />
                  <Typography>No payment history found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={paymentHistory.data?.data.pagination.total ?? 0}
        page={paymentPage}
        onPageChange={(_, nextPage) => setPaymentPage(nextPage)}
        rowsPerPage={paymentLimit}
        onRowsPerPageChange={(event) => {
          setPaymentLimit(Number(event.target.value));
          setPaymentPage(0);
        }}
        rowsPerPageOptions={[10, 20, 30, 40, 50]}
      />

      <Dialog open={verify} fullWidth maxWidth="xs">
        <DialogTitle sx={{ textAlign: "center" }}>Verify Payment</DialogTitle>
        <DialogContent
          sx={{
            alignItems: "center",
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          {verifyPayment.isPending ? (
            <CircularProgress />
          ) : result.status === "SUCCESS" ? (
            <CheckCircleOutlined color="success" sx={{ fontSize: 40 }} />
          ) : (
            <ErrorOutlined color="error" sx={{ fontSize: 40 }} />
          )}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              textAlign: "center",
              textTransform: "capitalize",
            }}
          >
            {verifyPayment.isPending
              ? "Confirming payment"
              : result.status.trim() && result.status === "SUCCESS"
                ? "Payment complete"
                : "Payment not completed"}{" "}
          </Typography>
          {!verifyPayment.isPending &&
          result.status.trim() &&
          !result.status.includes("SUCCESS") ? (
            <Typography variant="body1" sx={{ textAlign: "center" }}>
              Your payment session was {result.status?.toLowerCase()} before
              completion. No successful payment has been confirmed.
            </Typography>
          ) : null}
          <Alert
            severity={
              verifyPayment.isPending
                ? "info"
                : result.status === "SUCCESS"
                  ? "success"
                  : "warning"
            }
            sx={{ width: "100%", textAlign: "left" }}
            role="status"
          >
            {verifyPayment.isPending ? "Verifying payment..." : message}
          </Alert>

          {verifyPayment.isPending ? (
            <></>
          ) : (
            <Typography sx={{ fontSize: 14 }} variant="body1" color="secondary">
              {result.status.trim() && result.status !== "SUCCESS"
                ? "You can try again using the outstanding invoice."
                : ""}
            </Typography>
          )}

          <DialogActions sx={{ placeItems: "center" }}>
            {!verifyPayment.isPending && (
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  setMessage("");
                  setResult({
                    alreadyProcessed: false,
                    reference: null,
                    status: "",
                  });
                  setVerify(false);
                }}
              >
                View My Invoices
              </Button>
            )}
          </DialogActions>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StudentPaymentHistory;
