import { createTheme } from "@mui/material";

export const drawerWidth = 252;

export const theme = createTheme({
  palette: {
    primary: { main: "#28624e", dark: "#1f4c3d", contrastText: "#ffffff" },
    background: { default: "#f5f7f4", paper: "#ffffff" },
    text: { primary: "#202a24", secondary: "#717b74" },
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: "Roboto, sans-serif",
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: { styleOverrides: { root: { boxShadow: "none" } } },
    MuiPaper: { styleOverrides: { rounded: { borderRadius: 8 } } },
  },
});
