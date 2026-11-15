/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from "react";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Snackbar,
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
  Add,
  Check,
  Close,
  Edit,
  RemoveRedEye,
  Search,
} from "@mui/icons-material";
import type { SelectChangeEvent } from "@mui/material/Select";
import { Link as RouterLink } from "react-router-dom";
import "./admin-pages.css";
import type { IClassData } from "../../api/class";
import type { ISubjectRecord } from "../../api/subject";
import AdminFormModal from "../../components/AdminFormModal";
import { useClassQuery } from "../../hooks/useClass";
import { useUserQuery } from "../../hooks/useUser";

type Pagination = {
  page: number;
  setPage: (value: number) => void;
  limit: number;
  setLimit: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  total: number;
};

export type EntityRecord = {
  id?: string;
  [key: string]: string | number | boolean | undefined | string[] | any;
};
export type FieldDefinition = {
  name: string;
  label: string;
  options?: any[];
  isEdit?: boolean;
  optionCategories?: string[];
  optionClasses?: IClassData[];
  optionLevels?: string[];
  optionSubjects?: ISubjectRecord[];
  helperText?: string;
};

export type ColumnDefinition = { name: string; label: string };

export type EntityDirectoryConfig = {
  id: "teachers" | "students" | "subjects" | "classes";
  title: string;
  singular: string;
  description: string;
  searchLabel: string;
  columns: ColumnDefinition[];
  fields?: FieldDefinition[];
  statuses: string[];
  initialRecords: EntityRecord[];
};

function initials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

const AdminEntityDirectory = ({
  config,
  paginations,
  loading = false,
  error,
  selectedEdit,
  setSelectedEdit,
  updateClassStatus,
  isUpdatingStatus,
}: {
  paginations?: Pagination;
  config: EntityDirectoryConfig;
  loading?: boolean;
  error?: string;
  selectedEdit?: any;
  setSelectedEdit?: (value: any) => void;
  updateClassStatus?: (editClass: IClassData | any) => void;
  isUpdatingStatus?: any;
}) => {
  const [records, setRecords] = useState(config.initialRecords);
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [toastOpen, setToastOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");

  const { data: classData } = useClassQuery();
  const { data: userData } = useUserQuery();

  useEffect(() => {
    setRecords(config.initialRecords);
  }, [config.initialRecords]);

  const filteredRecords = records.filter((record) => {
    const haystack = Object.values(record).join(" ").toLowerCase();

    const matchesSearch = haystack.includes(
      paginations?.search.toLowerCase() ?? "",
    );

    const matchesStatus =
      statusFilter === "All statuses" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleEdit = (record: any) => {
    setSelectedEdit?.(record);
    setDialogOpen(true);
  };

  function openCreateDialog() {
    setDraft({});
    setDialogOpen(true);
  }

  function handleFilter(event: SelectChangeEvent) {
    setStatusFilter(event.target.value);
    paginations?.setPage(0);
  }

  useEffect(() => {
    if (selectedEdit) {
      setDraft({ ...selectedEdit });
    }
  }, [selectedEdit]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      paginations?.setSearch(searchInput);
      paginations?.setPage(0);
    }, 500);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <Typography className="admin-eyebrow">SCHOOL DIRECTORY</Typography>
          <Typography component="h2" className="admin-page-title">
            {config.title}
          </Typography>
          <Typography className="admin-page-description">
            {config.description}
          </Typography>
        </div>
        {config.id !== "students" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            sx={{ textTransform: "capitalize" }}
            onClick={openCreateDialog}
          >
            Add {config.singular}
          </Button>
        )}
        {/* {config.id === "students" && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openCreateDialog}
          >
            Add {config.singular}
          </Button>
        )} */}
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Paper elevation={0} className="admin-directory-panel">
        {config.id !== "classes" && (
          <div className="admin-directory-toolbar">
            <TextField
              size="small"
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
              }}
              placeholder={config.searchLabel}
              aria-label={config.searchLabel}
              className="admin-search-field"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="start">
                      {searchInput.trim() && (
                        <IconButton
                          size="small"
                          onClick={() => setSearchInput("")}
                        >
                          <Close fontSize="small" />
                        </IconButton>
                      )}
                    </InputAdornment>
                  ),
                },
              }}
            />
            <FormControl size="small" className="admin-status-filter">
              <InputLabel
                id={`${config.singular}-status-label`}
                sx={{ width: 100 }}
              >
                Status
              </InputLabel>
              <Select
                labelId={`${config.singular}-status-label`}
                value={statusFilter}
                label="Status"
                onChange={handleFilter}
              >
                <MenuItem value="All statuses">All statuses</MenuItem>
                {config.statuses.map((status) => (
                  <MenuItem value={status} key={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
        )}

        <TableContainer className="admin-table-container">
          <Table aria-label={`${config.title} directory`}>
            <TableHead>
              <TableRow>
                {config.columns.map((column) => (
                  <TableCell key={column.name}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id} hover>
                  {config.columns.map((column) => {
                    if (column.name === "person") {
                      const firstName = String(record.firstName ?? "");
                      const lastName = String(record.lastName ?? "");
                      return (
                        <TableCell key={column.name}>
                          <div className="admin-person-cell">
                            {record.profilePic ? (
                              <img
                                style={{
                                  width: "30px",
                                  height: "30px",
                                  background: "#e7efe9",
                                  borderRadius: "100%",
                                }}
                                src={record.profilePic}
                                alt={firstName + lastName}
                              />
                            ) : (
                              <Avatar>{initials(firstName, lastName)}</Avatar>
                            )}
                            <div>
                              <strong>
                                {firstName} {lastName}
                              </strong>
                              <span>{record.email}</span>
                            </div>
                          </div>
                        </TableCell>
                      );
                    }
                    if (column.name === "status") {
                      const status = String(
                        record.status ??
                          (record.isActive === true ? "Active" : "Inactive"),
                      );

                      return (
                        <TableCell key={column.name}>
                          <Chip
                            label={status}
                            sx={{ textTransform: "uppercase" }}
                            size="small"
                            className={`admin-status-chip ${status.toLowerCase()}`}
                          />
                        </TableCell>
                      );
                    }

                    if (column.name === "actions") {
                      const recordId = record.id;
                      return (
                        <TableCell
                          key={column.name}
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {config.id !== "classes" && (
                            <IconButton
                              component={RouterLink}
                              to={
                                userData?.user?.role === "ADMIN"
                                  ? `/admin/${config.id}/${recordId ?? ""}`
                                  : `/teacher/${config.id}/${recordId ?? ""}`
                              }
                              aria-label={`View ${config.singular} details`}
                              disabled={!recordId}
                              size="small"
                            >
                              <RemoveRedEye
                                sx={{ fontSize: "18px" }}
                                color="action"
                              />
                            </IconButton>
                          )}

                          {(config.id === "teachers" ||
                            config.id === "subjects") && (
                            <IconButton
                              component="button"
                              size="small"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit sx={{ fontSize: "18px" }} color="success" />
                            </IconButton>
                          )}

                          {(config.id === "students" ||
                            config.id === "classes") &&
                            userData?.user?.role === "ADMIN" && (
                              <IconButton
                                component="button"
                                size="small"
                                onClick={() => handleEdit(record)}
                              >
                                <Edit
                                  sx={{ fontSize: "18px" }}
                                  color="success"
                                />
                              </IconButton>
                            )}
                          {config.id === "classes" && (
                            <Button
                              onClick={() => updateClassStatus?.(record)}
                              aria-label={`Update ${config.singular} status`}
                              disabled={isUpdatingStatus[record?.id ?? ""]}
                              size="small"
                              variant="contained"
                              color={
                                record.status === "Active" ? "error" : "success"
                              }
                              endIcon={
                                isUpdatingStatus[record.id ?? ""] ? (
                                  <CircularProgress size={12} />
                                ) : record.status === "Active" ? (
                                  <Close />
                                ) : (
                                  <Check />
                                )
                              }
                            >
                              {isUpdatingStatus[record.id ?? ""]
                                ? "Loading.."
                                : record.status === "Active"
                                  ? "Inactivate"
                                  : "Activate"}
                            </Button>
                          )}
                        </TableCell>
                      );
                    }

                    if (column.name === "className") {
                      const className = classData?.data?.find(
                        (c) => c.id === record[column.name],
                      )?.name;

                      return (
                        <TableCell key={column.name}>
                          {className ?? "—"}
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell key={column.name}>
                        {record[column.name] ?? "—"}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}

              {/* LOADER STATE */}
              {loading && (
                <TableRow>
                  <TableCell
                    colSpan={config.columns.length}
                    className="admin-empty-cell"
                  >
                    <CircularProgress size={22} aria-label="Loading records" />
                  </TableCell>
                </TableRow>
              )}

              {/* EMPTY STATE */}
              {!loading && filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={config.columns.length}
                    className="admin-empty-cell"
                  >
                    No {config.title.toLowerCase()} match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        {config.id !== "classes" && (
          <TablePagination
            component="div"
            count={paginations?.total ?? 0}
            page={paginations?.page ?? 0}
            onPageChange={(_event, nextPage) => paginations?.setPage(nextPage)}
            rowsPerPage={paginations?.limit ?? 10}
            onRowsPerPageChange={(event) => {
              paginations?.setLimit(Number(event.target.value));
              paginations?.setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 30, 40, 50]}
            labelRowsPerPage="Rows"
          />
        )}
      </Paper>

      {/* FORM MODAL/DIALOG */}
      <AdminFormModal
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        draft={draft}
        setDraft={setDraft}
        config={config}
      />

      <Snackbar
        open={toastOpen}
        autoHideDuration={3500}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="success"
          variant="filled"
        >
          {config.singular} added to this session.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default AdminEntityDirectory;
