/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Add,
  ArrowForward,
  EditOutlined,
  MenuBookOutlined,
  Search,
} from "@mui/icons-material";
import {
  Alert,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
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
import { Link as RouterLink } from "react-router-dom";
import type { AcademicTerm, ITopicRecord } from "../../api/topic";
import { useGetSubjectQuery } from "../../hooks/useSubject";
import {
  useCreateTopicMutation,
  useTopicsQuery,
  useUpdateTopicMutation,
} from "../../hooks/useTopic";
import "./admin-pages.css";
import "./admin-detail-pages.css";
import { useClassQuery } from "../../hooks/useClass";
import { toast } from "react-toastify";

const terms: AcademicTerm[] = ["FIRST", "SECOND", "THIRD"];

export default function TopicsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState({
    title: "",
    subjectId: "",
    classId: "",
    description: "",
    term: "FIRST" as AcademicTerm,
    order: "1",
  });
  const [edit, setEdit] = useState<ITopicRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const topicsQuery = useTopicsQuery(
    page + 1,
    limit,
    search,
    undefined,
    undefined,
    true,
  );

  const classQuery = useClassQuery();
  const subjectsQuery = useGetSubjectQuery(1, 100, undefined, undefined, false);

  const createTopic = useCreateTopicMutation();
  const updateTopic = useUpdateTopicMutation();

  const subjects = useMemo(
    () => subjectsQuery.data?.data ?? [],
    [subjectsQuery.data?.data],
  );

  const classData = useMemo(
    () => classQuery.data?.data ?? [],
    [classQuery.data?.data],
  );

  const topics = topicsQuery.data?.data ?? [];

  const selectedSubject = useMemo(
    () =>
      subjects.find(
        (subject) =>
          subject.id === draft.subjectId || subject.id === draft.subjectId,
      ),
    [draft.subjectId, subjects],
  );

  const buildPayload = () => {
    return {
      title: draft.title.trim(),
      subjectId: draft.subjectId,
      classId: draft.classId,
      description: draft.description.trim() || undefined,
      term: draft.term,
      order: Number(draft.order),
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    if (edit?.id) {
      updateTopic.mutate(
        { id: edit.id, payload: buildPayload() },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            setDialogOpen(false);
            setDraft({
              title: "",
              subjectId: "",
              classId: "",
              description: "",
              term: "FIRST",
              order: "1",
            });
          },
          onError: (err: any) => {
            toast.error(err.response?.data.message);
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } else {
      createTopic.mutate(buildPayload(), {
        onSuccess: (res) => {
          toast.success(res.message);
          setDialogOpen(false);
          setDraft({
            title: "",
            subjectId: "",
            classId: "",
            description: "",
            term: "FIRST",
            order: "1",
          });
        },
        onError: (err: any) => {
          toast.error(err.response?.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  const onEditTopic = (topic: ITopicRecord | any) => {
    setEdit(topic);
    setDraft({
      title: topic.title,
      subjectId: topic.subject?.id ?? "",
      classId: topic?.classId ?? "",
      description: topic.description ?? "",
      term: topic.term || "FIRST",
      order: String(topic.order ?? ""),
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    document.title = `Topics | OpenStudy`;
  }, []);

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <Typography className="admin-eyebrow">CURRICULUM</Typography>
          <Typography component="h2" className="admin-page-title">
            Topics
          </Typography>
          <Typography className="admin-page-description">
            Organize subjects into focused learning topics and manage their
            lessons.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setFormError("");
            setDialogOpen(true);
          }}
          disabled={subjects.length === 0 || subjectsQuery.isLoading}
        >
          Create topic
        </Button>
      </div>

      {subjectsQuery.error && (
        <Alert severity="error">
          Unable to load subjects for topic creation:{" "}
          {subjectsQuery.error.message}
        </Alert>
      )}
      {!subjectsQuery.isLoading &&
        !subjectsQuery.error &&
        subjects.length === 0 && (
          <Alert severity="info">
            Create an active subject before adding topics.
          </Alert>
        )}
      {topicsQuery.error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void topicsQuery.refetch()}
            >
              Retry
            </Button>
          }
        >
          {topicsQuery.error.message}
        </Alert>
      )}

      <Paper className="admin-directory-panel" elevation={0}>
        <div className="admin-directory-toolbar">
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search topics"
            aria-label="Search topics"
            className="admin-search-field"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Typography color="text.secondary" variant="body2">
            {topicsQuery.data?.pagination?.total ?? topics.length} topics
          </Typography>
        </div>
        <TableContainer>
          <Table aria-label="Topics directory">
            <TableHead>
              <TableRow>
                <TableCell>TOPIC</TableCell>
                <TableCell>SUBJECT</TableCell>
                <TableCell>TERM</TableCell>
                <TableCell>ORDER</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!topicsQuery.isLoading &&
                topics.map((topic) => {
                  const subject = topic.subject.name;
                  return (
                    <TableRow key={topic.id ?? topic.id} hover>
                      <TableCell>
                        <div className="admin-person-cell">
                          <MenuBookOutlined color="action" />
                          <div>
                            <strong>{topic.title}</strong>
                            <span>{topic.description || "No description"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{subject}</TableCell>
                      <TableCell>{topic.term ?? "FIRST"}</TableCell>
                      <TableCell>{topic.order ?? 0}</TableCell>
                      <TableCell>
                        <Chip
                          label={topic.isActive ? "Active" : "Inactive"}
                          size="small"
                          className={`admin-status-chip ${topic.isActive ? "active" : "inactive"}`}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          startIcon={<EditOutlined />}
                          size="small"
                          onClick={() => onEditTopic(topic)}
                        >
                          Edit
                        </Button>
                        <Button
                          component={RouterLink}
                          to={`/admin/topics/${topic.id ?? topic.id}`}
                          endIcon={<ArrowForward />}
                          size="small"
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {topicsQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="admin-empty-cell">
                    <CircularProgress size={24} aria-label="Loading topics" />
                  </TableCell>
                </TableRow>
              )}
              {!topicsQuery.isLoading && topics.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="admin-empty-cell">
                    No topics found. Create the first topic to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={topicsQuery.data?.pagination?.total ?? 0}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => !createTopic.isPending && setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>{edit ? "Update" : "Create"} a topic</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary" variant="body2" sx={{ mb: 2 }}>
              Add a topic to an active subject. Lessons can be added after the
              topic is created.
            </Typography>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <div
              className="admin-dialog-fields"
              style={{ display: "flex", flexDirection: "column", gap: 10 }}
            >
              <TextField
                label="Topic title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                required
                slotProps={{ htmlInput: { minLength: 2, maxLength: 150 } }}
                fullWidth
              />
              <TextField
                select
                label="Class"
                value={draft.classId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    classId: event.target.value,
                  }))
                }
                required
                fullWidth
              >
                {classData.map((classItem) => (
                  <MenuItem
                    key={classItem.id ?? classItem.id}
                    value={classItem.id ?? classItem.id}
                  >
                    {classItem.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Subject"
                value={draft.subjectId}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    subjectId: event.target.value,
                  }))
                }
                required
                fullWidth
              >
                {subjects.map((subject) => (
                  <MenuItem
                    key={subject.id ?? subject.id}
                    value={subject.id ?? subject.id}
                  >
                    {subject.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Academic term"
                value={draft.term}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    term: event.target.value as AcademicTerm,
                  }))
                }
                fullWidth
              >
                {terms.map((term) => (
                  <MenuItem key={term} value={term}>
                    {term
                      .replace("FIRST", "First")
                      .replace("SECOND", "Second")
                      .replace("THIRD", "Third")}{" "}
                    term
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Display order"
                type="number"
                value={draft.order}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    order: event.target.value,
                  }))
                }
                slotProps={{ htmlInput: { min: 0, step: 1 } }}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={draft.description}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                slotProps={{ htmlInput: { maxLength: 1000 } }}
                multiline
                minRows={3}
                fullWidth
              />
            </div>
            {selectedSubject && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mt: 1, display: "block" }}
              >
                Subject selected: {selectedSubject.name}
              </Typography>
            )}
          </DialogContent>
          <DialogActions className="admin-dialog-actions">
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={createTopic.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createTopic.isPending || subjects.length === 0 || loading
              }
            >
              {edit ? (
                <>{loading ? "Updating..." : "Update topic"}</>
              ) : (
                <>{loading ? "Creating..." : "Create topic"}</>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
