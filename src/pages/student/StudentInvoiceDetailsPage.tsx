import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  CheckCircleOutlined,
  PaymentsOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import type { Invoice, InvoiceItem } from "../../api/invoice";
import { statusColor } from "../../api/invoice";
import { useGetStudentInvoiceDetailQuery } from "../../hooks/useInvoice";
import { useStudentPaymentMutation } from "../../hooks/usePaymet";
import { naira } from "../../utils/helperFunctions";
import { useEffect } from "react";

type ItemBalance = {
  item: InvoiceItem;
  index: number;
  amount: number;
  paid: number;
  balance: number;
};

const getItemBalances = (invoice: Invoice): ItemBalance[] => {
  //Extract and normalize the item amounts
  // The map() method loops through every item in the invoice and creates a new array.
  // Result: [5000, 3000, 2000]
  const amounts = invoice.items.map((item) =>
    Math.max(0, Math.round(item.amount ?? 0)),
  );

  // Calculate the total of all invoice items
  const itemsTotal = amounts.reduce((sum, amount) => sum + amount, 0);

  const invoiceTotal = Math.max(0, Math.round(invoice.totalAmount));

  // Calculate the proportional amount for each item
  // BigInt() converts an integer into JavaScript's BigInt type. BigInt(5000); // 5000n BigInt(9000); // 9000n
  // Important: BigInt division removes the fractional part; it does not round to the nearest integer. i.e. console.log(7n / 2n); // 3n
  const netAmounts = amounts.map((amount) =>
    itemsTotal > 0
      ? Number((BigInt(amount) * BigInt(invoiceTotal)) / BigInt(itemsTotal))
      : 0,
  );

  let remainder =
    invoiceTotal - netAmounts.reduce((sum, amount) => sum + amount, 0);

  const remainderOrder = amounts
    .map((amount, index) => ({
      index,
      remainder:
        itemsTotal > 0
          ? Number((BigInt(amount) * BigInt(invoiceTotal)) % BigInt(itemsTotal))
          : 0,
    }))
    .sort((a, b) => b.remainder - a.remainder || a.index - b.index);

  for (let index = 0; remainder > 0 && remainderOrder.length; index += 1) {
    netAmounts[remainderOrder[index % remainderOrder.length].index] += 1;
    remainder -= 1;
  }

  let paidToAllocate = Math.min(
    Math.max(0, Math.round(invoice.amountPaid)),
    invoiceTotal,
  );

  return invoice.items.map((item, index) => {
    const paid = Math.min(netAmounts[index], paidToAllocate);
    paidToAllocate -= paid;

    return {
      item,
      index,
      amount: netAmounts[index],
      paid,
      balance: netAmounts[index] - paid,
    };
  });
};

const startCheckout = (
  invoice: Invoice,
  amount: number,
  initialize: ReturnType<typeof useStudentPaymentMutation>,
) => {
  const invoiceKey = invoice.id ?? "";
  const paymentAmount = amount;

  if (
    !invoiceKey ||
    !Number.isSafeInteger(paymentAmount) ||
    paymentAmount <= 0 ||
    paymentAmount > invoice.outstandingBalance
  ) {
    toast.error(
      "This payment amount is no longer available. Refresh the invoice.",
    );
    return;
  }

  initialize.mutate(
    { invoiceId: invoiceKey, amount: paymentAmount },
    {
      onSuccess: (checkout) => {
        sessionStorage.setItem("payment-return-invoice-id", invoiceKey);
        window.location.assign(checkout.authorizationUrl);
      },
      onError: (error) =>
        toast.error(
          axios.isAxiosError(error)
            ? (error.response?.data?.message ?? "Payment could not be started")
            : "Payment could not be started",
        ),
    },
  );
};

const canPayInvoice = (invoice: Invoice) =>
  !["PAID", "CANCELLED", "DRAFT"].includes(invoice.status) &&
  invoice.outstandingBalance > 0;

const StudentInvoiceDetailsPage = () => {
  const { invoiceId = "" } = useParams();

  const navigate = useNavigate();

  const invoiceQuery = useGetStudentInvoiceDetailQuery(invoiceId);
  const invoice = invoiceQuery.data;

  const payment = useStudentPaymentMutation();

  useEffect(() => {
    document.title = `Invoice Details | OpenStudy`;
  }, []);

  if (invoiceQuery.isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 300 }}>
        <CircularProgress aria-label="Loading invoice details" />
      </Box>
    );
  }

  if (invoiceQuery.isError || !invoice) {
    return (
      <Stack spacing={2}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate("/student/invoices")}
          sx={{ alignSelf: "flex-start" }}
        >
          Back to invoices
        </Button>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void invoiceQuery.refetch()}
            >
              Retry
            </Button>
          }
        >
          We couldn’t load this invoice. It may no longer be available.
        </Alert>
      </Stack>
    );
  }

  const itemBalances = getItemBalances(invoice);

  const nextUnpaidIndex = itemBalances.find((item) => item.balance > 0)?.index;

  const paidPercent =
    invoice.totalAmount > 0
      ? Math.min(100, (invoice.amountPaid / invoice.totalAmount) * 100)
      : 100;

  const isPayable = canPayInvoice(invoice);

  const payAmount = (amount: number) => startCheckout(invoice, amount, payment);

  return (
    <Stack spacing={3}>
      <Button
        startIcon={<ArrowBack />}
        onClick={() => navigate("/student/invoices")}
        sx={{ alignSelf: "flex-start" }}
      >
        Back to invoices
      </Button>

      <Paper variant="outlined" sx={{ p: { xs: 2, sm: 3 } }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
        >
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <ReceiptLongOutlined color="primary" />
              <Typography variant="h5" sx={{ fontWeight: 700, fontSize: 20 }}>
                {invoice.invoiceNumber}
              </Typography>
            </Stack>
            <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: 14 }}>
              {invoice.academicSession} · {invoice.term.toLowerCase()} term
              {invoice.dueDate &&
                ` · Due ${new Date(invoice.dueDate).toLocaleDateString()}`}
            </Typography>
          </Box>
          <Chip
            label={invoice.status.replaceAll("_", " ")}
            color={statusColor(invoice.status)}
          />
        </Stack>

        <Stack spacing={1} sx={{ mt: 3 }}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 12 }}
            >
              Payment progress
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, fontSize: 12 }}>
              {naira(invoice.amountPaid)} of {naira(invoice.totalAmount)}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={paidPercent}
            aria-label="Invoice payment progress"
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Stack>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 3, alignItems: { sm: "center" } }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Outstanding balance
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {naira(invoice.outstandingBalance)}
            </Typography>
          </Box>
          {isPayable && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<PaymentsOutlined />}
              disabled={payment.isPending}
              onClick={() => payAmount(invoice.outstandingBalance)}
            >
              {payment.isPending ? "Starting payment…" : "Pay full balance"}
            </Button>
          )}
        </Stack>
      </Paper>

      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
          Fee items
        </Typography>
        <Alert severity="info" sx={{ mb: 2 }}>
          Item payment allocation is not recorded by the current payment
          service. The item amounts and statuses below are estimated from the
          invoice total and aggregate payments, applied in the order shown.
        </Alert>
        {!invoice.allowInstallments && invoice.outstandingBalance > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This invoice requires full payment. Separate item checkout is
            unavailable unless an item’s remaining balance is the full invoice
            balance.
          </Alert>
        )}

        <Stack spacing={1.5}>
          {itemBalances.map(({ item, index, amount, paid, balance }) => {
            const itemStatus =
              balance === 0 ? "PAID" : paid > 0 ? "PARTIALLY PAID" : "UNPAID";

            const isNextItem = index === nextUnpaidIndex;

            const itemCanBePaid =
              isPayable &&
              isNextItem &&
              balance > 0 &&
              (invoice.allowInstallments ||
                balance === invoice.outstandingBalance);

            return (
              <Card
                variant="outlined"
                key={item.id ?? `${item.description}-${index}`}
              >
                <CardContent>
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    sx={{ justifyContent: "space-between" }}
                  >
                    <Stack direction="row" spacing={1.5} sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          display: "grid",
                          placeItems: "center",
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          bgcolor:
                            balance === 0 ? "success.50" : "action.hover",
                          color:
                            balance === 0 ? "success.main" : "text.secondary",
                          flexShrink: 0,
                        }}
                      >
                        {balance === 0 ? (
                          <CheckCircleOutlined fontSize="small" />
                        ) : (
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {index + 1}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: 13 }}>
                          {item.description || `Fee item ${index + 1}`}
                        </Typography>
                        {item.category && (
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ fontSize: 12 }}
                          >
                            {item.category.replaceAll("_", " ")}
                          </Typography>
                        )}
                        <Stack
                          direction="row"
                          spacing={2}
                          divider={<Divider orientation="vertical" flexItem />}
                          sx={{ mt: 1, flexWrap: "wrap" }}
                        >
                          <Typography variant="body2">
                            Due: <strong>{naira(amount)}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Paid: <strong>{naira(paid)}</strong>
                          </Typography>
                          <Typography variant="body2">
                            Remaining: <strong>{naira(balance)}</strong>
                          </Typography>
                        </Stack>
                      </Box>
                    </Stack>
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{
                        alignItems: "center",
                        justifyContent: { xs: "space-between", sm: "flex-end" },
                      }}
                    >
                      <Chip
                        size="small"
                        label={itemStatus}
                        color={
                          balance === 0
                            ? "success"
                            : paid > 0
                              ? "info"
                              : "default"
                        }
                      />
                      {balance > 0 && (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<PaymentsOutlined />}
                          disabled={!itemCanBePaid || payment.isPending}
                          onClick={() => payAmount(balance)}
                          aria-label={`Pay ${item.description || `fee item ${index + 1}`} balance`}
                        >
                          Pay item
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">Subtotal</Typography>
            <Typography>{naira(invoice.subtotal)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">Discount</Typography>
            <Typography>-{naira(invoice.discountAmount)}</Typography>
          </Stack>
          <Divider />
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>Invoice total</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {naira(invoice.totalAmount)}
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">Amount paid</Typography>
            <Typography>{naira(invoice.amountPaid)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography color="text.secondary">Amount refunded</Typography>
            <Typography>{naira(invoice.refundedAmount)}</Typography>
          </Stack>
          <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontWeight: 700 }}>Balance due</Typography>
            <Typography sx={{ fontWeight: 700 }}>
              {naira(invoice.outstandingBalance)}
            </Typography>
          </Stack>
        </Stack>
      </Paper>

      {invoice.notes && (
        <Alert severity="info">
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Invoice note
          </Typography>
          {invoice.notes}
        </Alert>
      )}
    </Stack>
  );
};

export default StudentInvoiceDetailsPage;
