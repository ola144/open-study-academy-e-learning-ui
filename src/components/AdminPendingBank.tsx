import {
  Alert,
  Button,
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
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { toast } from "react-toastify";
import {
  useAdminRejectTeacherBank,
  useAdminVerifyTeacherBank,
  useGetTeacherPendingBanks,
} from "../hooks/usePayroll";
import axios from "axios";

const AdminPendingBank = () => {
  const pending = useGetTeacherPendingBanks();
  const verify = useAdminVerifyTeacherBank();
  const reject = useAdminRejectTeacherBank();
  const [teacherId, setTeacherId] = useState("");
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const rows = pending.data?.data ?? [];

  const verifyAccount = (id: string) =>
    verify.mutate(id, {
      onSuccess: () => toast.success("Bank account verified"),
      onError: showPayrollError,
    });

  return (
    <>
      {pending.isLoading && (
        <Alert severity="info">Loading pending bank accounts...</Alert>
      )}
      {pending.isError && (
        <Alert severity="error">Could not load pending bank accounts.</Alert>
      )}
      {!pending.isLoading && !rows.length && (
        <Alert severity="info">No pending teacher bank accounts.</Alert>
      )}
      {!!rows.length && (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Teacher</TableCell>
                <TableCell>Bank</TableCell>
                <TableCell>Account</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, index) => {
                const id = String(row.teacher?.id ?? row.teacher?._id ?? "");
                return (
                  <TableRow key={row.id ?? `${id}-${index}`}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 600 }}>
                        {row.teacher
                          ? `${row.teacher.firstName} ${row.teacher.lastName}`
                          : "Unknown teacher"}
                      </Typography>
                      <Typography variant="caption">
                        {row.teacher?.email}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {row.bankName} ({row.bankCode})
                    </TableCell>
                    <TableCell>
                      {row.accountName}
                      <br />
                      •••• {row.accountNumberLast4}
                    </TableCell>
                    <TableCell>
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleDateString()
                        : "—"}
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        sx={{ justifyContent: "flex-end" }}
                        spacing={1}
                      >
                        <Button
                          size="small"
                          variant="contained"
                          disabled={verify.isPending || !id}
                          onClick={() => verifyAccount(id)}
                        >
                          Verify
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          disabled={!id}
                          onClick={() => {
                            setTeacherId(id);
                            setReason("");
                            setRejectOpen(true);
                          }}
                        >
                          Reject
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <Dialog
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Reject bank account</DialogTitle>
        <DialogContent>
          <TextField
            sx={{ mt: 1 }}
            label="Reason"
            multiline
            minRows={3}
            fullWidth
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectOpen(false)}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={reject.isPending || reason.trim().length < 3}
            onClick={() =>
              reject.mutate(
                { id: teacherId, reason: reason.trim() },
                {
                  onSuccess: () => {
                    toast.success("Bank account rejected");
                    setRejectOpen(false);
                  },
                  onError: showPayrollError,
                },
              )
            }
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminPendingBank;

function showPayrollError(error: unknown) {
  toast.error(
    axios.isAxiosError(error)
      ? (error.response?.data?.message ?? "Action failed")
      : "Action failed",
  );
}
