import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { CircularProgress } from "@mui/material";
import { useUserQuery } from "../../hooks/useUser";

type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

interface ProtectedRouteProps {
  allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const userQuery = useUserQuery();
  const user = userQuery.data?.user;
  const location = useLocation();

  const isLoading = userQuery.isPending;

  useEffect(() => {
    if (isLoading) return;

    if (window.location.pathname !== "/login") {
      if (userQuery.isError || !user) {
        toast.info("Authentication is required. Please log in!");
        return;
      }

      if (!allowedRoles.some((role) => role === user?.role)) {
        toast.error("You don't have permission to access this page!");
      }
    }
  }, [isLoading, userQuery.isError, user, allowedRoles]);

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  if (userQuery.isError || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Check the user's role.
  if (!allowedRoles.some((role) => role === user.role)) {
    switch (user?.role) {
      case "ADMIN":
        return <Navigate to="/admin" replace />;

      case "TEACHER":
        return <Navigate to="/teacher" replace />;

      case "STUDENT":
        return <Navigate to="/student" replace />;

      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <Outlet />;
};
