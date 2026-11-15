import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  LinearProgress,
  Paper,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  AssignmentTurnedInOutlined,
  GroupsOutlined,
  HourglassTopOutlined,
  MenuBookOutlined,
  PendingActionsOutlined,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import "./teacher-pages.css";
import { getGreeting } from "../../utils/helperFunctions";
import { useUserQuery } from "../../hooks/useUser";
import { useTeacherDashboardQuery } from "../../hooks/useDashboard";
import { useEffect, useMemo } from "react";
import { initials, formatDateAndTime } from "../../utils/helperFunctions";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";

// const upcoming = [
//   {
//     time: "09:00",
//     title: "Mathematics · Linear equations",
//     group: "Junior 2A",
//     tone: "green",
//   },
//   {
//     time: "11:30",
//     title: "Science · Forces and motion",
//     group: "Senior 1B",
//     tone: "blue",
//   },
//   {
//     time: "14:00",
//     title: "Evaluation review",
//     group: "English Language Arts",
//     tone: "coral",
//   },
// ];

export default function TeacherDashboard() {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const { data: userData } = useUserQuery();
  const { isLoading: loadingSchoolInfo } = useSchoolInfoQuery();

  const {
    data: dashboard,
    isLoading: loading,
    isError,
  } = useTeacherDashboardQuery();
  const dashboardData = dashboard?.data;

  const metrics = useMemo(() => {
    return [
      {
        label: "My students",
        value: dashboardData?.summary.totalStudents,
        note: `Across ${dashboardData?.summary.totalClasses} classes`,
        icon: <GroupsOutlined />,
        tone: "green",
      },
      {
        label: "Subjects",
        value: dashboardData?.summary.totalSubjects,
        note: `${dashboardData?.summary.totalClasses} classes assigned`,
        icon: <MenuBookOutlined />,
        tone: "coral",
      },
      {
        label: "Evaluations",
        value: dashboardData?.summary.totalEvaluations,
        note: `${dashboardData?.summary.submissionsToReview} need grading`,
        icon: <AssignmentTurnedInOutlined />,
        tone: "blue",
      },
      {
        label: "To review",
        value: dashboardData?.pendingReviews.length,
        note: "Student submissions",
        icon: <PendingActionsOutlined />,
        tone: "gold",
      },
    ];
  }, [
    dashboardData?.pendingReviews.length,
    dashboardData?.summary.submissionsToReview,
    dashboardData?.summary.totalClasses,
    dashboardData?.summary.totalEvaluations,
    dashboardData?.summary.totalStudents,
    dashboardData?.summary.totalSubjects,
  ]);

  useEffect(() => {
    document.title = `Dashboard | OpenStudy`;
  }, []);

  return (
    <div className="teacher-page">
      {isError && (
        <Alert severity="error">
          Your dashboard could not be loaded. Please try again later.
        </Alert>
      )}

      {loading || loadingSchoolInfo ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={40} aria-label="Loading records" />
        </Box>
      ) : (
        <>
          <div className="teacher-page-heading">
            <div>
              <Typography className="teacher-eyebrow">
                {today.toUpperCase()}
              </Typography>
              <Typography component="h2" className="teacher-page-title">
                {getGreeting()}, {userData?.user?.firstName}
              </Typography>
              <Typography className="teacher-page-description">
                Here&apos;s what your learning community needs today.
              </Typography>
            </div>
            <Button
              component={RouterLink}
              to="/teacher/topics"
              variant="contained"
              endIcon={<ArrowForward />}
            >
              Manage topics
            </Button>
          </div>

          <div className="teacher-metrics-grid">
            {metrics.map((metric) => (
              <Paper
                elevation={0}
                className="teacher-metric"
                key={metric.label}
              >
                <div className={`teacher-metric-icon ${metric.tone}`}>
                  {metric.icon}
                </div>
                <div className="teacher-metric-copy">
                  <Typography>{metric.label}</Typography>
                  <strong>{metric.value}</strong>
                  <span>{metric.note}</span>
                </div>
              </Paper>
            ))}
          </div>

          <Paper
            elevation={0}
            className="teacher-panel"
            sx={{ border: "1px solid #e8ece8" }}
          >
            <div className="teacher-panel-heading">
              <div>
                <Typography component="h3">Pending review</Typography>
                <Typography>
                  Written evaluation responses waiting for your grading
                </Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: "#9a7938",
                }}
              >
                <HourglassTopOutlined fontSize="small" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {dashboardData?.summary.submissionsToReview ?? 0} awaiting
                </Typography>
              </div>
            </div>
            {dashboardData?.pendingReviews.length ? (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                  mt: 2.5,
                }}
              >
                {dashboardData.pendingReviews.map((review) => (
                  <Box
                    key={review.attemptId}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      minWidth: 0,
                      p: 1.75,
                      border: "1px solid #e8ece8",
                      borderRadius: 1.5,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: "#f7f1e4",
                        color: "#9a7938",
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {review.student?.name
                        ? initials(review.student.name)
                        : "ST"}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          overflow: "hidden",
                          color: "#26332b",
                          fontWeight: 700,
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {review.student?.name ?? "Student"}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {review.evaluation?.title ?? "Evaluation"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatDateAndTime(review.submittedAt)}
                      </Typography>
                    </Box>
                    {review.student?.id ? (
                      <Button
                        component={RouterLink}
                        to={`/teacher/students/${review.student.id}/progress`}
                        size="small"
                        endIcon={<ArrowForward />}
                      >
                        Review
                      </Button>
                    ) : (
                      <Button size="small" disabled>
                        Review
                      </Button>
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  justifyItems: "center",
                  gap: 1,
                  py: 4,
                  mt: 1,
                  color: "text.secondary",
                }}
              >
                <AssignmentTurnedInOutlined />
                <Typography variant="body2">
                  No submissions need manual grading right now.
                </Typography>
              </Box>
            )}
          </Paper>

          <div className="teacher-dashboard-grid">
            <Paper elevation={0} className="teacher-panel">
              <div className="teacher-panel-heading">
                <div>
                  <Typography component="h3">Class progress</Typography>
                  <Typography>Learning progress across your classes</Typography>
                </div>
                <Button
                  component={RouterLink}
                  to="/teacher/students"
                  variant="text"
                  endIcon={<ArrowForward />}
                >
                  Students
                </Button>
              </div>
              <div className="teacher-progress-list">
                {dashboardData?.classProgress.map((item) => (
                  <div className="teacher-progress-item" key={item.classId}>
                    <div className="teacher-progress-top">
                      <div>
                        <strong>{item.className}</strong>
                        {/* subject <span>{item.}</span> */}
                      </div>
                      <span className="teacher-progress-count">
                        {item.studentCount} students
                      </span>
                    </div>
                    <div className="teacher-progress-bottom">
                      <LinearProgress
                        variant="determinate"
                        value={item.progressPercentage}
                      />
                      <strong>{item.progressPercentage}%</strong>
                    </div>
                  </div>
                ))}
              </div>
            </Paper>

            {/* <Paper elevation={0} className="teacher-panel teacher-agenda-panel">
              <div className="teacher-panel-heading">
                <div>
                  <Typography component="h3">Today&apos;s agenda</Typography>
                  <Typography>Your teaching schedule</Typography>
                </div>
                <span className="teacher-today-label">TODAY</span>
              </div>
              <div className="teacher-agenda-list">
                {upcoming.map((item) => (
                  <div className="teacher-agenda-item" key={item.time}>
                    <time>{item.time}</time>
                    <span className={`teacher-agenda-marker ${item.tone}`} />
                    <div>
                      <strong>{item.title}</strong>
                      <span>{item.group}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="teacher-agenda-footer">
                <span>Next up</span>
                <strong>Mathematics in 20 min</strong>
              </div>
            </Paper> */}
          </div>

          <Paper elevation={0} className="teacher-panel teacher-students-panel">
            <div className="teacher-panel-heading">
              <div>
                <Typography component="h3">
                  Students to check in with
                </Typography>
                <Typography>
                  Based on recent activity and evaluation results
                </Typography>
              </div>
              <Button
                component={RouterLink}
                to="/teacher/students"
                variant="text"
                endIcon={<ArrowForward />}
              >
                View students
              </Button>
            </div>
            <div className="teacher-student-strip">
              {dashboardData?.studentsToCheckIn.map((student) => (
                <div className="teacher-student-card" key={student.name}>
                  <Avatar variant="rounded">{initials(student.name)}</Avatar>
                  <div>
                    <strong>{student.name}</strong>
                    {student.reasons.map((r, i) => (
                      <span key={i} style={{ display: "block" }}>
                        {r}
                      </span>
                    ))}
                  </div>
                  <Button
                    component={RouterLink}
                    to={`/teacher/students/${student.studentId}`}
                    size="small"
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </Paper>
        </>
      )}
    </div>
  );
}
