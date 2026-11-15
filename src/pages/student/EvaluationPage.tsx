import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Chip,
  FormControl,
  FormControlLabel,
  FormLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AccessAlarm,
  ArrowBack,
  ArrowForward,
  AssignmentOutlined,
  CheckCircleOutlined,
  LockClockOutlined,
} from "@mui/icons-material";
import {
  Link as RouterLink,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  useStartStudentEvaluationMutation,
  useStudentAttemptQuery,
  useStudentEvaluationsQuery,
  useStudentProgressQuery,
  useSubmitStudentEvaluationMutation,
} from "../../hooks/useStudentLearning";
import type {
  IAttemptQuestion,
  IStudentEvaluation,
} from "../../api/studentEvaluation";
import "./student-pages.css";
import { useUserQuery } from "../../hooks/useUser";
import {
  errorMessage,
  formatTime,
  getRemainingSeconds,
} from "../../utils/helperFunctions";

const availableState = (evaluation: IStudentEvaluation) => {
  const now = Date.now();

  if (
    evaluation.availableFrom &&
    new Date(evaluation.availableFrom).getTime() > now
  ) {
    return "Upcoming";
  }

  if (
    evaluation.availableUntil &&
    new Date(evaluation.availableUntil).getTime() < now
  ) {
    return "Closed";
  }

  return "Due";
};

const EvaluationPage = () => {
  const { evaluationId } = useParams();

  const [searchParams, setSearchParams] = useSearchParams();
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const attemptId = searchParams.get("attemptId") ?? "";
  const topicId = searchParams.get("topicId") ?? undefined;

  const currentUserQuery = useUserQuery();
  const user = currentUserQuery.data?.user;

  const evaluationsQuery = useStudentEvaluationsQuery(1, 100, topicId);
  const progressQuery = useStudentProgressQuery();
  const attemptQuery = useStudentAttemptQuery(attemptId);

  const startMutation = useStartStudentEvaluationMutation();
  const submitMutation = useSubmitStudentEvaluationMutation();

  const evaluations = evaluationsQuery.data?.data ?? [];
  const evaluation = evaluations.find((item) => item.id === evaluationId);

  const attempt = attemptQuery.data?.data;
  const questions = (attempt?.questions ?? []) as IAttemptQuestion[];

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds(attempt?.expiresAt ?? null),
  );

  const result = attempt as typeof attempt & {
    status?: string;
    percentage?: number;
    score?: number;
    totalMarks?: number;
    passed?: boolean;
    needsManualGrading?: boolean;
  };

  const isSubmitted =
    result?.status === "GRADED" ||
    result?.status === "SUBMITTED" ||
    result?.status === "EXPIRED";

  const startEvaluation = async (item: IStudentEvaluation) => {
    const classId = user?.class?.id;

    if (!classId) return;

    const response = await startMutation.mutateAsync({
      evaluationId: item.id,
      classId: classId,
    });

    setAnswers({});
    setSearchParams({ attemptId: response.data.attemptId });
  };

  const submitAnswers = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!attemptId) return;

    await submitMutation.mutateAsync({
      attemptId,
      answers: questions.map((question) => ({
        questionId: question.id,
        answer: answers[question.id] ?? "",
      })),
    });

    await attemptQuery.refetch();
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      const remaining = getRemainingSeconds(attempt?.expiresAt ?? null);

      setRemainingSeconds(remaining);

      if (remaining <= 0 && attempt?.status === "IN_PROGRESS") {
        submitAnswers();
      }
    }, 1000);

    return () => window.clearInterval(interval);
  }, [attempt?.expiresAt, attempt?.status]);

  if (!evaluationId) {
    const history = progressQuery.data?.data.history ?? [];

    const evaluationsById = evaluations.map((item) => {
      const evaluationAttempts = history.filter(
        (itemAttempt) => itemAttempt.evaluation?.id === item.id,
      );

      const latestAttempt = evaluationAttempts[0];

      const totalAttempt = evaluationAttempts.length;
      const exhausted = totalAttempt >= item.maxAttempts;

      const state = availableState(item);

      return {
        item,
        latestAttempt,
        status: exhausted ? "Completed" : state,
        totalAttempt,
        exhausted,
      };
    });

    const dueCount = evaluationsById.filter(
      (entry) => entry.status === "Due" && !entry.exhausted,
    ).length;

    return (
      <div className="student-page">
        <div className="student-page-heading">
          <div>
            <Typography className="student-eyebrow">
              CHECK YOUR LEARNING
            </Typography>
            <Typography component="h2" className="student-page-title">
              Evaluations
            </Typography>
            <Typography className="student-page-description">
              Published assessments for your class, with your recorded attempts
              and results.
            </Typography>
          </div>
          <Chip
            label={`${dueCount} available`}
            className="student-count-chip"
          />
        </div>
        {(evaluationsQuery.isError || progressQuery.isError) && (
          <Alert severity="error">
            {errorMessage(evaluationsQuery.error ?? progressQuery.error)}
          </Alert>
        )}
        {evaluationsQuery.isLoading || progressQuery.isLoading ? (
          <Paper elevation={0} className="student-panel" sx={{ p: 3 }}>
            <LinearProgress />
            <Typography sx={{ mt: 2 }}>Loading your evaluations…</Typography>
          </Paper>
        ) : (
          <div className="student-evaluation-list">
            {evaluationsById.map(
              ({ item, latestAttempt, status, totalAttempt, exhausted }) => (
                <Paper
                  elevation={0}
                  className="student-evaluation-card"
                  key={item.id}
                >
                  <span
                    className={`student-evaluation-card-icon ${status.toLowerCase()}`}
                  >
                    <AssignmentOutlined />
                  </span>
                  <div className="student-evaluation-card-copy">
                    <strong>{item.title}</strong>
                    <span>
                      {item.subject.name || "Subject"}
                      {typeof item.topic === "object"
                        ? ` · ${item.topic.title}`
                        : ""}
                    </span>
                  </div>
                  <div className="student-evaluation-card-meta">
                    <span>
                      {latestAttempt
                        ? latestAttempt.needsManualGrading
                          ? "Awaiting teacher grading"
                          : `Latest score ${latestAttempt.percentage}%`
                        : `${item.questions?.length} questions`}
                    </span>
                    <span>
                      {item.type} · {item.durationMinutes} min · {totalAttempt}{" "}
                      used out of {item.maxAttempts} attempt
                      {item.maxAttempts > 1 && "s"}
                    </span>
                  </div>
                  <Chip
                    label={status}
                    size="small"
                    className={`student-status-chip ${status.toLowerCase()}`}
                  />
                  <Button
                    component={RouterLink}
                    to={`/student/evaluations/${item.id}`}
                    variant={status === "Due" ? "contained" : "outlined"}
                    disabled={status !== "Due" || exhausted}
                    endIcon={<ArrowForward />}
                  >
                    {exhausted
                      ? "Attempts used"
                      : status === "Due"
                        ? "Start"
                        : status === "Closed"
                          ? "Closed"
                          : "Not open"}
                  </Button>
                </Paper>
              ),
            )}
            {evaluations.length === 0 && (
              <div className="student-empty-state">
                No published evaluations are currently assigned to your class.
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="student-page">
      <Button
        component={RouterLink}
        to="/student/evaluations"
        className="student-back-link"
        startIcon={<ArrowBack />}
      >
        All evaluations
      </Button>
      {(evaluationsQuery.isError || attemptQuery.isError) && (
        <Alert severity="error">
          {errorMessage(evaluationsQuery.error ?? attemptQuery.error)}
        </Alert>
      )}
      {!evaluation && !attemptId && !evaluationsQuery.isLoading ? (
        <Paper elevation={0} className="student-result-panel">
          <Typography component="h2" className="student-page-title">
            Evaluation not available
          </Typography>
          <Typography className="student-page-description">
            It may have been unpublished or may not be assigned to your class.
          </Typography>
        </Paper>
      ) : (
        <>
          <div className="student-evaluation-heading">
            <div>
              <Typography className="student-eyebrow">
                {evaluation?.subject.name.toUpperCase() || "SUBJECT"}
              </Typography>
              <Typography component="h2" className="student-page-title">
                {evaluation?.title ??
                  attempt?.evaluation?.title ??
                  "Evaluation"}
              </Typography>
              <Typography className="student-page-description">
                Read each question carefully, then submit your answers for
                grading.
              </Typography>
            </div>
            {evaluation && (
              <div className="student-evaluation-facts">
                <Chip
                  icon={<LockClockOutlined />}
                  label={`${evaluation.durationMinutes} minutes`}
                  variant="outlined"
                />

                <Chip
                  label={`${evaluation.maxAttempts} attempts`}
                  variant="outlined"
                />
                <Chip
                  label={`${evaluation.passMark}% to pass`}
                  variant="outlined"
                />
              </div>
            )}
          </div>

          {startMutation.isError && (
            <Alert severity="error">{errorMessage(startMutation.error)}</Alert>
          )}
          {submitMutation.isError && (
            <Alert severity="error">{errorMessage(submitMutation.error)}</Alert>
          )}
          {attemptQuery.isLoading && attemptId && <LinearProgress />}
          {!attemptId && evaluation && (
            <Paper elevation={0} className="student-result-panel">
              <span className="student-result-icon">
                <CheckCircleOutlined />
              </span>
              <Typography component="h2" className="student-page-title">
                Ready to begin?
              </Typography>
              <Typography className="student-page-description">
                Your timer starts when the evaluation opens. You can resume an
                in-progress attempt by starting again.
              </Typography>
              {user?.class?.id !== evaluation.class.id && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  This evaluation is not assigned to your class. Please contact
                  your school administrator.
                </Alert>
              )}
              <Button
                variant="contained"
                onClick={() => void startEvaluation(evaluation)}
                disabled={
                  startMutation.isPending ||
                  user?.class?.id !== evaluation.class.id ||
                  availableState(evaluation) === "Upcoming" ||
                  availableState(evaluation) === "Closed"
                }
                endIcon={<ArrowForward />}
              >
                {startMutation.isPending
                  ? "Starting…"
                  : availableState(evaluation) === "Upcoming"
                    ? "Upcoming"
                    : availableState(evaluation) === "Closed"
                      ? "Closed"
                      : "Start evaluation"}
              </Button>
            </Paper>
          )}
          {attemptId && attempt && !attemptQuery.isLoading && (
            <>
              {isSubmitted ? (
                <Paper elevation={0} className="student-result-panel">
                  <span className="student-result-icon">
                    <CheckCircleOutlined />
                  </span>
                  <Typography component="h2" className="student-page-title">
                    {result?.needsManualGrading
                      ? "Submitted for grading"
                      : result?.passed
                        ? "Evaluation passed"
                        : "Evaluation submitted"}
                  </Typography>
                  <Typography className="student-page-description">
                    {result?.needsManualGrading
                      ? "Your written responses need teacher review. Your result will appear in progress when grading is complete."
                      : result?.percentage !== undefined
                        ? `You scored ${result.percentage}% (${result.score}/${result.totalMarks}).`
                        : "Your submission was recorded."}
                  </Typography>
                  <Button
                    component={RouterLink}
                    to="/student/progress"
                    variant="contained"
                    endIcon={<ArrowForward />}
                  >
                    View my progress
                  </Button>
                </Paper>
              ) : (
                <form
                  onSubmit={(event) => void submitAnswers(event)}
                  className="student-question-list"
                >
                  {questions.map((question, index) => (
                    <Paper
                      elevation={0}
                      className="student-question-card"
                      key={question.id}
                    >
                      <div className="student-question-topline">
                        <span>
                          QUESTION {index + 1} OF {questions.length}
                        </span>
                        <span>
                          {question.marks}{" "}
                          {question.marks === 1 ? "mark" : "marks"}
                        </span>
                      </div>
                      <FormControl
                        component="fieldset"
                        required
                        disabled={submitMutation.isPending}
                        fullWidth
                      >
                        <FormLabel
                          component="legend"
                          className="student-question-title"
                        >
                          {question.prompt}
                        </FormLabel>
                        {question.type === "MULTIPLE_CHOICE" ||
                        question.type === "TRUE_FALSE" ? (
                          <RadioGroup
                            name={question.id}
                            value={answers[question.id] ?? ""}
                            onChange={(event) =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: event.target.value,
                              }))
                            }
                          >
                            {question.options.map((option) => (
                              <FormControlLabel
                                key={option.value}
                                value={option.value}
                                control={<Radio required />}
                                label={option.label}
                              />
                            ))}
                          </RadioGroup>
                        ) : (
                          <TextField
                            value={answers[question.id] ?? ""}
                            onChange={(event) =>
                              setAnswers((current) => ({
                                ...current,
                                [question.id]: event.target.value,
                              }))
                            }
                            required
                            multiline={question.type === "ESSAY"}
                            minRows={question.type === "ESSAY" ? 4 : 1}
                            label={
                              question.type === "ESSAY"
                                ? "Your response"
                                : "Your answer"
                            }
                            fullWidth
                          />
                        )}
                      </FormControl>
                    </Paper>
                  ))}
                  {questions.length === 0 && (
                    <Alert severity="error">
                      No questions were returned for this attempt. Contact your
                      teacher before leaving this page.
                    </Alert>
                  )}
                  <Stack direction="row" sx={{ justifyContent: "flex-end" }}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={
                        submitMutation.isPending || questions.length === 0
                      }
                    >
                      {submitMutation.isPending
                        ? "Submitting…"
                        : "Submit evaluation"}
                    </Button>
                  </Stack>
                </form>
              )}
            </>
          )}
        </>
      )}

      {attempt?.id && (
        <Chip
          icon={<AccessAlarm />}
          variant="filled"
          color={remainingSeconds <= 60 ? "error" : "default"}
          sx={{
            color: remainingSeconds <= 60 ? "red" : "gray",
            position: "fixed",
            bottom: "10px",
            right: "2px",
            animation: remainingSeconds <= 60 ? "pulse 1s infinite" : "none",
            "@keyframes pulse": {
              "0%, 100%": {
                opacity: 1,
                transform: "scale(1)",
              },
              "50%": {
                opacity: 0.6,
                transform: "scale(1.05)",
              },
            },
            fonweight: "bold",
          }}
          label={`Time: ${formatTime(remainingSeconds)}`}
        />
      )}
    </div>
  );
};

export default EvaluationPage;
