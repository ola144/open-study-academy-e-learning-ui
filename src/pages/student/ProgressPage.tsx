import {
  Alert,
  Chip,
  LinearProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { CheckCircleOutlined, HourglassTopOutlined } from "@mui/icons-material";
import { useStudentProgressQuery } from "../../hooks/useStudentLearning";
import "./student-pages.css";
import { errorMessage } from "../../utils/helperFunctions";
import { useEffect } from "react";

const titleOf = (evaluation: unknown) =>
  evaluation && typeof evaluation === "object" && "title" in evaluation
    ? String(evaluation.title)
    : "Evaluation";

const dateLabel = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value))
    : "Not submitted";

const ProgressPage = () => {
  const progressQuery = useStudentProgressQuery();
  const progress = progressQuery.data?.data;

  const totals = progress?.totals;
  const history = progress?.history ?? [];

  const completionPercent = totals?.attempts
    ? Math.round((totals.passed / Math.max(1, totals.gradedAttempts)) * 100)
    : 0;

  useEffect(() => {
    document.title = `Progress | OpenStudy`;
  }, []);

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <div>
          <Typography className="student-eyebrow">
            YOUR LEARNING JOURNEY
          </Typography>
          <Typography component="h2" className="student-page-title">
            My Progress
          </Typography>
          <Typography className="student-page-description">
            Review your submitted evaluations and the results recorded for your
            account.
          </Typography>
        </div>
      </div>

      {progressQuery.isError && (
        <Alert severity="error">{errorMessage(progressQuery.error)}</Alert>
      )}
      {progressQuery.isLoading ? (
        <Paper elevation={0} className="student-panel" sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading your progress…</Typography>
        </Paper>
      ) : progress ? (
        <>
          <div className="student-progress-stats">
            <Paper elevation={0}>
              <span>Attempts submitted</span>
              <strong>{totals?.attempts ?? 0}</strong>
              <div className="student-stat-footnote">
                {totals?.gradedAttempts ?? 0} graded
              </div>
            </Paper>
            <Paper elevation={0}>
              <span>Average score</span>
              <strong>
                {totals?.averagePercentage ?? 0}
                <small>%</small>
              </strong>
              <div className="student-stat-footnote">
                Across graded attempts
              </div>
            </Paper>
            <Paper elevation={0}>
              <span>Evaluations passed</span>
              <strong>{totals?.passed ?? 0}</strong>
              <div className="student-stat-footnote">
                {totals?.failed ?? 0} not passed yet
              </div>
            </Paper>
          </div>

          <Paper elevation={0} className="student-panel student-subject-report">
            <div className="student-panel-heading">
              <div>
                <Typography component="h3">Attempt history</Typography>
                <Typography>
                  Results and grading status returned by your school
                </Typography>
              </div>
              {(totals?.pendingManualGrading ?? 0) > 0 && (
                <Chip
                  icon={<HourglassTopOutlined />}
                  label={`${totals?.pendingManualGrading} awaiting grading`}
                  size="small"
                />
              )}
            </div>
            <Table aria-label="Evaluation attempt history">
              <TableHead>
                <TableRow>
                  <TableCell>EVALUATION</TableCell>
                  <TableCell>STARTED</TableCell>
                  <TableCell>SUBMITTED</TableCell>
                  <TableCell>EXPIRES</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell>SCORE</TableCell>
                  <TableCell>RESULT</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((attempt) => {
                  const graded =
                    attempt.status === "GRADED" ||
                    (attempt.status === "EXPIRED" &&
                      !attempt.needsManualGrading);
                  return (
                    <TableRow key={attempt.attemptId}>
                      <TableCell>{titleOf(attempt.evaluation)}</TableCell>
                      <TableCell>{dateLabel(attempt.startedAt)}</TableCell>
                      <TableCell>{dateLabel(attempt.submittedAt)}</TableCell>
                      <TableCell>{dateLabel(attempt.expiresAt)}</TableCell>
                      <TableCell>
                        {attempt.needsManualGrading ? (
                          <Chip label="Awaiting grading" size="small" />
                        ) : (
                          attempt.status.replaceAll("_", " ")
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
                              ) : undefined
                            }
                            label={attempt.passed ? "Passed" : "Try again"}
                            size="small"
                            color={attempt.passed ? "success" : "default"}
                          />
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {history.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No evaluation attempts have been recorded yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="student-progress-report-bar">
              <span>Pass rate</span>
              <LinearProgress variant="determinate" value={completionPercent} />
              <strong>{completionPercent}%</strong>
            </div>
          </Paper>
        </>
      ) : null}
    </div>
  );
};

export default ProgressPage;
