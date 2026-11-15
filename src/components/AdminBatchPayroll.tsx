/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  CheckCircleOutlined,
  GroupsOutlined,
  RefreshOutlined,
  SendOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
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
  IconButton,
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
  Tooltip,
  Typography,
} from "@mui/material";
import { naira } from "../utils/helperFunctions";
import {
  batchColors,
  type IPayrollBatch,
  type PayrollBatchStatus,
} from "../api/batch";
import {
  useAdminApproveBatchPayrollMutation,
  useAdminGenerateBatchPayrollMutation,
  useAdminGetBatchPayroll,
  useAdminInitiateBatchPayrollMutation,
  useAdminReconcileBatchPayrollTransferMutation,
  useGetAdminPayrollBatchDetails,
} from "../hooks/useBatch";
import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const AdminBatchPayroll = ({
  setGenerateBatchOpen,
  generateBatchOpen,
}: {
  setGenerateBatchOpen: (value: boolean) => void;
  generateBatchOpen: boolean;
}) => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [period, setPeriod] = useState("");
  const [status, setStatus] = useState<PayrollBatchStatus | "">("");

  const [batchActionId, setBatchActionId] = useState("");
  const [batchAction, setBatchAction] = useState<"approve" | "transfer" | null>(
    null,
  );

  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [isReconciling, setIsReconciling] = useState<any>({});

  const [batchPeriodInput, setBatchPeriodInput] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  const batches = useAdminGetBatchPayroll({
    page: page + 1,
    limit: limit,
    period: period,
    status: status,
  });

  const batchDetails = useGetAdminPayrollBatchDetails(selectedBatchId);

  const approveBatch = useAdminApproveBatchPayrollMutation();
  const transferBatch = useAdminInitiateBatchPayrollMutation();
  const generateBatch = useAdminGenerateBatchPayrollMutation();
  const reconcilePayroll = useAdminReconcileBatchPayrollTransferMutation();

  const batchRows = batches.data?.data.batches ?? [];

  const selectedBatch = batchRows.find((batch) => batch.id === batchActionId);

  const handleOnApprove = (id: string) => {
    setBatchActionId(id);
    setBatchAction("approve");
  };

  const handleOnTransfer = (id: string) => {
    setBatchActionId(id);
    setBatchAction("transfer");
  };

  const handleOnView = (id: string) => {
    setSelectedBatchId(id);
  };

  const runBatchAction = () => {
    if (!batchActionId || !batchAction) return;

    const mutation = batchAction === "approve" ? approveBatch : transferBatch;
    mutation.mutate(batchActionId, {
      onSuccess: (response) => {
        toast.success(
          response.message ||
            (batchAction === "approve"
              ? "Payroll batch approved"
              : "Bulk payroll transfer initiated"),
        );
        setBatchAction(null);
        setBatchActionId("");
      },
      onError: showError,
    });
  };

  const submitBatchGeneration = () => {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(batchPeriodInput)) {
      toast.error("Choose a valid payroll month");
      return;
    }

    generateBatch.mutate(
      { period: batchPeriodInput },
      {
        onSuccess: (response) => {
          toast.success(response.message || "Payroll batch generated");
          setGenerateBatchOpen(false);
          setPeriod(batchPeriodInput);
          setStatus("");
          setPage(0);
        },
        onError: showError,
      },
    );
  };

  const handleReconcilePayrl = (id: string) => {
    setIsReconciling(() => ({
      [id]: true,
    }));

    reconcilePayroll.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.message || "Payroll reconsile completed");
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
      },
      onSettled: () => {
        setIsReconciling(() => ({
          [id]: false,
        }));
      },
    });
  };

  return (
    <Stack spacing={2}>
      <Alert severity="info">
        Bulk payroll batches collect eligible individual payroll drafts for a
        period. Review each batch, approve it, then initiate its Paystack
        transfers.
      </Alert>
      <Paper
        variant="outlined"
        sx={{ p: 2, display: "flex", justifyContent: "space-between" }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ alignItems: { sm: "center" } }}
        >
          <TextField
            label="Period"
            type="month"
            size="small"
            value={period}
            onChange={(event) => {
              setPeriod(event.target.value);
              setPage(0);
            }}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ minWidth: { sm: 190 } }}
          />
          <FormControl size="small" sx={{ minWidth: 210 }}>
            <InputLabel>Batch status</InputLabel>
            <Select
              label="Batch status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as PayrollBatchStatus | "");
                setPage(0);
              }}
            >
              <MenuItem value="">All statuses</MenuItem>
              {Object.keys(batchColors).map((value) => (
                <MenuItem key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
        <Stack direction="row" sx={{ gap: 1 }}>
          <Tooltip title="Refetch payrolls">
            <IconButton
              size="small"
              sx={{ height: "fit-content" }}
              onClick={() => batches.refetch()}
              aria-label={`Refresh batches`}
            >
              <RefreshOutlined />
            </IconButton>
          </Tooltip>
        </Stack>
      </Paper>
      {batches.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => batches.refetch()}
            >
              Retry
            </Button>
          }
        >
          Could not load payroll batches.
        </Alert>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              {/* <TableCell>Batch</TableCell> */}
              <TableCell>Period</TableCell>
              <TableCell align="right">Employees</TableCell>
              <TableCell align="right">Total amount</TableCell>
              <TableCell>Transfer progress</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {batches.isLoading || batches.isFetching ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                  <CircularProgress size={26} />
                </TableCell>
              </TableRow>
            ) : batchRows.length ? (
              batchRows.map((batch) => (
                <TableRow hover key={batch.id}>
                  {/* <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {batch.batchNumber}
                    </Typography>
                  </TableCell> */}
                  <TableCell>{batch.period}</TableCell>
                  <TableCell align="right">{batch.totalEmployees}</TableCell>
                  <TableCell align="right">
                    {naira(batch.totalAmount)}
                  </TableCell>
                  <TableCell>
                    {batch.successfulCount} successful
                    {batch.failedCount > 0 && ` · ${batch.failedCount} failed`}
                    {batch.pendingCount > 0 &&
                      ` · ${batch.pendingCount} pending`}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={batchColors[batch.status] ?? "default"}
                      label={batch.status.replaceAll("_", " ")}
                    />
                  </TableCell>
                  <TableCell>
                    {batch.createdAt
                      ? new Date(batch.createdAt).toLocaleDateString()
                      : "—"}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <Tooltip title="Review batch employees and amounts">
                        <IconButton
                          size="small"
                          aria-label={`View payroll batch ${batch.batchNumber}`}
                          onClick={() => handleOnView(batch.id)}
                        >
                          <VisibilityOutlined fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {batch.status === "PENDING_APPROVAL" && (
                        <Button
                          size="small"
                          onClick={() => handleOnApprove(batch.id)}
                        >
                          Approve
                        </Button>
                      )}
                      {batch.status === "APPROVED" && (
                        <Button
                          size="small"
                          color="primary"
                          onClick={() => handleOnTransfer(batch.id)}
                        >
                          Transfer
                        </Button>
                      )}
                      {batch.status === "PROCESSING" && (
                        <Button
                          size="small"
                          onClick={() => handleReconcilePayrl(batch.id)}
                          variant="contained"
                          color="success"
                          disabled={isReconciling[batch.id]}
                          startIcon={
                            isReconciling[batch.id] && (
                              <CircularProgress size={18} />
                            )
                          }
                        >
                          {isReconciling[batch.id]
                            ? "Reconciling..."
                            : "Reconcile"}
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                  <GroupsOutlined
                    sx={{ fontSize: 44, color: "text.disabled", mb: 1 }}
                  />
                  <Typography sx={{ fontWeight: 600 }}>
                    No payroll batches found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Generate a batch from eligible draft payrolls for a month.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={batches.data?.data.pagination?.total ?? 0}
          page={page}
          rowsPerPage={limit}
          rowsPerPageOptions={[10, 25, 50, 100]}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => setLimit(Number(event.target.value))}
        />
      </TableContainer>

      {/* Batch Actions */}
      <Dialog
        open={Boolean(batchAction)}
        onClose={() =>
          !approveBatch.isPending &&
          !transferBatch.isPending &&
          (setBatchAction(null), setBatchActionId(""))
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {batchAction === "approve"
            ? "Approve payroll batch?"
            : "Initiate bulk payroll transfer?"}
        </DialogTitle>
        <DialogContent dividers>
          {selectedBatch ? (
            <Stack spacing={2} sx={{ pt: 1 }}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Stack spacing={1}>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography color="text.secondary">Batch</Typography>
                    <Typography sx={{ fontWeight: 600 }}>
                      {selectedBatch.batchNumber}
                    </Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography color="text.secondary">Period</Typography>
                    <Typography>{selectedBatch.period}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography color="text.secondary">Employees</Typography>
                    <Typography>{selectedBatch.totalEmployees}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    sx={{ justifyContent: "space-between", gap: 2 }}
                  >
                    <Typography color="text.secondary">Total amount</Typography>
                    <Typography sx={{ fontWeight: 700 }}>
                      {naira(selectedBatch.totalAmount)}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
              <Alert
                severity={batchAction === "transfer" ? "error" : "warning"}
              >
                {batchAction === "approve"
                  ? "Approving confirms this payroll batch is ready for payment. Verify the employees and total before continuing."
                  : "This sends bulk transfer instructions to Paystack for every payroll in this approved batch. Confirm the batch and total carefully; do not retry if the request times out."}
              </Alert>
            </Stack>
          ) : (
            <Alert severity="info">Loading selected batch…</Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setBatchAction(null);
              setBatchActionId("");
            }}
            disabled={approveBatch.isPending || transferBatch.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color={batchAction === "transfer" ? "error" : "primary"}
            disabled={
              !selectedBatch ||
              approveBatch.isPending ||
              transferBatch.isPending
            }
            startIcon={
              approveBatch.isPending || transferBatch.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : batchAction === "approve" ? (
                <CheckCircleOutlined />
              ) : (
                <SendOutlined />
              )
            }
            onClick={runBatchAction}
          >
            {approveBatch.isPending || transferBatch.isPending
              ? "Processing…"
              : batchAction === "approve"
                ? "Approve batch"
                : "Initiate transfers"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Batch */}
      <Dialog
        open={generateBatchOpen}
        onClose={() => !generateBatch.isPending && setGenerateBatchOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Generate bulk payroll batch</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              This creates a reviewable batch from every eligible, unbatched
              draft payroll for the selected month. It does not approve the
              batch or send any money.
            </Alert>
            <TextField
              required
              fullWidth
              label="Payroll period"
              type="month"
              value={batchPeriodInput}
              onChange={(event) => setBatchPeriodInput(event.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              error={
                !!batchPeriodInput &&
                !/^\d{4}-(0[1-9]|1[0-2])$/.test(batchPeriodInput)
              }
              helperText="All eligible draft payroll records for this period will be included."
            />
            <Alert severity="warning">
              Each included payroll must have a valid amount and a verified
              Paystack recipient. Review the generated batch before approval.
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setGenerateBatchOpen(false)}
            disabled={generateBatch.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={
              generateBatch.isPending ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <GroupsOutlined />
              )
            }
            disabled={
              generateBatch.isPending ||
              !/^\d{4}-(0[1-9]|1[0-2])$/.test(batchPeriodInput)
            }
            onClick={submitBatchGeneration}
          >
            {generateBatch.isPending ? "Generating…" : "Generate batch"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Batch Details */}
      <Dialog
        open={Boolean(selectedBatchId)}
        onClose={() => setSelectedBatchId("")}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Bulk payroll batch details</DialogTitle>
        <DialogContent dividers>
          {batchDetails.isLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 6 }}>
              <CircularProgress aria-label="Loading batch details" />
            </Box>
          ) : batchDetails.isError || !batchDetails.data?.data ? (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => void batchDetails.refetch()}
                >
                  Retry
                </Button>
              }
            >
              Could not load the batch details.
            </Alert>
          ) : (
            <BatchDetails batch={batchDetails.data.data} />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedBatchId("")}>Close</Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default AdminBatchPayroll;

function showError(error: unknown) {
  toast.error(
    axios.isAxiosError(error)
      ? (error.response?.data?.message ?? "Payroll update failed")
      : "Payroll update failed",
  );
}

function BatchDetails({ batch }: { batch: IPayrollBatch }) {
  return (
    <Stack spacing={2.5} sx={{ pt: 1 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ justifyContent: "space-between", alignItems: { sm: "center" } }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {batch.batchNumber}
          </Typography>
          <Typography color="text.secondary">
            Payroll period {batch.period}
          </Typography>
        </Box>
        <Chip
          color={batchColors[batch.status] ?? "default"}
          label={batch.status.replaceAll("_", " ")}
        />
      </Stack>
      <Grid container spacing={1.5}>
        {[
          ["Employees", String(batch.totalEmployees)],
          ["Batch total", naira(batch.totalAmount)],
          ["Successful", String(batch.successfulCount)],
          ["Failed", String(batch.failedCount)],
          ["Pending", String(batch.pendingCount)],
        ].map(([label, value]) => (
          <Grid key={label} size={{ xs: 6, sm: 4, md: 2.4 }}>
            <Card variant="outlined">
              <CardContent sx={{ "&:last-child": { pb: 2 } }}>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography sx={{ fontWeight: 700 }}>{value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {!batch.payrolls?.length ? (
        <Alert severity="warning">
          Payroll records were not included in the batch details response.
        </Alert>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Teacher</TableCell>
                <TableCell>Payroll status</TableCell>
                <TableCell>Transfer status</TableCell>
                <TableCell align="right">Base salary</TableCell>
                <TableCell align="right">Net amount</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {batch.payrolls.map((payroll) => (
                <TableRow key={payroll.id}>
                  <TableCell>
                    <Typography sx={{ fontWeight: 600 }}>
                      {payroll.teacher
                        ? `${payroll.teacher.firstName} ${payroll.teacher.lastName}`
                        : "Unknown teacher"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {payroll.teacher?.email ?? ""}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={payroll.status.replaceAll("_", " ")}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={payroll.transferStatus.replaceAll("_", " ")}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {naira(payroll.baseSalary)}
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {naira(payroll.netAmount)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Stack>
  );
}
