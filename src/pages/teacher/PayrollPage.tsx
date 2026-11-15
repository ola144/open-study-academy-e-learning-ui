import { useEffect, useMemo, useState } from "react";
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
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { naira } from "../../utils/helperFunctions";
import {
  useGetTeacherPayroll,
  useGetTeacherPayrollDetails,
  useDownloadTeacherPayslip,
} from "../../hooks/usePayroll";
import type { PayrollStatus } from "../../api/payroll";

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

const TeacherPayrollPage = () => {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [selectedId, setSelectedId] = useState("");
  const payrolls = useGetTeacherPayroll(page + 1, limit);
  const detail = useGetTeacherPayrollDetails(selectedId);
  const downloadPayslip = useDownloadTeacherPayslip();
  const data = payrolls.data?.data;

  const rows = useMemo(() => {
    return data?.payrolls ?? [];
  }, [data?.payrolls]);

  const summary = useMemo(
    () =>
      rows.reduce(
        (total, row) => ({
          approved:
            total.approved +
            (row.status === "APPROVED" ? (row.netAmount ?? 0) : 0),
          paid: total.paid + (row.status === "PAID" ? (row.netAmount ?? 0) : 0),
        }),
        { approved: 0, paid: 0 },
      ),
    [rows],
  );
  const selected = detail.data?.data;

  useEffect(() => {
    document.title = `Payrolls | OpenStudy`;
  }, []);

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          My payroll
        </Typography>
        <Typography color="text.secondary">
          Review your approved and paid salary records.
        </Typography>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        {[
          { label: "Approved", value: summary.approved },
          { label: "Paid", value: summary.paid },
          { label: "Records", value: rows.length },
        ].map((card) => (
          <Card key={card.label} variant="outlined" sx={{ flex: 1 }}>
            <CardContent>
              <Typography color="text.secondary" variant="body2">
                {card.label}
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, fontSize: "18px" }}
              >
                {card.label === "Records" ? card.value : naira(card.value)}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Stack>
      {payrolls.isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Could not load payroll history.
        </Alert>
      )}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Period</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Base salary</TableCell>
              <TableCell align="right">Net amount</TableCell>
              <TableCell align="right">Details</TableCell>
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
                <TableRow key={row.id} hover>
                  <TableCell>{row.period}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={row.status}
                      color={colors[row.status]}
                    />
                  </TableCell>
                  <TableCell align="right">{naira(row.baseSalary)}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>
                    {naira(row.netAmount ?? 0)}
                  </TableCell>
                  <TableCell align="right">
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ justifyContent: "flex-end" }}
                    >
                      <Button
                        size="small"
                        onClick={() => setSelectedId(row.id)}
                      >
                        View
                      </Button>
                      {row.status === "PAID" && (
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={downloadPayslip.isPending}
                          onClick={() =>
                            downloadPayslip.mutate(row.id, {
                              onError: () => undefined,
                            })
                          }
                        >
                          Payslip
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
            {!payrolls.isLoading && !rows.length && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                  No payroll records are available yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          rowsPerPageOptions={[10]}
          count={data?.pagination.total ?? 0}
          page={page}
          rowsPerPage={limit}
          onPageChange={(_, next) => setPage(next)}
          onRowsPerPageChange={(e) => {
            setLimit(Number(e.target.value));
            setPage(0);
          }}
        />
      </TableContainer>
      <Dialog
        open={Boolean(selectedId)}
        onClose={() => setSelectedId("")}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Payroll details</DialogTitle>
        <DialogContent>
          {detail.isLoading && <Typography>Loading...</Typography>}
          {detail.isError && (
            <Alert severity="error">Could not load payroll details.</Alert>
          )}
          {selected && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography>
                <strong>Period:</strong> {selected.period}
              </Typography>
              <Typography>
                <strong>Status:</strong> {selected.status}
              </Typography>
              <Typography>
                <strong>Base salary:</strong> {naira(selected.baseSalary)}
              </Typography>
              <Typography>
                <strong>Allowances:</strong> {naira(selected.allowances ?? 0)}
              </Typography>
              <Typography>
                <strong>Deductions:</strong> {naira(selected.deductions ?? 0)}
              </Typography>
              <Typography>
                <strong>Net amount:</strong> {naira(selected.netAmount ?? 0)}
              </Typography>
              {selected.paymentReference && (
                <Typography>
                  <strong>Payment reference:</strong>{" "}
                  {selected.paymentReference}
                </Typography>
              )}
              {selected.paymentMethod && (
                <Typography>
                  <strong>Payment method:</strong> {selected.paymentMethod}
                </Typography>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedId("")}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TeacherPayrollPage;
