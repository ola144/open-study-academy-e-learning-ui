/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import { AddOutlined, GroupsOutlined } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
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
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import { toast } from "react-toastify";
import axios from "axios";
import {
  amountInKobo,
  formatTime,
  getRemainingSeconds,
  naira,
} from "../../utils/helperFunctions";
import { useTeachersQuery } from "../../hooks/useTeacher";
import {
  useAdminApprovePayroll,
  useAdminCancelPayroll,
  useAdminCreatePayroll,
  useAdminInitiateTeacherPayrollTransfer,
  useGetAdminPayroll,
  useGetAdminPayrollDetails,
  useAdminFinalizeTeacherPayrollTransfer,
  useAdminResendAuthorizeOTP,
  useAdminVerifyPendingPayrollTransfer,
} from "../../hooks/usePayroll";
import type { IPayrollRecord, PayrollStatus } from "../../api/payroll";
import AdminBatchPayroll from "../../components/AdminBatchPayroll";
import AdminPendingBank from "../../components/AdminPendingBank";

const colors: Record<
  PayrollStatus,
  "default" | "success" | "warning" | "error" | "info"
> = {
  DRAFT: "default",
  APPROVED: "warning",
  TRANSFER_PENDING: "info",
  PAID: "success",
  REVERSED: "error",
  FAILED: "error",
  CANCELLED: "error",
};

const PayrollPage = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState<PayrollStatus | "">("");
  const [period, setPeriod] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [verificationOpen, setverificationOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction] = useState<
    "approve" | "paid" | "transfer" | "cancel" | "finalize" | null
  >(null);
  const [teacherId, setTeacherId] = useState("");
  const [payPeriod, setPayPeriod] = useState("");
  const [salary, setSalary] = useState("");
  const [allowances, setAllowances] = useState("");
  const [deductions, setDeductions] = useState("");
  const [notes, setNotes] = useState("");
  const [reference, setReference] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "BANK_TRANSFER" | "PAYSTACK" | "MANUAL"
  >("BANK_TRANSFER");
  const [reason, setReason] = useState("");
  const [activeTab, setActiveTab] = useState("payroll");
  const [generateBatchOpen, setGenerateBatchOpen] = useState(false);

  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState({});

  const payrolls = useGetAdminPayroll({
    page: page + 1,
    limit,
    period,
    status,
  });
  const teachers = useTeachersQuery(1, 10000);
  const detail = useGetAdminPayrollDetails(selectedId);
  const create = useAdminCreatePayroll();
  const approve = useAdminApprovePayroll();
  const cancel = useAdminCancelPayroll();
  const transfer = useAdminInitiateTeacherPayrollTransfer();
  const finalizeTransfer = useAdminFinalizeTeacherPayrollTransfer();
  const resendAuthorizeOTP = useAdminResendAuthorizeOTP();
  const verifyPendingPayrollTransfer = useAdminVerifyPendingPayrollTransfer();

  const resendAvailableAt =
    detail.data?.data?.transferOtpResendAvailableAt ?? null;

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(resendAvailableAt),
  );

  useEffect(() => {
    const updateCountdown = () => {
      setRemainingSeconds(getRemainingSeconds(resendAvailableAt));
    };

    updateCountdown(); // Update immediately on mount

    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval); // Cleanup on unmount
  }, [resendAvailableAt]);

  const rows = useMemo(() => {
    return payrolls.data?.data.payrolls ?? [];
  }, [payrolls.data?.data.payrolls]);

  const pagination = payrolls.data?.data.pagination;
  const teacherRows = teachers.data?.data ?? [];

  const summary = useMemo(
    () =>
      rows.reduce(
        (total, row) => ({
          draft: total.draft + (row.status === "DRAFT" ? 1 : 0),
          approved: total.approved + (row.status === "APPROVED" ? 1 : 0),
          paid: total.paid + (row.status === "PAID" ? 1 : 0),
          amount:
            total.amount + (row.status === "PAID" ? (row.netAmount ?? 0) : 0),
        }),
        { draft: 0, approved: 0, paid: 0, amount: 0 },
      ),
    [rows],
  );

  const resetCreate = () => {
    setTeacherId("");
    setPayPeriod("");
    setSalary("");
    setAllowances("");
    setDeductions("");
    setNotes("");
  };

  const submitCreate = () => {
    if (!teacherId || !/^\d{4}-(0[1-9]|1[0-2])$/.test(payPeriod) || !salary)
      return toast.error("Select a teacher, period, and base salary");
    create.mutate(
      {
        teacherId,
        period: payPeriod,
        baseSalary: amountInKobo(Number(salary)),
        allowances: amountInKobo(Number(allowances || 0)),
        deductions: amountInKobo(Number(deductions || 0)),
        notes: notes || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Payroll draft created");
          setCreateOpen(false);
          resetCreate();
        },
        onError: (error) =>
          toast.error(
            axios.isAxiosError(error)
              ? (error.response?.data?.message ?? "Could not create payroll")
              : "Could not create payroll",
          ),
      },
    );
  };

  const runAction = () => {
    if (!selectedId) return;
    if (action === "approve")
      approve.mutate(selectedId, {
        onSuccess: () => {
          toast.success("Payroll approved");
          setAction(null);
        },
        onError: showError,
      });
    if (action === "transfer") {
      transfer.mutate(selectedId, {
        onSuccess: () => {
          toast.success("Payroll transfer initiated");
          setAction(null);
          setverificationOpen(true);
        },
        onError: showError,
      });
    }
    if (action === "cancel") {
      if (!reason.trim()) return toast.error("Cancellation reason is required");
      cancel.mutate(
        { id: selectedId, payload: { reason: reason.trim() } },
        {
          onSuccess: () => {
            toast.success("Payroll cancelled");
            setAction(null);
          },
          onError: showError,
        },
      );
    }
  };

  function showError(error: unknown) {
    toast.error(
      axios.isAxiosError(error)
        ? (error.response?.data?.message ?? "Payroll update failed")
        : "Payroll update failed",
    );
  }

  const netPreview = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(
    Number(salary || 0) + Number(allowances || 0) - Number(deductions || 0),
  );

  const handleOnFinalizeTransfer = (id: string) => {
    setSelectedId(id);
    setverificationOpen(true);
  };

  const handleSubmit = () => {
    if (!/^\d{4,8}$/.test(otp)) return;

    finalizeTransfer.mutate(
      { id: selectedId, otp: otp },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          setOtp("");
          setverificationOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response.data.message);
        },
      },
    );
  };

  const handleResendOTP = () => {
    resendAuthorizeOTP.mutate(
      { id: selectedId },
      {
        onSuccess: (res) => {
          toast.success(res.message);
        },
        onError: (err: any) => {
          toast.error(err.response.data.message);
        },
      },
    );
  };

  const handleVerifyPendingPayrollTransfer = (id: string) => {
    setIsVerifying(() => ({
      [id]: true,
    }));
    verifyPendingPayrollTransfer.mutate(id, {
      onSuccess: (res) => {
        toast.success(res.message);
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
      },
      onSettled: () => {
        setIsVerifying(() => ({
          [id]: false,
        }));
      },
    });
  };

  useEffect(() => {
    document.title = `Payrolls | OpenStudy`;
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{ justifyContent: "space-between", width: "100%", mb: 3 }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Teacher payroll
          </Typography>
          <Typography color="text.secondary">
            Create, approve, and pay teacher payroll records.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          {activeTab === "payroll" && (
            <Button
              variant="contained"
              size="small"
              sx={{ height: "fit-content" }}
              startIcon={<AddOutlined />}
              onClick={() => setCreateOpen(true)}
            >
              Create payroll
            </Button>
          )}
          {activeTab === "batches" && (
            <Button
              variant="contained"
              size="small"
              sx={{ height: "fit-content" }}
              startIcon={<GroupsOutlined />}
              onClick={() => setGenerateBatchOpen(true)}
            >
              Generate batch
            </Button>
          )}
        </Stack>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        sx={{ mb: 2 }}
        aria-label="Payroll administration sections"
      >
        <Tab value="payroll" label="Payroll" id="payroll-tab" />
        <Tab value="batches" label="Bulk payroll" id="payroll-batches-tab" />
        <Tab
          value="banks"
          label="Pending bank accounts"
          id="payroll-banks-tab"
        />
      </Tabs>

      {activeTab === "banks" && <AdminPendingBank />}
      {activeTab === "batches" && (
        <AdminBatchPayroll
          setGenerateBatchOpen={setGenerateBatchOpen}
          generateBatchOpen={generateBatchOpen}
        />
      )}

      {activeTab === "payroll" && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {[
              ["Drafts", summary.draft],
              ["Approved", summary.approved],
              ["Paid", summary.paid],
              ["Paid amount", naira(summary.amount)],
            ].map(([label, value]) => (
              <Grid key={String(label)} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography color="text.secondary" variant="body2">
                      {label}
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 700, fontSize: "18px" }}
                    >
                      {value}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={2}
              sx={{ justifyContent: "space-between", display: "flex" }}
            >
              <TextField
                size="small"
                label="Period"
                placeholder="YYYY-MM"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value);
                  setPage(0);
                }}
                sx={{ maxWidth: 180 }}
              />
              <FormControl size="small" sx={{ minWidth: 160 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={status}
                  onChange={(e) => {
                    setStatus(e.target.value as PayrollStatus | "");
                    setPage(0);
                  }}
                >
                  <MenuItem value="">All statuses</MenuItem>
                  {[
                    "DRAFT",
                    "APPROVED",
                    "TRANSFER_PENDING",
                    "PAID",
                    "REVERSED",
                    "CANCELLED",
                  ].map((s) => (
                    <MenuItem key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Paper>

          {payrolls.isError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              Could not load payroll records.
            </Alert>
          )}
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Teacher</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Net amount</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {payrolls.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      Loading payroll...
                    </TableCell>
                  </TableRow>
                ) : (
                  rows.map((row) => (
                    <PayrollRow
                      key={row.id}
                      row={row}
                      isVerifying={isVerifying}
                      onFinalize={(id) => handleOnFinalizeTransfer(id)}
                      onVerify={(id) => handleVerifyPendingPayrollTransfer(id)}
                      onSelect={(id, next) => {
                        setSelectedId(id);
                        setAction(next);
                        setReference("");
                        setReason("");
                      }}
                    />
                  ))
                )}
                {!payrolls.isLoading && !rows.length && (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                      No payroll records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <TablePagination
              component="div"
              rowsPerPageOptions={[10, 25, 50]}
              count={pagination?.total ?? 0}
              page={page}
              rowsPerPage={limit}
              onPageChange={(_, next) => setPage(next)}
              onRowsPerPageChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(0);
              }}
            />
          </TableContainer>
        </>
      )}

      <Dialog
        open={activeTab === "payroll" && createOpen}
        onClose={() => !create.isPending && setCreateOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Create payroll draft</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Teacher</InputLabel>
              <Select
                label="Teacher"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              >
                {teacherRows.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Period"
              type="month"
              placeholder="YYYY-MM"
              value={payPeriod}
              onChange={(e) => setPayPeriod(e.target.value)}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                label="Base salary (₦)"
                type="number"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                fullWidth
              />
              <TextField
                label="Allowances (₦)"
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                fullWidth
              />
              <TextField
                label="Deductions (₦)"
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                fullWidth
              />
            </Stack>
            <Alert severity="info">Net amount: {netPreview}</Alert>
            <TextField
              label="Notes"
              multiline
              minRows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={create.isPending}
            onClick={submitCreate}
          >
            {create.isPending ? "Creating..." : "Create draft"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(action)}
        onClose={() =>
          !approve.isPending && !cancel.isPending && setAction(null)
        }
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>
          {action === "approve"
            ? "Approve payroll"
            : action === "transfer"
              ? "Initiate bank transfer"
              : action === "paid"
                ? "Record payment"
                : "Cancel payroll"}
        </DialogTitle>
        <DialogContent>
          {selectedId && detail.isLoading && (
            <Typography sx={{ mt: 2 }}>Loading payroll...</Typography>
          )}
          {action === "approve" && (
            <Typography sx={{ mt: 2 }}>
              Approve this payroll for payment?
            </Typography>
          )}
          {action === "transfer" && (
            <Typography sx={{ mt: 2 }}>
              Initiate a Paystack bank transfer for this payroll?
            </Typography>
          )}
          {action === "cancel" && (
            <TextField
              sx={{ mt: 1 }}
              label="Cancellation reason"
              multiline
              minRows={3}
              fullWidth
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          )}
          {action === "paid" && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Payment reference"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
              <FormControl fullWidth>
                <InputLabel>Payment method</InputLabel>
                <Select
                  label="Payment method"
                  value={paymentMethod}
                  onChange={(e) =>
                    setPaymentMethod(e.target.value as typeof paymentMethod)
                  }
                >
                  <MenuItem value="BANK_TRANSFER">Bank transfer</MenuItem>
                  <MenuItem value="PAYSTACK">Paystack</MenuItem>
                  <MenuItem value="MANUAL">Manual</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAction(null)}>Close</Button>
          <Button
            variant="contained"
            color={action === "cancel" ? "error" : "primary"}
            onClick={runAction}
          >
            {action === "approve"
              ? "Approve"
              : action === "transfer"
                ? "Initiate transfer"
                : action === "paid"
                  ? "Record payment"
                  : "Cancel payroll"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* OTP Dialog */}
      <Dialog
        open={verificationOpen}
        onClose={() => setverificationOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Authorize Payroll Transfer</DialogTitle>

        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Enter the OTP sent by Paystack to authorize this teacher payment.
          </Typography>

          <TextField
            fullWidth
            label="Transfer OTP"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))
            }
            placeholder="Enter OTP"
            slotProps={{
              htmlInput: {
                inputMode: "numeric",
                maxLength: 8,
              },
            }}
          />
          <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between" }}>
            <Typography variant="body2" color="text.secondary">
              {remainingSeconds > 0
                ? `Resend available in ${formatTime(remainingSeconds)}s`
                : ""}
            </Typography>
            <Button
              size="small"
              onClick={handleResendOTP}
              disabled={remainingSeconds > 0 || resendAuthorizeOTP.isPending}
            >
              {resendAuthorizeOTP.isPending ? "Resending..." : "Resend OTP"}
            </Button>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setverificationOpen(false)}
            disabled={finalizeTransfer.isPending}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!/^\d{4,8}$/.test(otp) || finalizeTransfer.isPending}
          >
            {finalizeTransfer.isPending
              ? "Authorizing..."
              : "Authorize Transfer"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PayrollPage;

function PayrollRow({
  row,
  onSelect,
  onFinalize,
  onVerify,
  isVerifying,
}: {
  row: IPayrollRecord;
  onSelect: (id: string, action: "approve" | "transfer" | "cancel") => void;
  onFinalize: (id: string) => void;
  onVerify: (id: string) => void;
  isVerifying: any;
}) {
  const teacher = row.teacher;
  return (
    <TableRow hover>
      <TableCell>
        <Typography sx={{ fontWeight: 600 }}>
          {teacher
            ? `${teacher.firstName} ${teacher.lastName}`
            : "Unknown teacher"}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {teacher?.email}
        </Typography>
      </TableCell>
      <TableCell>{row.period}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={row.status.replace("_", " ")}
          color={colors[row.status]}
        />
      </TableCell>
      <TableCell align="right">{naira(row.netAmount ?? 0)}</TableCell>
      <TableCell align="right">
        <Stack
          direction="row"
          sx={{ justifyContent: "flex-end" }}
          spacing={0.5}
        >
          {row.status === "DRAFT" && !row.payrollBatchId && (
            <Button size="small" onClick={() => onSelect(row.id, "approve")}>
              Approve
            </Button>
          )}
          {row.transferStatus === "OTP_REQUIRED" && (
            <Button size="small" onClick={() => onFinalize(row.id)}>
              Authorize
            </Button>
          )}
          {row.transferStatus === "PENDING" && (
            <Button
              size="small"
              variant="contained"
              disabled={isVerifying[row.id]}
              startIcon={isVerifying[row.id] && <CircularProgress size={22} />}
              onClick={() => onVerify(row.id)}
            >
              {isVerifying[row.id] ? "Verifying..." : "Verify"}
            </Button>
          )}
          {row.status === "APPROVED" && !row.payrollBatchId && (
            <>
              <Button size="small" onClick={() => onSelect(row.id, "transfer")}>
                Transfer
              </Button>
              <Button
                size="small"
                color="error"
                onClick={() => onSelect(row.id, "cancel")}
              >
                Cancel
              </Button>
            </>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );
}
