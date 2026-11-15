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
  GroupsOutlined,
  PersonOutlined,
  SchoolOutlined,
  ClassOutlined,
  MenuBookOutlined,
  Logout,
  Settings,
  ReceiptLongOutlined,
  PaymentsOutlined,
  AccountBalanceWalletOutlined,
} from "@mui/icons-material";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import "./admin.css";
import LogoutModal from "../components/LogoutModal";
import { useUserQuery } from "../hooks/useUser";
import { drawerWidth, theme } from "../utils/theme";

const navigation = [
  { label: "Overview", path: "/admin", icon: <DashboardOutlined /> },
  { label: "Teachers", path: "/admin/teachers", icon: <PersonOutlined /> },
  { label: "Students", path: "/admin/students", icon: <GroupsOutlined /> },
  { label: "Classes", path: "/admin/classes", icon: <ClassOutlined /> },
  { label: "Invoices", path: "/admin/invoices", icon: <ReceiptLongOutlined /> },
  {
    label: "Transactions",
    path: "/admin/transactions",
    icon: <PaymentsOutlined />,
  },
  {
    label: "Payroll",
    path: "/admin/payroll",
    icon: <AccountBalanceWalletOutlined />,
  },
  { label: "Subjects", path: "/admin/subjects", icon: <SchoolOutlined /> },
  { label: "Topics", path: "/admin/topics", icon: <MenuBookOutlined /> },
  // { label: "Schedule", path: "/admin/schedule", icon: <EventNoteOutlined /> },
  { label: "Settings", path: "/admin/settings", icon: <Settings /> },
];

const pageTitles: Record<string, string> = {
  "/admin": "Overview",
  "/admin/teachers": "Teachers",
  "/admin/students": "Students",
  "/admin/classes": "Classes",
  "/admin/invoices": "Invoices",
  "/admin/transactions": "Transactions",
  "/admin/payroll": "Payroll",
  "/admin/subjects": "Subjects",
  "/admin/topics": "Topics",
  // "/admin/schedule": "School schedule",
  "/admin/settings": "Settings",
};

function AdminLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const isDesktop = useMediaQuery(theme.breakpoints.up("md"));
  const location = useLocation();
  const title =
    pageTitles[location.pathname] ??
    (location.pathname.startsWith("/admin/topics/")
      ? "Topic management"
      : "Administration");

  const { data: user } = useUserQuery();

  const drawerContent = (
    <div className="admin-drawer-content">
      <div className="admin-brand">
        <div className="admin-brand-mark">
          <SchoolOutlined />
        </div>
        <div>
          <strong style={{ textTransform: "capitalize" }}>open study</strong>
          <span>LEARNING PLATFORM</span>
        </div>
      </div>
      <div className="admin-nav-label">WORKSPACE</div>
      <List className="admin-nav-list" disablePadding>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            component={NavLink}
            to={item.path}
            end={item.path === "/admin"}
            onClick={() => setMobileOpen(false)}
            className="admin-nav-item"
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <div className="admin-drawer-spacer" />
      <Divider />

      {/* Footer */}
      <div className="admin-profile">
        <Avatar className="admin-avatar">
          {" "}
          {user?.user?.firstName?.[0]}
          {user?.user?.lastName?.[0]}
        </Avatar>
        <div className="admin-profile-copy">
          <strong>
            {user?.user?.firstName} {user?.user?.lastName}
          </strong>
          <span>Administrator</span>
        </div>
        <span className="admin-profile-status" aria-label="Online" />
      </div>
    </div>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="admin-shell">
        <AppBar
          position="fixed"
          elevation={0}
          className="admin-appbar"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar className="admin-toolbar">
            {!isDesktop && (
              <IconButton
                aria-label="Open navigation"
                onClick={() => setMobileOpen(true)}
                edge="start"
                className="admin-menu-button"
              >
                <MenuIcon />
              </IconButton>
            )}
            <div className="admin-toolbar-title">
              <Typography variant="h6" component="h1">
                {title}
              </Typography>
              <Typography variant="caption">
                Manage your learning community
              </Typography>
            </div>
            <div className="admin-toolbar-spacer" />
            <div
              className=""
              style={{ display: "flex", gap: "5px", alignItems: "center" }}
            >
              <Tooltip title="Administrator account">
                {user?.user?.profilePic ? (
                  <img
                    style={{
                      width: "36px",
                      height: "36px",
                      border: "4px solid #fff",
                      background: "#e7efe9",
                      borderRadius: "100%",
                    }}
                    src={user.user.profilePic}
                    alt={user?.user?.firstName ?? "" + user?.user?.lastName}
                  />
                ) : (
                  <Avatar
                    className="admin-toolbar-avatar"
                    sx={{ textTransform: "uppercase" }}
                  >
                    {user?.user?.firstName?.[0]}
                    {user?.user?.lastName?.[0]}
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
        <Box component="nav" aria-label="Main navigation">
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
          className="admin-main"
          sx={{ ml: { md: `${drawerWidth}px` } }}
        >
          <Toolbar />
          <div className="admin-content">
            <Outlet />
          </div>
        </Box>
      </Box>

      <LogoutModal open={logoutModal} setOpen={setLogoutModal} />
    </ThemeProvider>
  );
}

export default AdminLayout;
