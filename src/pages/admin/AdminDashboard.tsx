import {
  Alert,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  GroupsOutlined,
  PersonOutlined,
  SchoolOutlined,
  ClassOutlined,
  ArrowUpward,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import "./admin-pages.css";
import { useUserQuery } from "../../hooks/useUser";
import { useEffect, useMemo } from "react";
import { initials } from "../../utils/helperFunctions";
import { useAdminDashboardQuery } from "../../hooks/useDashboard";
import StudentEnrollmentChart from "../../components/StudentEnrollmentChart";

const AdminDashboard = () => {
  const today = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const { data: user } = useUserQuery();
  const {
    data: dashboard,
    isLoading: loading,
    isError,
  } = useAdminDashboardQuery();

  const summary = useMemo(() => {
    return dashboard?.data?.summary;
  }, [dashboard?.data?.summary]);

  const recentStudents = useMemo(() => {
    return dashboard?.data?.recentStudents;
  }, [dashboard?.data?.recentStudents]);

  const metrics = useMemo(() => {
    const metricData = dashboard?.data?.summary;

    return [
      {
        label: "Total students",
        value: metricData?.student.totalStudents.toLocaleString(),
        change: `${metricData?.student.trend === "increase" ? "+" : "-"}${metricData?.student.studentPercentageChange}%`,
        icon: <GroupsOutlined />,
        tone: "green",
        href: "/admin/students",
      },
      {
        label: "Active teachers",
        value: metricData?.teacher.activeTeachers,
        change: `${(metricData?.teacher?.teachersJoinedThisMonth ?? 0 > 0) ? "+" : ""}${metricData?.teacher.teachersJoinedThisMonth} this month`,
        icon: <PersonOutlined />,
        tone: "coral",
        href: "/admin/teachers",
      },
      {
        label: "Classes",
        value: metricData?.class.totalClasses,
        change: `Across ${metricData?.class.totalClassLevel} levels`,
        icon: <ClassOutlined />,
        tone: "blue",
        href: "/admin/classes",
      },
      {
        label: "Subjects",
        value: metricData?.subject.totalSubjects,
        change: `${metricData?.subject.activeSubjects} active`,
        icon: <SchoolOutlined />,
        tone: "gold",
        href: "/admin/subjects",
      },
    ];
  }, [dashboard?.data?.summary]);

  useEffect(() => {
    document.title = `Dashboard | OpenStudy`;
  }, []);

  return (
    <div className="admin-page">
      {isError && (
        <Alert severity="error">
          Your dashboard could not be loaded. Please try again later.
        </Alert>
      )}

      {loading ? (
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
          <div className="admin-page-heading">
            <div>
              <Typography className="admin-eyebrow">
                {today.toUpperCase()}
              </Typography>
              <Typography component="h2" className="admin-page-title">
                Good morning, {user?.user?.firstName}
              </Typography>
              <Typography className="admin-page-description">
                Here&apos;s what&apos;s happening across your school.
              </Typography>
            </div>
            <Chip
              label={today}
              variant="outlined"
              className="admin-date-chip"
            />
          </div>

          <div className="admin-metrics-grid">
            {metrics.map((metric) => (
              <Paper
                component={RouterLink}
                to={metric.href}
                elevation={0}
                className="admin-metric"
                key={metric.label}
              >
                <div className={`admin-metric-icon ${metric.tone}`}>
                  {metric.icon}
                </div>
                <div className="admin-metric-copy">
                  <Typography>{metric.label}</Typography>
                  <strong>{metric.value}</strong>
                  <span
                    className={metric.change.startsWith("+") ? "positive" : ""}
                  >
                    {metric.change.startsWith("+") && (
                      <ArrowUpward fontSize="inherit" />
                    )}
                    {metric.change}
                  </span>
                </div>
              </Paper>
            ))}
          </div>

          <div className="admin-dashboard-grid">
            <Paper elevation={0} className="admin-panel admin-enrollment-panel">
              <div
                className="admin-bar-chart"
                role="img"
                aria-label="New student registrations from Monday to Sunday"
              >
                <StudentEnrollmentChart />
              </div>
            </Paper>

            <Paper elevation={0} className="admin-panel admin-quick-panel">
              <div className="admin-panel-heading">
                <div>
                  <Typography component="h3">At a glance</Typography>
                  <Typography>Your learning community</Typography>
                </div>
              </div>
              <Stack className="admin-glance-list" spacing={0}>
                <div>
                  <span className="admin-glance-marker published" />
                  <span>Published lessons</span>
                  <strong>{summary?.lesson.publishedLesson}</strong>
                </div>
                <div>
                  <span className="admin-glance-marker draft" />
                  <span>Draft lessons</span>
                  <strong>{summary?.lesson.draftLesson}</strong>
                </div>
                {/* <div>
                  <span className="admin-glance-marker invite" />
                  <span>Pending invitations</span>
                  <strong>12</strong>
                </div> */}
              </Stack>
              <div className="admin-glance-footer">
                <span>Average class size</span>
                <strong>
                  {summary?.class.averageClassSize}
                  <small>%</small>
                </strong>
              </div>
            </Paper>
          </div>

          <Paper elevation={0} className="admin-panel admin-recent-panel">
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <div>
                <Typography component="h3">Recent students</Typography>
                <Typography>
                  Latest student registrations and invitations
                </Typography>
              </div>
              <Box
                component={RouterLink}
                to="/admin/students"
                className="admin-text-link"
              >
                View all students <span aria-hidden="true">→</span>
              </Box>
            </Box>
            <TableContainer>
              <Table aria-label="Recent students" size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>STUDENT</TableCell>
                    <TableCell>CLASS</TableCell>
                    <TableCell>JOINED</TableCell>
                    <TableCell>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentStudents?.map((student) => (
                    <TableRow key={student.email}>
                      <TableCell>
                        <div className="admin-person-cell">
                          <Avatar>{initials(student?.firstName)}</Avatar>
                          <div>
                            <strong>
                              {student.firstName} {student.lastName}
                            </strong>
                            <span>{student.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.class?.name}</TableCell>
                      <TableCell>{student.createdAt?.split("T")[0]}</TableCell>
                      <TableCell>
                        <span
                          className={`admin-status ${student.isActive ? "Active".toLowerCase() : "Inactive".toLowerCase()}`}
                        >
                          {student.isActive ? "Active" : "Inactive"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
