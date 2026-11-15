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
  MenuBookOutlined,
  TrendingUpOutlined,
  AssignmentOutlined,
  AccountCircleOutlined,
  SchoolOutlined,
  Logout,
  ReceiptLongOutlined,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./student.css";
import LogoutModal from "../components/LogoutModal";
import { useUserQuery } from "../hooks/useUser";
import { drawerWidth, theme } from "../utils/theme";

const navigation = [
  { label: "Home", path: "/student", icon: <DashboardOutlined /> },
  {
    label: "My subjects",
    path: "/student/subjects",
    icon: <MenuBookOutlined />,
  },
  {
    label: "My progress",
    path: "/student/progress",
    icon: <TrendingUpOutlined />,
  },
  {
    label: "Evaluations",
    path: "/student/evaluations",
    icon: <AssignmentOutlined />,
  },
  // {
  //   label: "Schedule",
  //   path: "/student/schedule",
  //   icon: <EventNoteOutlined />,
  // },
  {
    label: "My invoices",
    path: "/student/invoices",
    icon: <ReceiptLongOutlined />,
  },
  {
    label: "My profile",
    path: "/student/profile",
    icon: <AccountCircleOutlined />,
  },
];

const pageTitles: Record<string, string> = {
  "/student": "Home",
  "/student/subjects": "My subjects",
  "/student/progress": "My progress",
  "/student/evaluations": "Evaluations",
  // "/student/schedule": "Class schedule",
  "/student/invoices": "My invoices",
  "/student/profile": "My profile",
};

function StudentLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const { pathname } = useLocation();

  const { data: userData } = useUserQuery();

  const title = pathname.startsWith("/student/subjects/")
    ? "Subject details"
    : pathname.startsWith("/student/topics/")
      ? "Topic details"
      : pathname.startsWith("/student/evaluations/")
        ? "Evaluation"
        : (pageTitles[pathname] ?? "Student workspace");

  const drawerContent = (
    <div className="student-drawer-content">
      <div className="student-brand">
        <div className="student-brand-mark">
          <SchoolOutlined />
        </div>
        <div>
          <strong style={{ textTransform: "capitalize" }}>open study</strong>
          <span>STUDENT SPACE</span>
        </div>
      </div>
      <div className="student-nav-label">YOUR LEARNING</div>
      <List className="student-nav-list" disablePadding>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === "/student"}
            onClick={() => setMobileOpen(false)}
            className="student-nav-item"
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <div className="student-drawer-spacer" />
      <Divider />
      <div className="student-profile-summary">
        <Avatar className="student-sidebar-avatar">
          {userData?.user?.firstName?.[0]}
          {userData?.user?.lastName?.[0]}
        </Avatar>
        <div>
          <strong>
            {userData?.user?.firstName} {userData?.user?.lastName}
          </strong>
          <span>{userData?.user?.class?.name}</span>
        </div>
        <span className="student-online-indicator" aria-label="Online" />
      </div>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="student-shell">
        <AppBar
          position="fixed"
          elevation={0}
          className="student-appbar"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar className="student-toolbar">
            {!isDesktop && (
              <IconButton
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                edge="start"
                className="student-menu-button"
              >
                <MenuIcon />
              </IconButton>
            )}
            <div className="student-toolbar-title">
              <Typography
                component="h1"
                variant="h6"
                sx={{ textTransform: "capitalize" }}
              >
                {title}
              </Typography>
              <Typography variant="caption">
                Your learning journey, one step at a time
              </Typography>
            </div>
            <div className="student-toolbar-spacer" />
            <div
              className=""
              style={{ display: "flex", gap: "5px", alignItems: "center" }}
            >
              <Tooltip title="Student account">
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
                  <Avatar className="student-toolbar-avatar">
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
        <Box component="nav" aria-label="Student navigation">
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
          className="student-main"
          sx={{ ml: { md: `${drawerWidth}px` } }}
        >
          <Toolbar />
          <div className="student-content">
            <Outlet />
          </div>
        </Box>
      </Box>

      <LogoutModal open={logoutModal} setOpen={setLogoutModal} />
    </ThemeProvider>
  );
}

export default StudentLayout;
