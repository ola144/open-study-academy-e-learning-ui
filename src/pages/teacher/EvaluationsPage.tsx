/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  MenuItem,
  Pagination,
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
import {
  Add,
  AssignmentOutlined,
  Close,
  Edit,
  PublishOutlined,
  Search,
  UnpublishedOutlined,
} from "@mui/icons-material";
import { useAssignedTeacherSubjectsQuery } from "../../hooks/useSubject";
import { useAssignedTeacherTopicsQuery } from "../../hooks/useTopic";
import { useLessonsQuery } from "../../hooks/useLesson";
import { useQuestionsQuery } from "../../hooks/useQuestion";
import {
  useCreateEvaluationMutation,
  useEvaluationsQuery,
  useUpdateEvaluationMutation,
  useUpdateEvaluationStatusMutation,
} from "../../hooks/useEvaluation";
import type { IEvaluationRecord, EvaluationType } from "../../api/evaluation";
import { type ISubjectRecord } from "../../api/subject";
import { type ITopicRecord } from "../../api/topic";
import { type IQuestionRecord } from "../../api/question";
import "./teacher-pages.css";
import { toast } from "react-toastify";
import { errorMessage } from "../../utils/helperFunctions";
import { useClassQuery } from "../../hooks/useClass";

const displayName = (value: unknown, fallback: string) => {
  if (value && typeof value === "object" && "name" in value) {
    return String(value.name);
  }
  return fallback;
};

const emptyDraft = {
  title: "",
  type: "QUIZ" as EvaluationType,
  subjectId: "",
  topicId: "",
  lessonId: "",
  questionIds: [] as string[],
  durationMinutes: "30",
  availableFrom: "",
  availableUntil: "",
  passMark: "50",
  maxAttempts: "1",
  shuffleQuestions: false,
  showResultsImmediately: true,
};

export default function EvaluationsPage() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [selectedEvaluation, setSelectedEvaluation] =
    useState<IEvaluationRecord | null>(null);
  const [classId, setClassId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);

  const subjectsQuery = useAssignedTeacherSubjectsQuery(1, 100);
  const subjects = subjectsQuery.data?.data ?? [];

  const selectedSubject = subjects.find(
    (subject) => subject.id ?? subject.id === draft.subjectId,
  );

  const classQuery = useClassQuery();
  const classes = classQuery.data?.data ?? [];

  const topicsQuery = useAssignedTeacherTopicsQuery(
    1,
    1000,
    undefined,
    draft.subjectId || undefined,
  );

  const topics = topicsQuery.data?.data ?? [];

  const topic = topics.find((item) => item.id ?? item.id === draft.topicId);

  const lessonsQuery = useLessonsQuery(1, 100, draft.topicId || undefined);
  const lessons = lessonsQuery.data?.data ?? [];

  const questionsQuery = useQuestionsQuery(1, 100, {
    subjectId: draft.subjectId || undefined,
    topicId: draft.topicId || undefined,
  });
  const questions = questionsQuery.data?.data ?? [];

  const evaluationsQuery = useEvaluationsQuery(
    page,
    10,
    search,
    classId || undefined,
    topicId || undefined,
    status === "published" || status === "draft" ? status : undefined,
  );
  const evaluations = useMemo(
    () => evaluationsQuery.data?.data ?? [],
    [evaluationsQuery.data?.data],
  );

  const createMutation = useCreateEvaluationMutation();
  const updateMutation = useUpdateEvaluationMutation();
  const statusMutation = useUpdateEvaluationStatusMutation();

  const total = evaluationsQuery.data?.pagination.total ?? 0;

  const publishedCount = useMemo(
    () => evaluations.filter((item) => item.isPublished).length,
    [evaluations],
  );

  const draftCount = evaluations.length - publishedCount;

  const updateDraft = <K extends keyof typeof emptyDraft>(
    field: K,
    value: (typeof emptyDraft)[K],
  ) => setDraft((current) => ({ ...current, [field]: value }));

  const handleEdit = (evaluation: IEvaluationRecord) => {
    setSelectedEvaluation(evaluation);

    setDraft({
      title: evaluation.title,
      type: evaluation.type as EvaluationType,
      subjectId: evaluation.subject.id,
      topicId: evaluation.topic.id,
      lessonId: evaluation.lesson?.id ?? "",
      questionIds: (evaluation.questions ?? []).map((q) =>
        q.id.toString(),
      ) as string[],
      durationMinutes: String(evaluation.durationMinutes),
      availableFrom: evaluation.availableFrom ?? "",
      availableUntil: evaluation.availableUntil ?? "",
      passMark: String(evaluation.passMark),
      maxAttempts: String(evaluation.maxAttempts),
      shuffleQuestions: evaluation.shuffleQuestions ?? false,
      showResultsImmediately: evaluation.showResultsImmediately ?? false,
    });

    setDialogOpen(true);
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSubject || !topic) return;

    const classId = selectedSubject.class.id;
    if (!classId) return;

    let payload;

    if (draft.availableFrom.trim() && draft.availableUntil.trim()) {
      payload = {
        title: draft.title.trim(),
        type: draft.type,
        subjectId: draft.subjectId,
        topicId: draft.topicId,
        ...(draft.lessonId ? { lessonId: draft.lessonId } : {}),
        classId,
        questionIds: draft.questionIds,
        durationMinutes: Number(draft.durationMinutes),
        availableFrom: draft.availableFrom,
        availableUntil: draft.availableUntil,
        passMark: Number(draft.passMark),
        maxAttempts: Number(draft.maxAttempts),
        shuffleQuestions: draft.shuffleQuestions,
        showResultsImmediately: draft.showResultsImmediately,
      };
    } else {
      payload = {
        title: draft.title.trim(),
        type: draft.type,
        subjectId: draft.subjectId,
        topicId: draft.topicId,
        ...(draft.lessonId ? { lessonId: draft.lessonId } : {}),
        classId,
        questionIds: draft.questionIds,
        durationMinutes: Number(draft.durationMinutes),
        passMark: Number(draft.passMark),
        maxAttempts: Number(draft.maxAttempts),
        shuffleQuestions: draft.shuffleQuestions,
        showResultsImmediately: draft.showResultsImmediately,
      };
    }

    if (selectedEvaluation?.id) {
      updateMutation.mutate(
        { payload: payload, id: selectedEvaluation.id },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            setDraft(emptyDraft);
            setDialogOpen(false);
          },
          onError: (err: any) => {
            toast.error(err.response.data.message);
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (res) => {
          toast.success(res.message);
          setDraft(emptyDraft);
          setDialogOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response.data.message);
        },
      });
    }
  };

  useEffect(() => {
    document.title = `Evaluations | OpenStudy`;
  }, []);

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <Typography className="teacher-eyebrow">ASSESSMENT CENTER</Typography>
          <Typography component="h2" className="teacher-page-title">
            Evaluations
          </Typography>
          <Typography className="teacher-page-description">
            Create assessments from your question bank and manage their
            availability.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Create evaluation
        </Button>
      </div>

      {evaluationsQuery.isError && (
        <Alert severity="error">{errorMessage(evaluationsQuery.error)}</Alert>
      )}
      <div className="teacher-evaluation-stats">
        <Paper elevation={0} className="teacher-evaluation-stat">
          <span>Evaluations</span>
          <strong>{total}</strong>
          <small>Matching your current filters</small>
        </Paper>
        <Paper elevation={0} className="teacher-evaluation-stat">
          <span>Published on this page</span>
          <strong>{publishedCount}</strong>
          <small>Available to students</small>
        </Paper>
        <Paper elevation={0} className="teacher-evaluation-stat">
          <span>Drafts on this page</span>
          <strong>{draftCount}</strong>
          <small>Not yet published</small>
        </Paper>
      </div>

      <Paper elevation={0} className="teacher-directory-panel">
        <div
          className="teacher-directory-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search evaluations"
            aria-label="Search evaluations"
            className="teacher-search-field"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <Button
                      variant="contained"
                      color="inherit"
                      sx={{ minWidth: 0, p: 0.5 }}
                      onClick={() => setSearch("")}
                      size="small"
                    >
                      <Close fontSize="small" />
                    </Button>
                  </InputAdornment>
                ) : null,
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "2px",
            }}
          >
            <TextField
              select
              size="small"
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
              className="teacher-evaluation-filter"
            >
              <MenuItem value="">All evaluations</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </TextField>
            <TextField
              select
              size="small"
              label="Class"
              value={classId || ""}
              onChange={(event) => {
                setClassId(event.target.value);
                setPage(1);
              }}
              className="teacher-evaluation-filter"
            >
              <MenuItem value="">All Classes</MenuItem>
              {classes.map((cls) => (
                <MenuItem key={cls.id} value={cls.id}>
                  {cls.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              size="small"
              label="Topic"
              value={topicId || ""}
              onChange={(event) => {
                setTopicId(event.target.value);
                setPage(1);
              }}
              className="teacher-evaluation-filter"
            >
              <MenuItem value="">All Topics</MenuItem>
              {topics.map((topic) => (
                <MenuItem key={topic.id} value={topic.id}>
                  {topic.title}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </div>
        {statusMutation.isError && (
          <Alert severity="error" sx={{ m: 2 }}>
            {errorMessage(statusMutation.error)}
          </Alert>
        )}
        <TableContainer className="teacher-table-container">
          <Table aria-label="Evaluations">
            <TableHead>
              <TableRow>
                <TableCell>EVALUATION</TableCell>
                <TableCell>CLASS</TableCell>
                <TableCell>QUESTIONS</TableCell>
                <TableCell>SETTINGS</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {evaluationsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Loading evaluations…
                  </TableCell>
                </TableRow>
              ) : (
                evaluations.map((evaluation) => (
                  <TableRow key={evaluation.id} hover>
                    <TableCell>
                      <div className="teacher-evaluation-name">
                        <span>
                          <AssignmentOutlined />
                        </span>
                        <div>
                          <strong>{evaluation.title}</strong>
                          <small>{evaluation.title}</small>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{evaluation.class.name}</TableCell>
                    <TableCell>{evaluation.questions.length}</TableCell>
                    <TableCell>
                      {evaluation.type} · {evaluation.passMark}% pass ·{" "}
                      {evaluation.maxAttempts} attempts
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={evaluation.isPublished ? "Published" : "Draft"}
                        size="small"
                        className={`teacher-status-chip ${evaluation.isPublished ? "published" : "draft"}`}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        disabled={statusMutation.isPending}
                        onClick={() =>
                          statusMutation.mutate({
                            id: evaluation.id,
                            isPublished: !evaluation.isPublished,
                          })
                        }
                        startIcon={
                          evaluation.isPublished ? (
                            <UnpublishedOutlined />
                          ) : (
                            <PublishOutlined />
                          )
                        }
                      >
                        {evaluation.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<Edit sx={{ width: 12 }} />}
                        disabled={statusMutation.isPending}
                        onClick={() => handleEdit(evaluation)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!evaluationsQuery.isLoading && evaluations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="teacher-empty-cell">
                    No evaluations match these filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", p: 2 }}
        >
          <Typography variant="caption">
            Showing {evaluations.length} of {total} evaluations
          </Typography>
          {(evaluationsQuery.data?.pagination.totalPages ?? 0) > 1 && (
            <Pagination
              count={evaluationsQuery.data?.pagination.totalPages ?? 1}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
            />
          )}
        </Stack>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => !createMutation.isPending && setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <form onSubmit={(event) => void handleCreate(event)}>
          <DialogTitle>
            {selectedEvaluation?.id ? "Update" : "Create an"} evaluation
          </DialogTitle>
          <DialogContent>
            <Alert severity="info" sx={{ mt: 1 }}>
              Evaluations are created as drafts. Publish when they are ready for
              students.
            </Alert>
            {createMutation.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errorMessage(createMutation.error)}
              </Alert>
            )}
            {(subjectsQuery.isError ||
              topicsQuery.isError ||
              lessonsQuery.isError ||
              questionsQuery.isError) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Unable to load assigned curriculum or question data. Refresh and
                try again.
              </Alert>
            )}
            <Stack spacing={2} className="teacher-dialog-fields">
              <TextField
                label="Evaluation title"
                value={draft.title}
                onChange={(event) => updateDraft("title", event.target.value)}
                required
                fullWidth
              />
              <TextField
                select
                label="Evaluation type"
                value={draft.type}
                onChange={(event) =>
                  updateDraft("type", event.target.value as EvaluationType)
                }
                required
                fullWidth
              >
                {(["QUIZ", "TEST", "EXAM"] as const).map((value) => (
                  <MenuItem key={value} value={value}>
                    {value}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Assigned subject"
                value={draft.subjectId}
                onChange={(event) =>
                  setDraft({
                    ...emptyDraft,
                    title: draft.title,
                    subjectId: event.target.value,
                  })
                }
                required
                fullWidth
              >
                {subjects.map((subject: ISubjectRecord) => (
                  <MenuItem
                    key={subject.id ?? subject.id}
                    value={subject.id ?? subject.id}
                  >
                    {subject.name} form {subject.class.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Topic"
                value={draft.topicId}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    topicId: event.target.value,
                    lessonId: "",
                    questionIds: [],
                  })
                }
                required
                disabled={!draft.subjectId}
                fullWidth
              >
                {topics.map((item: ITopicRecord) => (
                  <MenuItem key={item.id ?? item.id} value={item.id ?? item.id}>
                    {item.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Lesson (optional)"
                value={draft.lessonId}
                onChange={(event) =>
                  updateDraft("lessonId", event.target.value)
                }
                disabled={!draft.topicId}
                fullWidth
              >
                <MenuItem value="">No specific lesson</MenuItem>
                {lessons.map((lesson) => (
                  <MenuItem
                    key={lesson.id ?? lesson.id}
                    value={lesson.id ?? lesson.id}
                  >
                    {lesson.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Questions"
                value={draft.questionIds}
                onChange={(event) =>
                  updateDraft(
                    "questionIds",
                    typeof event.target.value === "string"
                      ? event.target.value.split(",")
                      : event.target.value,
                  )
                }
                slotProps={{ select: { multiple: true } }}
                required
                disabled={!draft.topicId}
                helperText={
                  questionsQuery.isLoading
                    ? "Loading question bank…"
                    : questions.length
                      ? "Select one or more active questions for this subject and topic."
                      : "No questions are available for the selected topic yet."
                }
                fullWidth
              >
                {questions.map((question: IQuestionRecord) => (
                  <MenuItem key={question.id} value={question.id}>
                    {question.prompt}
                  </MenuItem>
                ))}
              </TextField>
              {selectedSubject && (
                <Typography variant="caption">
                  Class: {displayName(selectedSubject.class, "Not available")}
                  {topic ? ` · Topic: ${topic.title}` : ""}
                </Typography>
              )}
              <div className="teacher-evaluation-form-row">
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  value={draft.durationMinutes}
                  onChange={(event) =>
                    updateDraft("durationMinutes", event.target.value)
                  }
                  slotProps={{
                    htmlInput: { min: 1, max: 300 },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">min</InputAdornment>
                      ),
                    },
                  }}
                  required
                  fullWidth
                />
                <TextField
                  label="Passing score (%)"
                  type="number"
                  value={draft.passMark}
                  onChange={(event) =>
                    updateDraft("passMark", event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 0, max: 100 } }}
                  required
                  fullWidth
                />
                <TextField
                  label="Attempts allowed"
                  type="number"
                  value={draft.maxAttempts}
                  onChange={(event) =>
                    updateDraft("maxAttempts", event.target.value)
                  }
                  slotProps={{ htmlInput: { min: 1, max: 20 } }}
                  required
                  fullWidth
                />
              </div>

              <div className="teacher-evaluation-form-row">
                <TextField
                  label="Available From"
                  type="date"
                  value={draft.availableFrom}
                  onChange={(event) =>
                    updateDraft("availableFrom", event.target.value)
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start"></InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
                <TextField
                  label="Available Until"
                  type="date"
                  value={draft.availableUntil}
                  onChange={(event) =>
                    updateDraft("availableUntil", event.target.value)
                  }
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start"></InputAdornment>
                      ),
                    },
                  }}
                  fullWidth
                />
              </div>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={draft.shuffleQuestions}
                    onChange={(event) =>
                      updateDraft("shuffleQuestions", event.target.checked)
                    }
                  />
                }
                label="Shuffle questions for each attempt"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={draft.showResultsImmediately}
                    onChange={(event) =>
                      updateDraft(
                        "showResultsImmediately",
                        event.target.checked,
                      )
                    }
                  />
                }
                label="Show results immediately"
              />
            </Stack>
          </DialogContent>
          <DialogActions className="teacher-dialog-actions">
            <Button
              color="inherit"
              onClick={() => setDialogOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                draft.questionIds.length === 0 ||
                !selectedSubject?.class.id
              }
            >
              {selectedEvaluation?.id ? (
                <>{updateMutation.isPending ? "Updating..." : "Update"}</>
              ) : (
                <>{createMutation.isPending ? "Saving..." : "Save draft"}</>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
