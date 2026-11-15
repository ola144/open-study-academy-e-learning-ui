import {
  Alert,
  Avatar,
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  AssignmentOutlined,
  Book,
  LocalFireDepartmentOutlined,
  MenuBookOutlined,
  StarsOutlined,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import "./student-pages.css";
import { useUserQuery } from "../../hooks/useUser";
import { useStudentDashboardQuery } from "../../hooks/useDashboard";
import { useEffect, useMemo } from "react";
import { errorMessage } from "../../utils/helperFunctions";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";

const tones = ["green", "coral", "blue", "gold"];

const StudentDashboard = () => {
  const { data: userData } = useUserQuery();
  const dashboardQuery = useStudentDashboardQuery();
  const schoolInfoQuery = useSchoolInfoQuery();

  const dashboard = dashboardQuery.data?.data;
  const firstName = userData?.user?.firstName;
  const lastName = userData?.user?.lastName;

  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "2-digit",
  }).format(new Date());

  const stats = useMemo(() => {
    return [
      {
        title: "Subjects",
        value: dashboard?.summary.totalSubjects ?? "—",
        icon: <MenuBookOutlined />,
        color: "green",
      },
      {
        title: "Topics",
        value: dashboard?.summary.totalTopics ?? "—",
        icon: <Book />,
        color: "yellow",
      },
      {
        title: "Topics completed",
        value: dashboard?.summary.completedTopics ?? "—",
        icon: <StarsOutlined />,
        color: "coral",
      },
      {
        title: "Learning streak",
        value: dashboard?.summary.learningStreak ?? "—",
        icon: <LocalFireDepartmentOutlined />,
        color: "gold",
      },
    ];
  }, [
    dashboard?.summary.completedTopics,
    dashboard?.summary.learningStreak,
    dashboard?.summary.totalSubjects,
    dashboard?.summary.totalTopics,
  ]);

  useEffect(() => {
    document.title = `Dashboard | OpenStudy`;
  }, []);

  return (
    <div className="student-page">
      <div className="student-welcome">
        <div>
          <Typography className="student-eyebrow">
            {today.toUpperCase()}
          </Typography>
          <Typography component="h2" className="student-page-title">
            You&apos;re making great progress, {firstName}.
          </Typography>
          <Typography className="student-page-description">
            A little learning today adds up to a lot tomorrow.
          </Typography>
        </div>
        <Avatar className="student-welcome-avatar">
          {firstName?.[0]}
          {lastName?.[0]}
        </Avatar>
      </div>

      {dashboardQuery.isError && (
        <Alert severity="error">
          {errorMessage(dashboardQuery.error) ||
            "Your dashboard could not be loaded. Please try again later."}
        </Alert>
      )}

      <div className="student-stat-grid">
        {stats.map((stat, index) => (
          <Paper elevation={0} key={index} className="student-stat-card">
            <span className={`student-stat-icon ${stat.color}`}>
              {stat.icon}
            </span>
            <div>
              <span>{stat.title}</span>
              <strong>{stat.value}</strong>
            </div>
          </Paper>
        ))}
      </div>

      <Paper
        elevation={0}
        className="student-panel student-subject-progress-panel"
      >
        <div className="student-panel-heading">
          <div>
            <Typography component="h3">Pick up where you left off</Typography>
            <Typography>Your current subjects and topic progress</Typography>
          </div>
          <Button
            component={RouterLink}
            to="/student/subjects"
            variant="text"
            endIcon={<ArrowForward />}
          >
            All subjects
          </Button>
        </div>
        <div className="student-subject-progress-list">
          {dashboardQuery.isLoading || schoolInfoQuery.isPending ? (
            <LinearProgress />
          ) : (
            (dashboard?.subjects ?? [])?.slice(0, 3).map((subject, index) => (
              <div className="student-subject-progress-row" key={subject.id}>
                <span
                  className={`student-course-icon ${tones[index % tones.length]}`}
                >
                  <MenuBookOutlined />
                </span>
                <div className="student-subject-progress-main">
                  <div className="student-subject-progress-copy">
                    <strong>{subject.name}</strong>
                    <span>
                      {subject.completedTopics} of {subject.totalTopics} topics
                    </span>
                  </div>
                  <LinearProgress
                    variant="determinate"
                    value={subject.progress}
                  />
                </div>
                <Button
                  component={RouterLink}
                  to={`/student/subjects/${subject.id}`}
                  size="small"
                  aria-label={`Open ${subject.name}`}
                >
                  Open
                </Button>
              </div>
            ))
          )}
          {!dashboardQuery.isLoading &&
            !dashboardQuery.isError &&
            (dashboard?.subjects ?? []).length === 0 && (
              <div className="student-empty-inline">
                Your subject progress will appear here as you complete topics.
              </div>
            )}
        </div>
      </Paper>

      {dashboard?.availableEvaluation.length !== 0 && (
        <Paper
          elevation={0}
          className="student-panel student-next-panel"
          style={{ rowGap: "10px" }}
        >
          <div className="student-panel-heading">
            <div>
              <Typography component="h3">Up next</Typography>
              <Typography>Your next learning checkpoint</Typography>
            </div>
            <Button
              component={RouterLink}
              to="/student/evaluations"
              size="small"
              endIcon={<ArrowForward />}
            >
              View evaluations
            </Button>
          </div>

          {dashboardQuery.isLoading || schoolInfoQuery.isPending ? (
            <LinearProgress />
          ) : (
            <>
              {dashboard?.availableEvaluation.map((evaluation, index) => (
                <Box
                  component="div"
                  sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                    flexWrap: { sm: "nowrap", xs: "wrap" },
                    gap: "10px",
                  }}
                  key={evaluation.id}
                >
                  <Box
                    component="div"
                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                  >
                    <span
                      className={`student-recent-check ${tones[index % tones.length]}`}
                      aria-hidden="true"
                    >
                      <AssignmentOutlined sx={{ fontSize: 12 }} />
                    </span>
                    <div>
                      <Typography
                        variant="body1"
                        sx={{ fontSize: 10, fontWeight: "bold" }}
                      >
                        {evaluation.title}
                      </Typography>
                      <Typography
                        sx={{ display: "block", fontSize: 10, color: "gray" }}
                      >
                        {evaluation.subject.name}
                      </Typography>
                    </div>
                  </Box>
                  <Button
                    component={RouterLink}
                    sx={{
                      width: { sm: "fit-content", xs: "100%" },
                      fontSize: 10,
                    }}
                    to={`/student/evaluations/${evaluation.id}`}
                    size="small"
                    variant="contained"
                  >
                    Start
                  </Button>
                </Box>
              ))}
            </>
          )}
        </Paper>
      )}

      <Paper elevation={0} className="student-panel student-recent-panel">
        <div className="student-panel-heading">
          <div>
            <Typography component="h3">Recent learning</Typography>
            <Typography>Your latest completed topics</Typography>
          </div>
          <Button
            component={RouterLink}
            to="/student/progress"
            variant="text"
            endIcon={<ArrowForward />}
          >
            View progress
          </Button>
        </div>
        <div className="student-recent-list">
          {dashboardQuery.isLoading || schoolInfoQuery.isPending ? (
            <LinearProgress />
          ) : (
            (dashboard?.recentLearning ?? []).map((item, index) => (
              <div className="student-recent-row" key={item.id}>
                <span
                  className={`student-recent-check ${tones[index % tones.length]}`}
                  aria-hidden="true"
                >
                  ✓
                </span>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.subject.name}</span>
                </div>
                <span className="student-recent-detail">
                  Completed ·{" "}
                  {new Intl.DateTimeFormat("en", {
                    month: "short",
                    day: "numeric",
                  }).format(new Date(item?.completedAt ?? new Date()))}
                </span>
                <Button
                  component={RouterLink}
                  to={`/student/topics/${item.id}`}
                  size="small"
                >
                  Review
                </Button>
              </div>
            ))
          )}
        </div>
        {!dashboardQuery.isLoading &&
          !dashboardQuery.isError &&
          (dashboard?.recentLearning ?? []).length === 0 && (
            <div className="student-empty-inline">
              Your recently completed topics will appear here.
            </div>
          )}
      </Paper>
    </div>
  );
};

export default StudentDashboard;
