/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AccountBalanceOutlined, EditOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import axios from "axios";
import {
  useGetTeacherBankAccount,
  useTeacherCreateBankAccount,
  useTeacherUpdateBankAccount,
} from "../hooks/usePayroll";
import type { TeacherBankPayload } from "../api/payroll";
import { useGetBanksQuery } from "../hooks/useBank";

const empty: TeacherBankPayload = {
  bankCode: "",
  bankName: "",
  accountNumber: "",
  accountName: "",
};

export default function TeacherBankAccountTab() {
  const paystackBankQuery = useGetBanksQuery();
  const account = useGetTeacherBankAccount();
  const create = useTeacherCreateBankAccount();
  const update = useTeacherUpdateBankAccount();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);

  const data = account.data?.data;

  const paystackBanks = useMemo(() => {
    return paystackBankQuery.data?.data;
  }, [paystackBankQuery.data?.data]);

  const openDialog = () => {
    setOpen(true);
  };

  useEffect(() => {
    if (account.isError) setOpen(false);
  }, [account.isError]);

  const submit = () => {
    const bank = paystackBanks?.find((item) => item.code === form?.bankCode);

    if (
      !bank?.code ||
      !form.bankName ||
      !/^\d{10}$/.test(form.accountNumber) ||
      form.accountName.trim().length < 3
    ) {
      toast.error(
        "Select a bank and enter a valid account number and holder name.",
      );
      return;
    }
    const payload = {
      bankCode: bank.code,
      bankName: form.bankName,
      accountName: form.accountName.trim(),
      accountNumber: form.accountNumber.trim(),
    };
    if (data?.hasAccount) update.mutate(payload, onOptions);
    else create.mutate(payload, onOptions);
  };

  const onOptions = {
    onSuccess: () => {
      toast.success("Bank account submitted for verification");
      setOpen(false);
    },
    onError: (error: unknown) =>
      toast.error(
        axios.isAxiosError(error)
          ? (error.response?.data?.message ?? "Could not save bank account")
          : "Could not save bank account",
      ),
  };

  return (
    <Box>
      {account.isLoading && <CircularProgress size={28} />}
      {account.isError && (
        <Alert severity="error">Could not load bank account details.</Alert>
      )}
      {!account.isLoading && !account.isError && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            sx={{ justifyContent: "space-between" }}
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={2}
              sx={{ alignItems: "flex-start" }}
            >
              <AccountBalanceOutlined color="primary" />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Bank account
                </Typography>
                {data?.hasAccount ? (
                  <>
                    <Typography>
                      {data.bankName} •••• {data.accountNumberLast4}
                    </Typography>
                    <Typography color="text.secondary">
                      {data.accountName}
                    </Typography>
                    <Chip
                      sx={{ mt: 1 }}
                      size="small"
                      label={data.status}
                      color={
                        data.status === "VERIFIED"
                          ? "success"
                          : data.status === "REJECTED"
                            ? "error"
                            : "warning"
                      }
                    />
                    {data.rejectionReason && (
                      <Alert severity="error" sx={{ mt: 1 }}>
                        {data.rejectionReason}
                      </Alert>
                    )}
                  </>
                ) : (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    No bank account has been submitted.
                  </Typography>
                )}
              </Box>
            </Stack>
            <Button
              variant="contained"
              size="small"
              sx={{ height: "fit-content" }}
              startIcon={<EditOutlined />}
              onClick={openDialog}
            >
              {data?.hasAccount ? "Update account" : "Add account"}
            </Button>
          </Stack>
        </Paper>
      )}

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {data?.hasAccount ? "Update bank account" : "Create bank account"}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Bank</InputLabel>
              <Select
                label="Bank"
                value={form.bankCode}
                onChange={(e) => {
                  const selected = paystackBanks?.find(
                    (bank) => bank.code === e.target.value,
                  );
                  setForm({
                    ...form,
                    bankCode: e.target.value,
                    bankName: selected?.name ?? "",
                  });
                }}
              >
                {paystackBanks?.map((bank) => (
                  <MenuItem key={bank.code} value={bank.code}>
                    {bank.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Account number"
              value={form.accountNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  accountNumber: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              slotProps={{ htmlInput: { inputMode: "numeric" } }}
              helperText="10 digits"
            />
            <TextField
              label="Account holder name"
              value={form.accountName}
              onChange={(e) =>
                setForm({ ...form, accountName: e.target.value })
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={create.isPending || update.isPending}
            onClick={submit}
          >
            {create.isPending || update.isPending ? "Saving..." : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
