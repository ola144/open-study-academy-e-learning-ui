import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
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
  Tabs,
  Tab,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccountBalanceWalletOutlined,
  CheckCircleOutlined,
  ReceiptLongOutlined,
  WarningAmberOutlined,
} from "@mui/icons-material";
import { invoiceId, statusColor } from "../../api/invoice";
import {
  useGetStudentInvoiceQuery,
  useGetStudentInvoiceSummaryQuery,
} from "../../hooks/useInvoice";
import { naira } from "../../utils/helperFunctions";
import StudentPaymentHistory from "../../components/StudentPaymentHistory";

export default function StudentInvoicesPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [tab, setTab] = useState(0);

  const navigate = useNavigate();
  const summary = useGetStudentInvoiceSummaryQuery();
  const invoices = useGetStudentInvoiceQuery(page, limit, undefined);

  useEffect(() => {
    document.title = `Invoices | OpenStudy`;
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          alignItems: { sm: "center" },
          mb: 3,
        }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            My Invoices & Payment History
          </Typography>
          <Typography color="text.secondary">
            View your school fee, payment history and make secure payments.
          </Typography>
        </Box>
      </Stack>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        sx={{ mb: 2 }}
        aria-label="Invoice and payment history tabs"
      >
        <Tab label="Invoices" />
        <Tab label="Payment history" />
      </Tabs>

      <Box role="tabpanel" hidden={tab !== 0}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            justifyContent: "space-between",
            alignItems: { sm: "center" },
            mb: 3,
          }}
          spacing={2}
        >
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Invoices
            </Typography>
          </Box>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All invoices</MenuItem>
            {["UNPAID", "PARTIALLY_PAID", "OVERDUE", "PAID", "CANCELLED"].map(
              (item) => (
                <MenuItem key={item} value={item}>
                  {item.replaceAll("_", " ")}
                </MenuItem>
              ),
            )}
          </TextField>
        </Stack>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {[
            {
              label: "Total billed",
              value: summary.data?.totalBilled,
              icon: <ReceiptLongOutlined sx={{ fontSize: "15px" }} />,
              color: "#28624e",
            },
            {
              label: "Amount paid",
              value: summary.data?.totalPaid,
              icon: <CheckCircleOutlined sx={{ fontSize: "15px" }} />,
              color: "#2e7d32",
            },
            {
              label: "Outstanding",
              value: summary.data?.outstandingBalance,
              icon: <AccountBalanceWalletOutlined sx={{ fontSize: "15px" }} />,
              color: "#b26a00",
            },
            {
              label: "Overdue invoices",
              value: summary.data?.overdueInvoices,
              icon: <WarningAmberOutlined sx={{ fontSize: "15px" }} />,
              color: "#c62828",
              count: true,
            },
          ].map((card) => (
            <Grid key={card.label} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        {card.label}
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, fontSize: "16px" }}
                      >
                        {summary.isLoading
                          ? "…"
                          : card.count
                            ? (card.value ?? 0)
                            : naira(card.value)}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        color: card.color,
                        bgcolor: `${card.color}12`,
                        borderRadius: 2,
                        height: "fit-content",
                        p: 0.5,
                      }}
                    >
                      {card.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Period</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Balance</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invoices.isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={28} />
                  </TableCell>
                </TableRow>
              ) : invoices.data?.data?.length ? (
                invoices.data.data.map((invoice) => (
                  <TableRow hover key={invoice.id}>
                    <TableCell>
                      <strong>{invoice.invoiceNumber}</strong>
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {invoice.academicSession}
                      <Typography variant="caption" sx={{ display: "block" }}>
                        {invoice.term} TERM
                      </Typography>
                    </TableCell>
                    <TableCell>{naira(invoice.totalAmount)}</TableCell>
                    <TableCell>
                      <strong>{naira(invoice.outstandingBalance)}</strong>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={invoice.status.replaceAll("_", " ")}
                        color={statusColor(invoice.status)}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "flex-end", gap: 1 }}
                      >
                        <Button
                          variant="outlined"
                          onClick={() =>
                            navigate(`/student/invoices/${invoiceId(invoice)}`)
                          }
                        >
                          Details
                        </Button>
                        {/* {!["PAID", "CANCELLED", "DRAFT"].includes(
                          invoice.status,
                        ) && (
                          <Button
                            variant="contained"
                            startIcon={<PaymentsOutlined />}
                            onClick={() => pay(invoice)}
                          >
                            Pay
                          </Button>
                        )} */}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    <ReceiptLongOutlined
                      sx={{ fontSize: 48, color: "text.disabled" }}
                    />
                    <Typography>No invoices found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={invoices.data?.pagination?.total ?? 0}
          page={(invoices.data?.pagination?.page ?? 0) - 1}
          onPageChange={(_event, nextPage) => setPage(nextPage + 1)}
          rowsPerPage={invoices.data?.pagination?.limit ?? 10}
          onRowsPerPageChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(1);
          }}
          rowsPerPageOptions={[10, 20, 30, 40, 50]}
          labelRowsPerPage="Rows"
        />
      </Box>

      <Box role="tabpanel" hidden={tab !== 1}>
        <StudentPaymentHistory />
      </Box>

      {/* <Dialog
        open={payOpen}
        onClose={() => !payment.isPending && setPayOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Pay invoice</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              You will be redirected to Paystack in a secure checkout.
            </Typography>
            <TextField
              type="number"
              label="Amount (₦)"
              disabled={!selectedInvoice?.allowInstallments}
              slotProps={{
                htmlInput: {
                  min: 0.01,
                  max: (selectedInvoice?.outstandingBalance ?? 0) / 100,
                  step: "0.01",
                },
              }}
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              helperText={
                selectedInvoice?.allowInstallments
                  ? `Balance: ${naira(selectedInvoice.outstandingBalance)}`
                  : "Full payment is required for this invoice."
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={payment.isPending}
            onClick={startPayment}
          >
            {payment.isPending ? "Starting…" : "Continue to Paystack"}
          </Button>
        </DialogActions>
      </Dialog> */}
    </Box>
  );
}
