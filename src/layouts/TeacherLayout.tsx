import { useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import {
  Menu as MenuIcon,
  DashboardOutlined,
  SchoolOutlined,
  TopicOutlined,
  FactCheckOutlined,
  QuizOutlined,
  GroupsOutlined,
  Logout,
  AccountCircleOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./teacher.css";
import LogoutModal from "../components/LogoutModal";
import { useUserQuery } from "../hooks/useUser";
import { drawerWidth, theme } from "../utils/theme";

const navigation = [
  { label: "Overview", path: "/teacher", icon: <DashboardOutlined /> },
  { label: "Subjects", path: "/teacher/subjects", icon: <SchoolOutlined /> },
  { label: "Topics", path: "/teacher/topics", icon: <TopicOutlined /> },
  {
    label: "Evaluations",
    path: "/teacher/evaluations",
    icon: <FactCheckOutlined />,
  },
  { label: "Questions", path: "/teacher/questions", icon: <QuizOutlined /> },
  { label: "Students", path: "/teacher/students", icon: <GroupsOutlined /> },
  {
    label: "Payroll",
    path: "/teacher/payroll",
    icon: <AccountBalanceWalletOutlined />,
  },
  // { label: "Schedule", path: "/teacher/schedule", icon: <EventNoteOutlined /> },
  {
    label: "Profile",
    path: "/teacher/profile",
    icon: <AccountCircleOutlined />,
  },
];

const pageTitles: Record<string, string> = {
  "/teacher": "Overview",
  "/teacher/subjects": "My subjects",
  "/teacher/topics": "Topics",
  "/teacher/evaluations": "Evaluations",
  "/teacher/questions": "Question bank",
  "/teacher/students": "My students",
  "/teacher/payroll": "My payroll",
  "/teacher/schedule": "Teaching schedule",
  // "/teacher/profile": "My profile",
};

function TeacherLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { pathname } = useLocation();
  const title =
    pathname.endsWith("/progress") && pathname.startsWith("/teacher/students/")
      ? "Student progress"
      : (pageTitles[pathname] ?? "Teacher workspace");

  const { data: userData } = useUserQuery();

  const drawerContent = (
    <div className="teacher-drawer-content">
      <div className="teacher-brand">
        <div className="teacher-brand-mark">
          <SchoolOutlined />
        </div>
        <div>
          <strong style={{ textTransform: "capitalize" }}>open study</strong>
          <span>TEACHER WORKSPACE</span>
        </div>
      </div>
      <div className="teacher-nav-label">TEACHING</div>
      <List className="teacher-nav-list" disablePadding>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === "/teacher"}
            onClick={() => setMobileOpen(false)}
            className="teacher-nav-item"
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <div className="teacher-drawer-spacer" />
      <Divider />
      <div className="teacher-profile">
        <Avatar className="teacher-profile-avatar">
          {userData?.user?.firstName?.[0]}
          {userData?.user?.lastName?.[0]}
        </Avatar>
        <div>
          <strong>
            {userData?.user?.firstName} {userData?.user?.lastName}
          </strong>
          <span>{userData?.user?.role}</span>
        </div>
        <span className="teacher-profile-status" aria-label="Online" />
      </div>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="teacher-shell">
        <AppBar
          position="fixed"
          elevation={0}
          className="teacher-appbar"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar className="teacher-toolbar">
            {!isDesktop && (
              <IconButton
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                edge="start"
                className="teacher-menu-button"
              >
                <MenuIcon />
              </IconButton>
            )}
            <div className="teacher-toolbar-title">
              <Typography
                sx={{ textTransform: "uppercase" }}
                component="h1"
                variant="h6"
              >
                {title}
              </Typography>
              <Typography variant="caption">
                Your classes, content, and student progress
              </Typography>
            </div>
            <div className="teacher-toolbar-spacer" />
            <div
              className=""
              style={{ display: "flex", gap: "5px", alignItems: "center" }}
            >
              <Tooltip title="Teacher account">
                {userData?.user?.profilePic ? (
                  <img
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "4px solid #fff",
                      background: "#e7efe9",
                      borderRadius: "100%",
                    }}
                    src={userData.user.profilePic}
                    alt={
                      userData?.user?.firstName ?? "" + userData?.user?.lastName
                    }
                  />
                ) : (
                  <Avatar className="teacher-toolbar-avatar">
                    {userData?.user?.firstName?.[0]}
                    {userData?.user?.lastName?.[0]}
                  </Avatar>
                )}
              </Tooltip>
              <button
                style={{
                  background: "red",
                  color: "white",
                  borderRadius: "5px",
                  padding: "10px 8px",
                  height: "35px",
                  border: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => setLogoutModal(true)}
              >
                <Logout sx={{ fontSize: 18 }} />
              </button>
            </div>
          </Toolbar>
        </AppBar>
        <Box component="nav" aria-label="Teacher navigation">
          <Drawer
            variant="temporary"
            open={!isDesktop && mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none", zIndex: 1300 },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
          <Drawer
            variant="permanent"
            open
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": { width: drawerWidth },
            }}
          >
            {drawerContent}
          </Drawer>
        </Box>
        <Box
          component="main"
          className="teacher-main"
          sx={{ ml: { md: `${drawerWidth}px` } }}
        >
          <Toolbar />
          <div className="teacher-content">
            <Outlet />
          </div>
        </Box>
      </Box>

      <LogoutModal open={logoutModal} setOpen={setLogoutModal} />
    </ThemeProvider>
  );
}

export default TeacherLayout;
