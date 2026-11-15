import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import {
  CheckCircleOutlined,
  ErrorOutlined,
  HourglassTopOutlined,
  ReceiptLongOutlined,
  ReplayOutlined,
  RuleOutlined,
  SearchOutlined,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useMarkAsReviewedMutation,
  useTransactionDetailQuery,
  useTransactionsQuery,
  useTransactionSummary,
} from "../../hooks/useTransaction";
import {
  formatDateAndTime,
  naira,
  personName,
  txId,
} from "../../utils/helperFunctions";

const statusColors: Record<
  string,
  "default" | "success" | "warning" | "error" | "info"
> = {
  SUCCESS: "success",
  PENDING: "warning",
  FAILED: "error",
  ABANDONED: "default",
  REFUNDED: "info",
  PARTIALLY_REFUNDED: "info",
};

const TransactionsPage = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("");
  // const [provider, setProvider] = useState("");
  const [reference, setReference] = useState("");
  const [referenceInput, setReferenceInput] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewNote, setReviewNote] = useState("");

  const transactions = useTransactionsQuery(
    page + 1,
    limit,
    status,
    undefined,
    reference,
    undefined,
    from,
    to,
  );
  const summary = useTransactionSummary(from, to);
  const detail = useTransactionDetailQuery(selectedId);
  const review = useMarkAsReviewedMutation();

  const rows = transactions.data?.data ?? [];
  const selectedTransaction = detail.data?.data;
  const totals = useMemo(() => summary.data?.data, [summary.data]);

  const submitReview = () => {
    if (
      !selectedTransaction ||
      reviewNote.trim().length < 3 ||
      reviewNote.trim().length > 1000
    ) {
      toast.error("Enter a review note between 3 and 1000 characters");
      return;
    }
    review.mutate(
      { id: txId(selectedTransaction), reviewNote: reviewNote.trim() },
      {
        onSuccess: () => {
          toast.success("Transaction review recorded");
          setReviewOpen(false);
          setReviewNote("");
        },
        onError: (error) =>
          toast.error(
            axios.isAxiosError(error)
              ? (error.response?.data?.message ??
                  "Could not review transaction")
              : "Could not review transaction",
          ),
      },
    );
  };

  const cards = [
    {
      label: "Transactions",
      value: totals?.totalTransactions ?? 0,
      icon: <ReceiptLongOutlined sx={{ fontSize: "18px" }} />,
      color: "#28624e",
    },
    {
      label: "Successful",
      value: totals?.successfulCount ?? 0,
      icon: <CheckCircleOutlined sx={{ fontSize: "18px" }} />,
      color: "#2e7d32",
    },
    {
      label: "Pending",
      value: totals?.pendingCount ?? 0,
      icon: <HourglassTopOutlined sx={{ fontSize: "18px" }} />,
      color: "#ed6c02",
    },
    {
      label: "Failed",
      value: totals?.failedCount ?? 0,
      icon: <ErrorOutlined sx={{ fontSize: "18px" }} />,
      color: "#d32f2f",
    },
    {
      label: "Refunded",
      value: totals?.refundedCount ?? 0,
      icon: <ReplayOutlined sx={{ fontSize: "18px" }} />,
      color: "#0288d1",
    },
    {
      label: "Successful volume",
      value: totals?.successfulAmount ?? 0,
      amount: true,
      icon: <ReceiptLongOutlined sx={{ fontSize: "18px" }} />,
      color: "#6a1b9a",
    },
  ];

  useEffect(() => {
    document.title = `Transactions | OpenStudy`;
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          mb: 3,
          alignItems: { sm: "center" },
        }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Transactions
          </Typography>
          <Typography color="text.secondary">
            Monitor payments, gateway activity, and administrative reviews.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ReplayOutlined />}
          onClick={() => {
            transactions.refetch();
            summary.refetch();
          }}
        >
          Refresh
        </Button>
      </Stack>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        {cards.map((card) => (
          <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        overflowWrap: "anywhere",
                        fontWeight: 700,
                        fontSize: {
                          md: "15px",
                          lg: "20px",
                          sm: "16px",
                          xs: "16px",
                        },
                      }}
                    >
                      {totals
                        ? "amount" in card
                          ? naira(card.value)
                          : card.value
                        : "…"}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      color: card.color,
                      bgcolor: `${card.color}12`,
                      borderRadius: 2,
                      p: 0.5,
                      height: "fit-content",
                    }}
                  >
                    {card.icon}
                  </Box>{" "}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={1.5}
          sx={{
            alignItems: { md: "center" },
            flexWrap: "wrap",
            rowGap: "10px",
            width: "100%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <TextField
              size="small"
              label="Reference"
              value={referenceInput}
              onChange={(event) => setReferenceInput(event.target.value)}
              fullWidth
              onKeyDown={(event) => {
                if (event.key === "Enter") setReference(referenceInput.trim());
              }}
            />
            <Button
              variant="contained"
              size="medium"
              startIcon={<SearchOutlined />}
              onClick={() => setReference(referenceInput.trim())}
            >
              Search
            </Button>
          </Box>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(event) => {
                setPage(0);
                setStatus(event.target.value);
              }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {[
                "PENDING",
                "SUCCESS",
                "FAILED",
                "ABANDONED",
                "REFUNDED",
                "PARTIALLY_REFUNDED",
              ].map((item) => (
                <MenuItem key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Provider</InputLabel>
            <Select
              value={provider}
              label="Provider"
              onChange={(event) => {
                setPage(0);
                setProvider(event.target.value);
              }}
            >
              <MenuItem value="">All providers</MenuItem>
              {["PAYSTACK", "FLUTTERWAVE", "BANK_TRANSFER", "MANUAL"].map(
                (item) => (
                  <MenuItem key={item} value={item}>
                    {item.replaceAll("_", " ")}
                  </MenuItem>
                ),
              )}
            </Select>
          </FormControl> */}
          <TextField
            size="small"
            type="date"
            label="From"
            slotProps={{ inputLabel: { shrink: true } }}
            value={from}
            onChange={(event) => {
              setPage(0);
              setFrom(event.target.value);
            }}
          />
          <TextField
            size="small"
            type="date"
            label="To"
            slotProps={{ inputLabel: { shrink: true } }}
            value={to}
            onChange={(event) => {
              setPage(0);
              setTo(event.target.value);
            }}
          />
        </Stack>
        {from && to && from > to && (
          <Alert severity="error" sx={{ mt: 1 }}>
            The start date must be before the end date.
          </Alert>
        )}
      </Paper>

      <TableContainer component={Paper} variant="outlined">
        <Table size="medium">
          <TableHead>
            <TableRow>
              {/* <TableCell>Reference</TableCell> */}
              <TableCell>Student</TableCell>
              <TableCell>Provider</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              {/* <TableCell>Amount Refunded</TableCell> */}
              <TableCell>Status</TableCell>
              <TableCell>Review</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {transactions.isLoading || transactions.isFetching ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 7 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : rows.length ? (
              rows.map((transaction) => (
                <TableRow hover key={txId(transaction)}>
                  {/* <TableCell>
                    <Typography
                      sx={{ fontFamily: "monospace", fontWeight: 700 }}
                    >
                      {transaction.reference}
                    </Typography>
                    {transaction.description && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {transaction.description}
                      </Typography>
                    )}
                  </TableCell> */}
                  <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    {personName(transaction)}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block" }}
                    >
                      {(transaction.student ?? transaction.student)?.email}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    {transaction.provider.replaceAll("_", " ")}
                  </TableCell>
                  <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    {formatDateAndTime(transaction.createdAt)}
                  </TableCell>
                  <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {naira(transaction.amount)}
                    </Typography>
                  </TableCell>
                  {/* <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    <Typography sx={{ fontWeight: 700 }}>
                      {transaction.invoices[0]?.refundedAmount
                        ? naira(transaction.invoices[0]?.refundedAmount)
                        : "-"}
                    </Typography>
                  </TableCell> */}
                  <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    <Chip
                      size="small"
                      color={statusColors[transaction.status] ?? "default"}
                      label={transaction.status.replaceAll("_", " ")}
                    />
                  </TableCell>
                  <TableCell sx={{ fontSize: { md: "14px", xs: "12px" } }}>
                    {transaction.reviewedAt ? (
                      <Chip size="small" color="success" label="Reviewed" />
                    ) : (
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Not reviewed"
                      />
                    )}
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: { md: "14px", xs: "12px" } }}
                  >
                    <Stack
                      direction="row"
                      sx={{ justifyContent: "flex-end" }}
                      spacing={1}
                    >
                      <Button
                        size="small"
                        onClick={() => setSelectedId(txId(transaction))}
                      >
                        Details
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                  <ReceiptLongOutlined
                    sx={{ fontSize: 48, color: "text.disabled" }}
                  />
                  <Typography>No transactions found</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={transactions.data?.pagination?.total ?? 0}
          page={page}
          onPageChange={(_, value) => setPage(value)}
          rowsPerPage={limit}
          onRowsPerPageChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 20, 50, 100]}
        />
      </TableContainer>

      {/* Transaction Details Dialog */}
      <Dialog
        open={!!selectedId}
        onClose={() => setSelectedId("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Transaction details</DialogTitle>
        <DialogContent dividers>
          {detail.isLoading ? (
            <CircularProgress />
          ) : selectedTransaction ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <Typography sx={{ fontWeight: 700, fontFamily: "monospace" }}>
                  {selectedTransaction.reference}
                </Typography>
                <Chip
                  size="small"
                  color={statusColors[selectedTransaction.status] ?? "default"}
                  label={selectedTransaction.status.replaceAll("_", " ")}
                />
              </Stack>
              {[
                ["Student", personName(selectedTransaction)],
                ["Provider", selectedTransaction.provider.replaceAll("_", " ")],
                ["Amount", naira(selectedTransaction.amount)],
                ["Created", formatDateAndTime(selectedTransaction.createdAt)],
                ["Paid", formatDateAndTime(selectedTransaction.paidAt)],
                [
                  "Provider transaction ID",
                  selectedTransaction.providerTransactionId || "—",
                ],
                ["Failure reason", selectedTransaction.failureReason || "—"],
              ].map(([label, value]) => (
                <Stack
                  key={label}
                  direction="row"
                  sx={{ justifyContent: "space-between", gap: 2 }}
                >
                  <Typography color="text.secondary">{label}</Typography>
                  <Typography sx={{ textAlign: "right" }}>{value}</Typography>
                </Stack>
              ))}
              {!!selectedTransaction.invoices?.length && (
                <Box>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    Invoices
                  </Typography>
                  {selectedTransaction.invoices.map((invoice) => (
                    <Stack key={invoice.id}>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography>Invoice</Typography>
                        <Typography>{invoice.invoiceNumber}</Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography>Total Amount</Typography>
                        <Typography>{naira(invoice.totalAmount)}</Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography>Amount Paid</Typography>
                        <Typography>
                          {invoice.amountPaid ? naira(invoice.amountPaid) : "-"}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "space-between" }}
                      >
                        <Typography>Amount Refunded</Typography>
                        <Typography>
                          {invoice.refundedAmount
                            ? naira(invoice.refundedAmount)
                            : "-"}
                        </Typography>
                      </Stack>
                    </Stack>
                  ))}
                </Box>
              )}
              {selectedTransaction.reviewNote && (
                <Alert severity="success" icon={<RuleOutlined />}>
                  <Typography variant="caption" sx={{ display: "block" }}>
                    Reviewed{" "}
                    {selectedTransaction.reviewedAt
                      ? formatDateAndTime(selectedTransaction.reviewedAt)
                      : ""}
                  </Typography>
                  {selectedTransaction.reviewNote}
                </Alert>
              )}
            </Stack>
          ) : (
            <Alert severity="error">
              Transaction details could not be loaded.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {selectedTransaction && !selectedTransaction.reviewedAt && (
            <Button variant="outlined" onClick={() => setReviewOpen(true)}>
              Mark as reviewed
            </Button>
          )}
          <Button onClick={() => setSelectedId("")}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog
        open={reviewOpen}
        onClose={() => !review.isPending && setReviewOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Record transaction review</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            multiline
            minRows={4}
            fullWidth
            label="Review note"
            slotProps={{ htmlInput: { maxLength: 1000 } }}
            value={reviewNote}
            onChange={(event) => setReviewNote(event.target.value)}
            helperText={`${reviewNote.length}/1000`}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={review.isPending}
            onClick={submitReview}
          >
            {review.isPending ? "Saving…" : "Save review"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TransactionsPage;
