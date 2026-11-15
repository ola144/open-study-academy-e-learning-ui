/* eslint-disable @typescript-eslint/no-explicit-any */
import { Refresh, Search } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  useAdminGetRefundDetailsQuery,
  useAdminGetRefundsQuery,
  useAdminReconcileRefundMutation,
} from "../hooks/useRefund";
import { toast } from "react-toastify";
import { RefundStatus, type IRefund, type RefundPerson } from "../api/refund";
import { naira } from "../utils/helperFunctions";

const refundStudentName = (student: IRefund["student"]) =>
  typeof student === "object" && student
    ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
      student.email ||
      "Student"
    : "Student";

const refundInvoiceNumber = (refund: IRefund) =>
  typeof refund.invoice === "object" && refund.invoice
    ? refund.invoice.invoiceNumber
    : (refund.invoiceId ?? "—");

const refundStatusColor = (
  status: IRefund["status"],
): "default" | "success" | "warning" | "error" | "info" =>
  status === RefundStatus.PROCESSED
    ? "success"
    : status === RefundStatus.FAILED || status === RefundStatus.NEEDS_ATTENTION
      ? "error"
      : status === RefundStatus.PENDING || status === RefundStatus.PROCESSING
        ? "info"
        : "warning";

const fullName = (person: string | RefundPerson | undefined) =>
  typeof person === "object" && person
    ? `${person.firstName ?? ""} ${person.lastName ?? ""}`.trim() ||
      person.email ||
      "—"
    : "—";

const AdminRefund = () => {
  const [refundPage, setRefundPage] = useState(1);
  const [refundLimit, setRefundLimit] = useState(10);
  const [refundStatus, setRefundStatus] = useState("");
  const [refundSearch, setRefundSearch] = useState("");

  const [selectedRefundId, setSelectedRefundId] = useState("");

  const reconcileRefundMutation = useAdminReconcileRefundMutation();
  const refunds = useAdminGetRefundsQuery(
    refundPage,
    refundLimit,
    refundStatus,
    refundSearch,
  );
  const selectedRefund = useAdminGetRefundDetailsQuery(selectedRefundId);

  const reconcileRefund = (refund: IRefund) => {
    reconcileRefundMutation.mutate(refund.id, {
      onSuccess: (response) => {
        toast.success(response.message || "Refund status refreshed");
      },
      onError: (error: any) =>
        toast.error(
          error.response?.data?.message ?? "Could not reconcile refund",
        ),
    });
  };

  return (
    <>
      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            select
            size="small"
            label="Refund status"
            value={refundStatus}
            onChange={(event) => {
              setRefundStatus(event.target.value);
              setRefundPage(1);
            }}
            sx={{ minWidth: 190 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {Object.values(RefundStatus).map((value) => (
              <MenuItem key={value} value={value}>
                {value.replaceAll("_", " ")}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            label="Search references"
            placeholder="Payment or refund reference"
            value={refundSearch}
            onChange={(event) => {
              setRefundSearch(event.target.value);
              setRefundPage(1);
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1 }}
          />
        </Stack>
      </Paper>
      {refunds.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void refunds.refetch()}
            >
              Retry
            </Button>
          }
        >
          Could not load refunds. Please try again.
        </Alert>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Requested</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {refunds.isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : refunds.data?.data?.length ? (
              refunds.data.data.map((refund) => (
                <TableRow hover key={refund.id}>
                  <TableCell>{refundStudentName(refund.student)}</TableCell>
                  <TableCell>{naira(refund.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={refund.status.replaceAll("_", " ")}
                      color={refundStatusColor(refund.status)}
                    />
                  </TableCell>
                  <TableCell>
                    {refund.createdAt
                      ? new Date(refund.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <Button
                        size="small"
                        onClick={() => setSelectedRefundId(refund.id)}
                      >
                        Details
                      </Button>
                      {refund.status !== RefundStatus.PROCESSED &&
                        refund.status !== RefundStatus.FAILED && (
                          <Tooltip title="Check the latest payment provider status">
                            <span>
                              <IconButton
                                aria-label={`Reconcile refund ${refund.refundReference}`}
                                size="small"
                                disabled={reconcileRefundMutation.isPending}
                                onClick={() => reconcileRefund(refund)}
                              >
                                {reconcileRefundMutation.isPending ? (
                                  <CircularProgress size={18} />
                                ) : (
                                  <Refresh fontSize="small" />
                                )}
                              </IconButton>
                            </span>
                          </Tooltip>
                        )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">
                    No refunds found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={refunds.data?.pagination?.total ?? 0}
        page={refundPage - 1}
        onPageChange={(_event, nextPage) => setRefundPage(nextPage + 1)}
        rowsPerPage={refundLimit}
        onRowsPerPageChange={(event) => {
          setRefundLimit(Number(event.target.value));
          setRefundPage(1);
        }}
        rowsPerPageOptions={[10, 20, 30, 40, 50, 100]}
        labelRowsPerPage="Rows"
      />

      <Dialog
        open={!!selectedRefundId}
        onClose={() => setSelectedRefundId("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Refund details</DialogTitle>
        <DialogContent dividers>
          {selectedRefund.isLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
              <CircularProgress />
            </Box>
          ) : selectedRefund.isError ? (
            <Alert severity="error">
              Could not load refund details. Close this dialog and try again.
            </Alert>
          ) : selectedRefund.data?.data ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">Status</Typography>
                <Chip
                  size="small"
                  label={selectedRefund.data.data.status.replaceAll("_", " ")}
                  color={refundStatusColor(selectedRefund.data.data.status)}
                />
              </Stack>
              <Divider />
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">Refund reference</Typography>
                <Typography sx={{ textAlign: "right", fontWeight: 600 }}>
                  {selectedRefund.data.data.refundReference}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">
                  Payment reference
                </Typography>
                <Typography sx={{ textAlign: "right" }}>
                  {selectedRefund.data.data.paymentReference}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">Invoice</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  {refundInvoiceNumber(selectedRefund.data.data)}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">Student</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  {refundStudentName(selectedRefund.data.data.student)}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">Amount</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {naira(selectedRefund.data.data.amount)}
                </Typography>
              </Stack>
              <Stack
                direction="row"
                sx={{ justifyContent: "space-between", gap: 2 }}
              >
                <Typography color="text.secondary">Initiated by</Typography>
                <Typography sx={{ textAlign: "right" }}>
                  {fullName(selectedRefund.data.data.initiatedBy)}
                </Typography>
              </Stack>
              {selectedRefund.data.data.reason && (
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    Reason
                  </Typography>
                  <Typography sx={{ overflowWrap: "anywhere" }}>
                    {selectedRefund.data.data.reason}
                  </Typography>
                </Box>
              )}
              {selectedRefund.data.data.failureReason && (
                <Alert severity="error">
                  {selectedRefund.data.data.failureReason}
                </Alert>
              )}
              {selectedRefund.data.data.lastPaystackStatus && (
                <Stack
                  direction="row"
                  sx={{ justifyContent: "space-between", gap: 2 }}
                >
                  <Typography color="text.secondary">
                    Provider status
                  </Typography>
                  <Typography sx={{ textTransform: "uppercase" }}>
                    {selectedRefund.data.data.lastPaystackStatus}
                  </Typography>
                </Stack>
              )}
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedRefundId("")}>Close</Button>
          {selectedRefund.data?.data &&
            selectedRefund.data.data.status !== RefundStatus.PROCESSED &&
            selectedRefund.data.data.status !== RefundStatus.FAILED && (
              <Button
                variant="contained"
                startIcon={<Refresh />}
                disabled={reconcileRefundMutation.isPending}
                onClick={() => reconcileRefund(selectedRefund.data!.data)}
              >
                Reconcile status
              </Button>
            )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminRefund;
