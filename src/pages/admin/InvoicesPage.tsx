/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
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
  IconButton,
  MenuItem,
  Paper,
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
  Tooltip,
  Typography,
} from "@mui/material";
import {
  Add,
  DeleteOutlined,
  GroupsOutlined,
  PublishOutlined,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  feeCategories,
  invoiceId,
  statusColor,
  type Invoice,
} from "../../api/invoice";
import { useClassQuery } from "../../hooks/useClass";
import {
  useCancelInvoiceMutation,
  useCreateDraftInvoiceMutation,
  useCreateInvoiceMutation,
  useGenerateClassInvoiceMutation,
  useGetAdminInvoiceQuery,
  useIssueClassInvoiceMutation,
  useIssueInvoiceMutation,
  useUnissuedInvoiceMutation,
  useUpdateDraftInvoiceMutation,
} from "../../hooks/useInvoice";
import { useStudentsQuery } from "../../hooks/useStudent";
import { amountInKobo, naira, studentName } from "../../utils/helperFunctions";
import { queryClient } from "../../app/queryClient";
import AdminRefund from "../../components/AdminRefund";
import { Link, useNavigate } from "react-router-dom";

const emptyItem: {
  description: string;
  category: (typeof feeCategories)[number];
  amount: string;
} = { description: "", category: "TUITION", amount: "" };

const InvoicesPage = () => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [classGenerateOpen, setClassGenerateOpen] = useState(false);
  const [classIssueOpen, setClassIssueOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [studentId, setStudentId] = useState("");
  const [classId, setClassId] = useState("");

  const [session, setSession] = useState(
    `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  );
  const [term, setTerm] = useState<"FIRST" | "SECOND" | "THIRD">("FIRST");

  const [dueDate, setDueDate] = useState("");
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState("");

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);

  const [selectEditInvoice, setSelectEditInvoice] = useState<Invoice | null>(
    null,
  );

  const [items, setItems] = useState([{ ...emptyItem }]);
  const [allowInstallments, setAllowInstallments] = useState(false);

  const [classGenerateId, setClassGenerateId] = useState("");
  const [classSession, setClassSession] = useState(
    `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  );
  const [classTerm, setClassTerm] = useState<"FIRST" | "SECOND" | "THIRD">(
    "FIRST",
  );
  const [classDueDate, setClassDueDate] = useState("");
  const [classDiscount, setClassDiscount] = useState(0);
  const [classItems, setClassItems] = useState([{ ...emptyItem }]);
  const [classInstallments, setClassInstallments] = useState(false);
  const [classInstallmentCount, setClassInstallmentCount] = useState<number>(2);
  const [installmentCount, setInstallmentCount] = useState<number>(2);
  const [classNotes, setClassNotes] = useState("");
  const [classIssueId, setClassIssueId] = useState("");
  const [classIssueSession, setClassIssueSession] = useState(
    `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`,
  );
  const [classIssueTerm, setClassIssueTerm] = useState<
    "FIRST" | "SECOND" | "THIRD"
  >("FIRST");

  const classes = useClassQuery();

  const students = useStudentsQuery(1, 1000000);

  const invoices = useGetAdminInvoiceQuery(page, limit, status);

  const createMutation = useCreateInvoiceMutation();
  const createDraftMutation = useCreateDraftInvoiceMutation();
  const updateDraftMutation = useUpdateDraftInvoiceMutation();
  const generateClassMutation = useGenerateClassInvoiceMutation();
  const issueClassMutation = useIssueClassInvoiceMutation();

  const issueMutation = useIssueInvoiceMutation();
  const unissuedMutation = useUnissuedInvoiceMutation();

  const cancelMutation = useCancelInvoiceMutation();

  const navigate = useNavigate();

  function reset() {
    setSelectEditInvoice(null);
    setStudentId("");
    setItems([{ ...emptyItem }]);
    setDiscount(0);
    setNotes("");
    setDueDate("");
    setAllowInstallments(false);
  }

  const selectedStudent = students.data?.data?.find(
    (student) => (student.id ?? "") === studentId,
  );

  const selectedClassId = classId || selectedStudent?.class?.id || "";

  const subtotal = items.reduce(
    (sum, item) => sum + (Number(item.amount) || 0),
    0,
  );

  // const refundableAmount = refundInvoice
  //   ? Math.max(
  //       0,
  //       refundInvoice.amountPaid -
  //         (refundInvoice.refundedAmount ?? 0) -
  //         (refundInvoice.refundPendingAmount ?? 0),
  //     )
  //   : 0;

  // const requestedRefundAmount = Number(refundAmount);
  // const isRefundAmountValid =
  //   /^\d+(?:\.\d{1,2})?$/.test(refundAmount) &&
  //   Number.isFinite(requestedRefundAmount) &&
  //   requestedRefundAmount > 0 &&
  //   Number.isSafeInteger(refundAmountInKobo) &&
  //   refundAmountInKobo <= refundableAmount;

  const handleOnEdit = (invoice: Invoice) => {
    setSelectEditInvoice(invoice);
    setDueDate(invoice.dueDate.split("T")[0] ?? "");
    setSession(invoice.academicSession);
    setTerm(
      invoice.term === "SECOND" || invoice.term === "THIRD"
        ? invoice.term
        : "FIRST",
    );
    setStudentId(invoice.student?.id ?? "");
    setItems(
      invoice.items.map((item) => ({
        description: item.description ?? "",
        category: item.category ?? "TUITION",
        amount: String((item.amount ?? 0) / 100),
      })),
    );
    setDiscount(invoice.discountAmount);
    setAllowInstallments(invoice.allowInstallments);
    setNotes(invoice.notes ?? "");
    setOpen(true);
  };

  const buildPayload = () => {
    if (
      !studentId ||
      !selectedClassId ||
      !dueDate ||
      items.some((item) => !item.description || !item.amount)
    ) {
      toast.error("Complete all required invoice fields");
      return;
    }

    return {
      studentId,
      classId: selectedClassId,
      academicSession: session,
      term,
      dueDate,
      discountAmount: Math.round(discount * 100),
      allowInstallments,
      installmentCount: allowInstallments ? installmentCount : 1,
      notes,
      items: items.map((item) => ({
        description: item.description,
        category: item.category,
        amount: Math.round(Number(item.amount) * 100),
      })),
    };
  };

  const submit = () => {
    const payload = buildPayload();
    if (!payload) return;

    createMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Invoice created successfully");
        setOpen(false);
        reset();
        queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      },
      onError: (error: any) => {
        toast.error(error.response.data.message);
      },
    });
  };

  const submitDraft = () => {
    const payload = buildPayload();
    if (!payload) return;

    createDraftMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Draft invoice created");
        setOpen(false);
        reset();
      },
      onError: (error: any) =>
        toast.error(error.response?.data?.message ?? "Could not create draft"),
    });
  };

  const updateDraft = () => {
    if (!selectEditInvoice?.id) return;

    const payload = buildPayload();
    if (!payload) return;

    updateDraftMutation.mutate(
      { id: selectEditInvoice.id, payload: payload },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Draft invoice updated");
          setOpen(false);
          reset();
        },
        onError: (error: any) =>
          toast.error(
            error.response?.data?.message ?? "Could not update draft",
          ),
      },
    );
  };

  const generateClassInvoices = () => {
    if (
      !classGenerateId ||
      !classDueDate ||
      classItems.some((item) => !item.description || !item.amount)
    ) {
      toast.error("Select a class, due date, and complete every fee item");
      return;
    }

    generateClassMutation.mutate(
      {
        classId: classGenerateId,
        academicSession: classSession,
        term: classTerm,
        dueDate: classDueDate,
        discountAmount: Math.round(classDiscount * 100),
        allowInstallments: classInstallments,
        installmentCount: classInstallments ? classInstallmentCount : 1,
        notes: classNotes,
        items: classItems.map((item) => ({
          description: item.description,
          category: item.category,
          amount: amountInKobo(Number(item.amount)),
        })),
      },
      {
        onSuccess: (result) => {
          toast.success(
            result.message ||
              `${result.data.created} class invoice(s) generated`,
          );
          setClassGenerateOpen(false);
          setClassItems([{ ...emptyItem }]);
          setClassDiscount(0);
        },
        onError: (error: any) =>
          toast.error(
            error.response?.data?.message ??
              "Could not generate class invoices",
          ),
      },
    );
  };

  const issueClassInvoices = () => {
    if (!classIssueId) {
      toast.error("Select a class");
      return;
    }
    issueClassMutation.mutate(
      {
        classId: classIssueId,
        academicSession: classIssueSession,
        term: classIssueTerm,
      },
      {
        onSuccess: (result) => {
          toast.success(`${result.issuedCount} draft invoice(s) issued`);
          setClassIssueOpen(false);
          queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
        },
        onError: (error: any) =>
          toast.error(
            error.response?.data?.message ?? "Could not issue class invoices",
          ),
      },
    );
  };

  const issueInvoice = (invoice: Invoice) => {
    issueMutation.mutate(invoiceId(invoice), {
      onSuccess: () => {
        toast.success("Invoice issued");
        queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
      },
    });
  };

  const unissuedInvoice = (invoice: Invoice) => {
    unissuedMutation.mutate(invoiceId(invoice), {
      onSuccess: (res) => {
        toast.success(res.message || "Invoice unissued");
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
      },
    });
  };

  const cancelInvoice = (invoice: Invoice) => {
    cancelMutation.mutate(invoiceId(invoice), {
      onSuccess: () => {
        toast.success("Invoice cancelled");
        queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
      },
    });
  };

  useEffect(() => {
    document.title = `Invoices | OpenStudy`;
  }, []);

  return (
    <Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        sx={{
          justifyContent: "space-between",
          width: "100%",
          alignItems: "start",
          mb: 3,
        }}
        spacing={2}
      >
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Invoices
          </Typography>
          <Typography color="text.secondary">
            Create, issue and monitor student billing.
          </Typography>
        </Box>
        <Stack
          direction={{ xs: "row" }}
          sx={{
            flexWrap: "wrap",
            rowGap: "10px",
            alignItems: "start",
            justifyContent: { sm: "flex-end" },
          }}
          spacing={1}
        >
          <Button
            variant="outlined"
            size="small"
            startIcon={<GroupsOutlined />}
            onClick={() => setClassGenerateOpen(true)}
          >
            Generate for class
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PublishOutlined />}
            onClick={() => setClassIssueOpen(true)}
          >
            Issue class drafts
          </Button>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => setOpen(true)}
          >
            Create invoice
          </Button>
        </Stack>
      </Stack>
      <Tabs
        value={activeTab}
        onChange={(_event, value: number) => setActiveTab(value)}
        aria-label="Invoice administration sections"
        sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab
          label="Invoices"
          id="invoice-tab-0"
          aria-controls="invoice-panel-0"
        />
        <Tab
          label="Refunds"
          id="invoice-tab-1"
          aria-controls="invoice-panel-1"
        />
      </Tabs>
      <Box
        role="tabpanel"
        id="invoice-panel-0"
        aria-labelledby="invoice-tab-0"
        sx={{ display: activeTab === 0 ? "block" : "none" }}
      >
        <Paper variant="outlined" sx={{ mb: 3, p: 2 }}>
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {[
              "UNPAID",
              "PARTIALLY_PAID",
              "PAID",
              "OVERDUE",
              "DRAFT",
              "CANCELLED",
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {value.replaceAll("_", " ")}
              </MenuItem>
            ))}
          </TextField>
        </Paper>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Invoice</TableCell>
                <TableCell>Student</TableCell>
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
                  <TableRow hover key={invoiceId(invoice)}>
                    <TableCell>
                      <strong>{invoice.invoiceNumber}</strong>
                      <Typography variant="caption" sx={{ display: "block" }}>
                        Due {new Date(invoice.dueDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{studentName(invoice.student)}</TableCell>
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
                        sx={{
                          justifyContent: "flex-end",
                          gap: 0,
                          width: "fit-content",
                        }}
                      >
                        <Button
                          size="small"
                          LinkComponent={Link}
                          onClick={() =>
                            navigate(`/admin/invoices/${invoice.id}`)
                          }
                          variant="contained"
                          color="success"
                          sx={{
                            width: "fit-content",
                            height: "fit-content",
                            fontSize: 12,
                          }}
                        >
                          Details
                        </Button>
                        {invoice.status === "UNPAID" && (
                          <Button
                            size="small"
                            onClick={() => unissuedInvoice(invoice)}
                            disabled={unissuedMutation.isPending}
                            sx={{
                              width: "fit-content",
                              height: "fit-content",
                              fontSize: 12,
                            }}
                          >
                            Draft
                          </Button>
                        )}
                        {invoice.status === "DRAFT" && (
                          <Box
                            sx={{
                              display: "inline-flex",
                              width: "fit-content",
                            }}
                          >
                            <Button
                              size="small"
                              onClick={() => issueInvoice(invoice)}
                              disabled={issueMutation.isPending}
                              sx={{
                                width: "fit-content",
                                height: "fit-content",
                                fontSize: 12,
                              }}
                            >
                              Issued
                            </Button>
                            <Button
                              size="small"
                              sx={{
                                width: "fit-content",
                                height: "fit-content",
                                fontSize: 12,
                              }}
                              onClick={() => handleOnEdit(invoice)}
                            >
                              Edit
                            </Button>
                          </Box>
                        )}
                        {(["UNPAID"] as string[]).includes(invoice.status) && (
                          <Tooltip title="Cancel invoice">
                            <IconButton
                              aria-label="Cancel invoice"
                              onClick={() => cancelInvoice(invoice)}
                              sx={{
                                width: "fit-content",
                                height: "fit-content",
                                fontSize: 12,
                              }}
                              size="small"
                            >
                              <DeleteOutlined
                                sx={{
                                  fontSize: 18,
                                  "&:hover": {
                                    color: "red",
                                  },
                                }}
                              />
                            </IconButton>
                          </Tooltip>
                        )}
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

      <Stack
        role="tabpanel"
        id="invoice-panel-1"
        aria-labelledby="invoice-tab-1"
        sx={{ display: activeTab === 1 ? "flex" : "none" }}
        spacing={2}
      >
        <AdminRefund />
      </Stack>

      {/* Create Single Invoice */}
      <Dialog
        open={open}
        onClose={() => !createMutation.isPending && (setOpen(false), reset())}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create invoice</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                select
                fullWidth
                label="Student"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setClassId("");
                }}
              >
                {students.data?.data?.map((student) => (
                  <MenuItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} —{" "}
                    {student.class?.name ?? "No class"}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                select
                fullWidth
                disabled
                label="Class"
                value={selectedClassId}
                onChange={(e) => setClassId(e.target.value)}
              >
                {classes.data?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                fullWidth
                label="Academic session"
                value={session}
                onChange={(e) => setSession(e.target.value)}
              />
              <TextField
                select
                fullWidth
                label="Term"
                value={term}
                onChange={(e) => setTerm(e.target.value as typeof term)}
              >
                <MenuItem value="FIRST">First term</MenuItem>
                <MenuItem value="SECOND">Second term</MenuItem>
                <MenuItem value="THIRD">Third term</MenuItem>
              </TextField>
              <TextField
                required
                fullWidth
                type="date"
                label="Due date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </Stack>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Fee items
            </Typography>
            {items.map((item, index) => (
              <Stack
                key={index}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ alignItems: "center" }}
              >
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={(e) =>
                    setItems(
                      items.map((entry, i) =>
                        i === index
                          ? { ...entry, description: e.target.value }
                          : entry,
                      ),
                    )
                  }
                />
                <TextField
                  select
                  // sx={{ minWidth: { sm: 220 } }}
                  fullWidth
                  label="Category"
                  value={item.category}
                  onChange={(e) =>
                    setItems(
                      items.map((entry, i) =>
                        i === index
                          ? {
                              ...entry,
                              category: e.target.value as typeof entry.category,
                            }
                          : entry,
                      ),
                    )
                  }
                >
                  {feeCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replaceAll("_", " ")}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  // sx={{ minWidth: { sm: 150 } }}
                  fullWidth
                  type="number"
                  slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                  label="Amount (₦)"
                  value={item.amount}
                  onChange={(e) =>
                    setItems(
                      items.map((entry, i) =>
                        i === index
                          ? { ...entry, amount: e.target.value }
                          : entry,
                      ),
                    )
                  }
                />
                <IconButton
                  aria-label="Remove fee item"
                  disabled={items.length === 1}
                  sx={{
                    "&:hover": {
                      color: "red",
                      background: "rgba(240, 165, 165, 0.5)",
                    },
                  }}
                  onClick={() => setItems(items.filter((_, i) => i !== index))}
                >
                  <DeleteOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            ))}
            <Button onClick={() => setItems([...items, { ...emptyItem }])}>
              Add fee item
            </Button>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Discount (₦)"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                fullWidth
              />
              <TextField
                select
                label="Payment plan"
                value={allowInstallments ? "INSTALLMENTS" : "FULL"}
                onChange={(e) =>
                  setAllowInstallments(e.target.value === "INSTALLMENTS")
                }
                fullWidth
              >
                <MenuItem value="FULL">Full payment</MenuItem>
                <MenuItem value="INSTALLMENTS">Allow installments</MenuItem>
              </TextField>
              {allowInstallments && (
                <TextField
                  type="number"
                  fullWidth
                  label="Number of Installment (2-3)"
                  value={installmentCount}
                  slotProps={{ htmlInput: { min: 2, max: 3 } }}
                  onChange={(e) => setInstallmentCount(Number(e.target.value))}
                />
              )}
            </Stack>
            <TextField
              multiline
              minRows={2}
              label="Notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "action.hover" }}>
              <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography>Invoice total</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {naira(Math.max(0, subtotal - discount) * 100)}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          {selectEditInvoice?.id ? (
            <Button
              variant="outlined"
              disabled={updateDraftMutation.isPending}
              onClick={updateDraft}
            >
              {updateDraftMutation.isPending ? "Updating…" : "Update draft"}
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                disabled={createDraftMutation.isPending}
                onClick={submitDraft}
              >
                {createDraftMutation.isPending ? "Saving…" : "Save draft"}
              </Button>
              <Button
                variant="contained"
                disabled={createMutation.isPending}
                onClick={submit}
              >
                {createMutation.isPending ? "Creating…" : "Create invoice"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Generate Class Invoice */}
      <Dialog
        open={classGenerateOpen}
        onClose={() =>
          !generateClassMutation.isPending &&
          (setClassGenerateOpen(false), reset())
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Generate invoices for a class</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              Invoices will be created as unpaid and issued for every active or
              inactive student assigned to the selected class.
            </Alert>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                required
                select
                fullWidth
                label="Class"
                value={classGenerateId}
                onChange={(event) => setClassGenerateId(event.target.value)}
              >
                {classes.data?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                required
                fullWidth
                label="Academic session"
                value={classSession}
                onChange={(event) => setClassSession(event.target.value)}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Term"
                value={classTerm}
                onChange={(event) =>
                  setClassTerm(event.target.value as typeof classTerm)
                }
              >
                <MenuItem value="FIRST">First term</MenuItem>
                <MenuItem value="SECOND">Second term</MenuItem>
                <MenuItem value="THIRD">Third term</MenuItem>
              </TextField>
              <TextField
                required
                fullWidth
                type="date"
                label="Due date"
                slotProps={{ inputLabel: { shrink: true } }}
                value={classDueDate}
                onChange={(event) => setClassDueDate(event.target.value)}
              />
            </Stack>
            <Typography sx={{ fontWeight: 700 }}>Fee items</Typography>
            {classItems.map((item, index) => (
              <Stack
                key={index}
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
              >
                <TextField
                  fullWidth
                  label="Description"
                  value={item.description}
                  onChange={(event) =>
                    setClassItems(
                      classItems.map((entry, i) =>
                        i === index
                          ? { ...entry, description: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
                <TextField
                  select
                  fullWidth
                  label="Category"
                  value={item.category}
                  onChange={(event) =>
                    setClassItems(
                      classItems.map((entry, i) =>
                        i === index
                          ? {
                              ...entry,
                              category: event.target
                                .value as typeof entry.category,
                            }
                          : entry,
                      ),
                    )
                  }
                >
                  {feeCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category.replaceAll("_", " ")}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  type="number"
                  label="Amount (₦)"
                  value={item.amount}
                  onChange={(event) =>
                    setClassItems(
                      classItems.map((entry, i) =>
                        i === index
                          ? { ...entry, amount: event.target.value }
                          : entry,
                      ),
                    )
                  }
                />
                <IconButton
                  aria-label="Remove fee item"
                  disabled={classItems.length === 1}
                  sx={{
                    "&:hover": {
                      color: "red",
                      background: "rgba(244, 186, 186, 0.5)",
                    },
                    height: "fit-content",
                  }}
                  onClick={() =>
                    setClassItems(classItems.filter((_, i) => i !== index))
                  }
                >
                  <DeleteOutlined sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            ))}
            <Button
              onClick={() => setClassItems([...classItems, { ...emptyItem }])}
            >
              Add fee item
            </Button>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField
                type="number"
                label="Discount (₦)"
                value={classDiscount}
                onChange={(event) =>
                  setClassDiscount(Number(event.target.value))
                }
                fullWidth
              />
              <TextField
                select
                label="Payment plan"
                value={classInstallments ? "INSTALLMENTS" : "FULL"}
                onChange={(event) =>
                  setClassInstallments(event.target.value === "INSTALLMENTS")
                }
                fullWidth
              >
                <MenuItem value="FULL">Full payment</MenuItem>
                <MenuItem value="INSTALLMENTS">Allow installments</MenuItem>
              </TextField>
              {classInstallments && (
                <TextField
                  type="number"
                  fullWidth
                  label="Number of Installment (2-3)"
                  value={classInstallmentCount}
                  slotProps={{ htmlInput: { min: 2, max: 3 } }}
                  onChange={(e) =>
                    setClassInstallmentCount(Number(e.target.value))
                  }
                />
              )}
            </Stack>
            <TextField
              multiline
              minRows={2}
              label="Notes"
              value={classNotes}
              onChange={(event) => setClassNotes(event.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setClassGenerateOpen(false);
              reset();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={generateClassMutation.isPending}
            onClick={generateClassInvoices}
          >
            {generateClassMutation.isPending
              ? "Generating…"
              : "Generate invoices"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Issue Class invoice */}
      <Dialog
        open={classIssueOpen}
        onClose={() =>
          !issueClassMutation.isPending && setClassIssueOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Issue class draft invoices</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Alert severity="warning">
              This issues all unpaid drafts with no payments for the selected
              class, session, and term.
            </Alert>
            <TextField
              required
              select
              fullWidth
              label="Class"
              value={classIssueId}
              onChange={(event) => setClassIssueId(event.target.value)}
            >
              {classes.data?.data?.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              required
              fullWidth
              label="Academic session"
              value={classIssueSession}
              onChange={(event) => setClassIssueSession(event.target.value)}
            />
            <TextField
              select
              fullWidth
              label="Term"
              value={classIssueTerm}
              onChange={(event) =>
                setClassIssueTerm(event.target.value as typeof classIssueTerm)
              }
            >
              <MenuItem value="FIRST">First term</MenuItem>
              <MenuItem value="SECOND">Second term</MenuItem>
              <MenuItem value="THIRD">Third term</MenuItem>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassIssueOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={issueClassMutation.isPending}
            onClick={issueClassInvoices}
          >
            {issueClassMutation.isPending ? "Issuing…" : "Issue drafts"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InvoicesPage;
