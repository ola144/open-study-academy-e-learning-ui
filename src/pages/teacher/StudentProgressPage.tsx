/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState, type FormEvent } from "react";
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
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from "@mui/material";
import {
  ArrowBack,
  AssignmentTurnedInOutlined,
  CheckCircleOutlined,
  GradeOutlined,
  HourglassTopOutlined,
  TrendingUp,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useSigleStudentQuery } from "../../hooks/useStudent";
import {
  useStudentAttemptQuery,
  useTeacherManualGradeEvaluationMutation,
  useTeacherStudentProgressQuery,
} from "../../hooks/useStudentLearning";
import type { IProgressAttempt } from "../../api/progress";
import type { IManualGrade } from "../../api/studentEvaluation";
import "./teacher-pages.css";
import { errorMessage, formatDateAndTime } from "../../utils/helperFunctions";
import { useUserQuery } from "../../hooks/useUser";

type GradeDraft = {
  awardedMarks: string;
  feedback: string;
};

const formatAnswer = (answer: unknown) => {
  if (typeof answer === "string") return answer.trim() || "No answer provided.";
  if (answer === null || answer === undefined) return "No answer provided.";
  if (typeof answer === "number" || typeof answer === "boolean") {
    return String(answer);
  }
  return JSON.stringify(answer, null, 2);
};

export default function StudentProgressPage() {
  const { studentId = "" } = useParams();

  const studentQuery = useSigleStudentQuery(studentId);
  const progressQuery = useTeacherStudentProgressQuery(studentId);

  const { data: userData } = useUserQuery();
  const isTeacher = userData?.user?.role === "TEACHER";

  const [selectedAttemptId, setSelectedAttemptId] = useState("");

  const [gradeDrafts, setGradeDrafts] = useState<Record<string, GradeDraft>>(
    {},
  );
  const [gradeValidationError, setGradeValidationError] = useState("");
  const attemptQuery = useStudentAttemptQuery(selectedAttemptId);

  const manualGradeMutation = useTeacherManualGradeEvaluationMutation();

  const student = studentQuery.data?.data;
  const progress = progressQuery.data?.data;

  const totals = progress?.totals;
  const history = progress?.history ?? [];

  const studentName = [student?.firstName, student?.lastName]
    .filter(Boolean)
    .join(" ");

  const attempt = attemptQuery.data?.data;
  const pendingAnswers =
    attempt?.answers.filter((answer) => answer.needsManualGrading) ?? [];

  useEffect(() => {
    if (!attempt || attempt.id !== selectedAttemptId) return;
    setGradeDrafts(
      Object.fromEntries(
        attempt.answers
          .filter((answer) => answer.needsManualGrading)
          .map((answer) => [
            answer.questionId,
            { awardedMarks: "", feedback: answer.feedback ?? "" },
          ]),
      ),
    );
    setGradeValidationError("");
  }, [attempt, selectedAttemptId]);

  const closeGradeDialog = () => {
    if (manualGradeMutation.isPending) return;
    setSelectedAttemptId("");
    setGradeDrafts({});
    setGradeValidationError("");
    manualGradeMutation.reset();
  };

  const handleGradeSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!attempt || pendingAnswers.length === 0) return;

    const gradingAnswers: IManualGrade[] = [];
    for (const answer of pendingAnswers) {
      const draft = gradeDrafts[answer.questionId];
      const awardedMarks = Number(draft?.awardedMarks);

      if (
        !draft?.awardedMarks.trim() ||
        !Number.isFinite(awardedMarks) ||
        awardedMarks < 0 ||
        awardedMarks > answer.maxMarks
      ) {
        setGradeValidationError(
          `Enter a score between 0 and ${answer.maxMarks} for every response.`,
        );
        return;
      }

      gradingAnswers.push({
        questionId: answer.questionId,
        awardedMarks,
        feedback: draft.feedback,
      });
    }

    setGradeValidationError("");
    manualGradeMutation.mutate(
      { attemptId: selectedAttemptId, answers: gradingAnswers },
      {
        onSuccess: () => {
          setSelectedAttemptId("");
          setGradeDrafts({});
          setGradeValidationError("");
        },
      },
    );
  };

  useEffect(() => {
    document.title = `Student Progress | OpenStudy`;
  }, []);

  return (
    <div className="teacher-page teacher-student-progress-page">
      <Button
        component={RouterLink}
        to={
          isTeacher
            ? `/teacher/students/${studentId}`
            : `/admin/students/${studentId}`
        }
        startIcon={<ArrowBack />}
        sx={{ justifySelf: "start" }}
      >
        Back to student
      </Button>
      <div className="teacher-page-heading">
        <div>
          <Typography className="teacher-eyebrow">STUDENT REPORT</Typography>
          <Typography component="h2" className="teacher-page-title">
            {studentName || "Student progress"}
          </Typography>
          <Typography className="teacher-page-description">
            {student?.class?.name
              ? `Evaluation results for ${student.class.name}${student.class.level ? ` · ${student.class.level}` : ""}`
              : "Assessment history returned by the progress service."}
          </Typography>
        </div>
        {studentQuery.isLoading && <CircularProgress size={24} />}
      </div>

      {(studentQuery.isError || progressQuery.isError) && (
        <Alert severity="error">
          {errorMessage(studentQuery.error ?? progressQuery.error)}
        </Alert>
      )}

      {progressQuery.isLoading ? (
        <Paper
          elevation={0}
          className="teacher-directory-panel teacher-progress-loading"
        >
          <CircularProgress size={26} />
          <Typography>Loading student progress…</Typography>
        </Paper>
      ) : progress ? (
        <>
          <div className="teacher-evaluation-stats teacher-student-progress-stats">
            <Paper elevation={0} className="teacher-evaluation-stat">
              <span>Attempts recorded</span>
              <strong>{totals?.attempts ?? 0}</strong>
              <small>{totals?.gradedAttempts ?? 0} graded attempts</small>
            </Paper>
            <Paper elevation={0} className="teacher-evaluation-stat">
              <span>Average percentage</span>
              <strong>{totals?.averagePercentage ?? 0}%</strong>
              <small>Across graded attempts</small>
            </Paper>
            <Paper elevation={0} className="teacher-evaluation-stat">
              <span>Passed</span>
              <strong>{totals?.passed ?? 0}</strong>
              <small>{totals?.failed ?? 0} not passed</small>
            </Paper>
            <Paper elevation={0} className="teacher-evaluation-stat">
              <span>Awaiting manual grading</span>
              <strong>{totals?.pendingManualGrading ?? 0}</strong>
              <small>Written responses requiring review</small>
            </Paper>
          </div>

          <Paper elevation={0} className="teacher-directory-panel">
            <div className="teacher-directory-toolbar teacher-progress-heading">
              <div>
                <Typography component="h3">Evaluation history</Typography>
                <Typography variant="body2" color="text.secondary">
                  Only evaluations created by you for this student&apos;s class
                  are included.
                </Typography>
              </div>
              <Chip
                icon={<AssignmentTurnedInOutlined />}
                label={`${history.length} attempts`}
                variant="outlined"
              />
            </div>
            <TableContainer className="teacher-table-container">
              <Table
                aria-label={`Evaluation progress for ${studentName || "student"}`}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>EVALUATION</TableCell>
                    <TableCell>TYPE</TableCell>
                    <TableCell>SUBMITTED</TableCell>
                    <TableCell>STATUS</TableCell>
                    <TableCell>SCORE</TableCell>
                    <TableCell>OUTCOME</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map((attempt: IProgressAttempt) => {
                    const graded =
                      attempt.status === "GRADED" ||
                      (attempt.status === "EXPIRED" &&
                        !attempt.needsManualGrading);
                    return (
                      <TableRow key={attempt.attemptId} hover>
                        <TableCell>
                          <div className="teacher-progress-evaluation">
                            <strong>
                              {attempt.evaluation?.title ?? "Evaluation"}
                            </strong>
                            <small>
                              {typeof attempt.evaluation?.topic === "object"
                                ? attempt.evaluation.topic.title
                                : "Topic not available"}
                            </small>
                          </div>
                        </TableCell>
                        <TableCell>{attempt.evaluation?.type ?? "—"}</TableCell>
                        <TableCell>
                          {formatDateAndTime(attempt.submittedAt)}
                        </TableCell>
                        <TableCell>
                          {attempt.needsManualGrading ? (
                            <Chip
                              icon={<HourglassTopOutlined />}
                              label="Awaiting grading"
                              size="small"
                              className="teacher-status-chip draft"
                            />
                          ) : (
                            <Chip
                              label={attempt.status.replaceAll("_", " ")}
                              size="small"
                              className={`teacher-status-chip ${attempt.status.toLowerCase()}`}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {graded
                            ? `${attempt.percentage}% (${attempt.score}/${attempt.totalMarks})`
                            : "Pending"}
                        </TableCell>
                        <TableCell>
                          {attempt.passed === undefined ? (
                            "Pending"
                          ) : (
                            <Chip
                              icon={
                                attempt.passed ? (
                                  <CheckCircleOutlined />
                                ) : (
                                  <TrendingUp />
                                )
                              }
                              label={attempt.passed ? "Passed" : "Not passed"}
                              size="small"
                              color={attempt.passed ? "success" : "default"}
                            />
                          )}
                        </TableCell>

                        <TableCell>
                          {attempt.needsManualGrading && isTeacher && (
                            <Button
                              variant="text"
                              size="small"
                              startIcon={<GradeOutlined />}
                              onClick={() => {
                                setGradeDrafts({});
                                setGradeValidationError("");
                                manualGradeMutation.reset();
                                setSelectedAttemptId(attempt.attemptId);
                              }}
                            >
                              Grade
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {history.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No attempts are recorded for your evaluations.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      ) : null}

      <Dialog
        open={Boolean(selectedAttemptId)}
        onClose={closeGradeDialog}
        fullWidth
        maxWidth="md"
        aria-labelledby="manual-grade-dialog-title"
      >
        <form onSubmit={handleGradeSubmit}>
          <DialogTitle id="manual-grade-dialog-title">
            Grade written responses
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                Review the student&apos;s written answers and award marks for
                each response. Scores cannot exceed the maximum marks shown.
              </Typography>

              {attemptQuery.isLoading && (
                <Stack spacing={1.5} sx={{ py: 5, alignItems: "center" }}>
                  <CircularProgress size={28} />
                  <Typography variant="body2" color="text.secondary">
                    Loading submitted answers…
                  </Typography>
                </Stack>
              )}

              {attemptQuery.isError && (
                <Alert severity="error">
                  {errorMessage(attemptQuery.error)}
                </Alert>
              )}

              {manualGradeMutation.isError && (
                <Alert severity="error">
                  {errorMessage(manualGradeMutation.error)}
                </Alert>
              )}

              {gradeValidationError && (
                <Alert severity="warning">{gradeValidationError}</Alert>
              )}

              {attempt && !attemptQuery.isLoading && !attemptQuery.isError && (
                <>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    {attempt.evaluation?.title ?? "Evaluation"}
                  </Typography>
                  {pendingAnswers.length === 0 ? (
                    <Alert severity="info">
                      This attempt has no outstanding written responses to
                      grade.
                    </Alert>
                  ) : (
                    pendingAnswers.map((answer, index) => {
                      const question = attempt.questions.find(
                        (item) => item.id === answer.questionId,
                      );
                      const draft = gradeDrafts[answer.questionId] ?? {
                        awardedMarks: "",
                        feedback: "",
                      };

                      return (
                        <Paper
                          key={answer.questionId}
                          variant="outlined"
                          sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2 }}
                        >
                          <Stack spacing={2}>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                sx={{ mb: 1, fontWeight: 700 }}
                              >
                                Question {index + 1}
                              </Typography>
                              <Typography sx={{ whiteSpace: "pre-wrap" }}>
                                {question?.prompt ??
                                  "Question text unavailable"}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                p: 1.75,
                                borderRadius: 1,
                                bgcolor: "#f5f7f4",
                              }}
                            >
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mb: 0.5,
                                  fontWeight: 700,
                                }}
                              >
                                STUDENT&apos;S ANSWER
                              </Typography>
                              <Typography
                                component="div"
                                sx={{
                                  whiteSpace: "pre-wrap",
                                  overflowWrap: "anywhere",
                                }}
                              >
                                {formatAnswer(answer.answer)}
                              </Typography>
                            </Box>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                  xs: "minmax(0, 1fr)",
                                  sm: "180px minmax(0, 1fr)",
                                },
                                gap: 2,
                              }}
                            >
                              <TextField
                                label="Awarded marks"
                                type="number"
                                value={draft.awardedMarks}
                                onChange={(event) =>
                                  setGradeDrafts((current) => ({
                                    ...current,
                                    [answer.questionId]: {
                                      ...draft,
                                      awardedMarks: event.target.value,
                                    },
                                  }))
                                }
                                required
                                fullWidth
                                disabled={manualGradeMutation.isPending}
                                slotProps={{
                                  htmlInput: {
                                    min: 0,
                                    max: answer.maxMarks,
                                    step: "any",
                                  },
                                  input: {
                                    endAdornment: (
                                      <InputAdornment position="end">
                                        / {answer.maxMarks}
                                      </InputAdornment>
                                    ),
                                  },
                                }}
                              />
                              <TextField
                                label="Feedback (optional)"
                                value={draft.feedback}
                                onChange={(event) =>
                                  setGradeDrafts((current) => ({
                                    ...current,
                                    [answer.questionId]: {
                                      ...draft,
                                      feedback: event.target.value,
                                    },
                                  }))
                                }
                                fullWidth
                                multiline
                                minRows={2}
                                disabled={manualGradeMutation.isPending}
                                slotProps={{
                                  htmlInput: { maxLength: 1000 },
                                }}
                              />
                            </Box>
                          </Stack>
                        </Paper>
                      );
                    })
                  )}
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button
              type="button"
              onClick={closeGradeDialog}
              disabled={manualGradeMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                manualGradeMutation.isPending ? (
                  <CircularProgress size={17} color="inherit" />
                ) : (
                  <GradeOutlined />
                )
              }
              disabled={
                attemptQuery.isLoading ||
                attemptQuery.isError ||
                manualGradeMutation.isPending ||
                pendingAnswers.length === 0
              }
            >
              {manualGradeMutation.isPending
                ? "Saving grades…"
                : "Submit grades"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
