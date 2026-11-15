import { useEffect, type ReactNode } from "react";
import {
  Box,
  CssBaseline,
  Link,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import "./auth.css";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";

const theme = createTheme({
  palette: {
    primary: { main: "#22634d", dark: "#184a39", contrastText: "#ffffff" },
    secondary: { main: "#e98562" },
    background: { default: "#f7f8f5", paper: "#ffffff" },
    text: { primary: "#202923", secondary: "#69746d" },
  },
  shape: { borderRadius: 10 },
  typography: {
    fontFamily: "Roboto, sans-serif",
    button: { fontWeight: 600, textTransform: "none" },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderRadius: 8,
          boxShadow: "none",
          "&:hover": { boxShadow: "none", backgroundColor: "#184a39" },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 8, backgroundColor: "#fff" },
      },
    },
  },
});

type AuthPageLayoutProps = {
  children: ReactNode;
  title: string;
  pageTitle: string;
  description: string;
  footer: ReactNode;
};

export function AuthPageLayout({
  children,
  title,
  pageTitle,
  description,
  footer,
}: AuthPageLayoutProps) {
  useEffect(() => {
    document.title = `${pageTitle} | OpenStudy`;
  }, [pageTitle]);

  const schoolInfoQuery = useSchoolInfoQuery();
  const info = schoolInfoQuery.data?.data;

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box className="auth-page">
        <Box component="main" className="auth-form-side">
          <Box className="auth-form-wrap">
            <Link
              href="/login"
              underline="none"
              className="auth-brand"
              aria-label="OpenStudy home"
            >
              {info?.logo ? (
                <img
                  style={{
                    width: "35px",
                    height: "35px",
                    border: "2px solid #fff",
                    background: "#e9f2ec",
                    borderRadius: "10px",
                  }}
                  src={info.logo}
                  alt={info.name}
                />
              ) : (
                <span className="auth-brand-mark" aria-hidden="true">
                  o
                </span>
              )}
              <span>
                {info?.name ? info.name.split(" ")[0] : "open"}
                <span>{info?.name ? info.name.split(" ")[1] : "study"}</span>
              </span>
            </Link>
            <Box className="auth-heading">
              <Typography component="h1" variant="h4">
                {title}
              </Typography>
              <Typography color="text.secondary">{description}</Typography>
            </Box>
            {children}
            <Typography component="div" variant="body2" className="auth-footer">
              {footer}
            </Typography>
            <Typography
              component="div"
              variant="caption"
              className="auth-legal"
            >
              By continuing, you agree to OpenStudy&apos;s Terms and Privacy
              Policy.
            </Typography>
          </Box>
        </Box>
        <Box
          component="aside"
          className="auth-story"
          aria-label="Learn at your own pace"
        >
          <div className="auth-story-image" />
          <div className="auth-story-content">
            <span className="auth-story-kicker">
              A little progress, every day
            </span>
            <Typography component="p" className="auth-story-quote">
              Make room for the things you&apos;re curious about.
            </Typography>
            <Typography component="p" className="auth-story-note">
              Your next idea, skill, or big breakthrough starts here.
            </Typography>
            <div className="auth-story-bottom">
              <span className="auth-story-dot" />
              <span>Built for curious minds</span>
              <span className="auth-story-bottom-line" />
            </div>
          </div>
          <div className="auth-story-caption">
            OPENSTUDY <span>·</span> LEARN IN YOUR OWN WAY
          </div>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
