/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { Edit, TrendingUp } from "@mui/icons-material";
import {
  useSigleStudentQuery,
  useUpdateStudentStatusMutation,
} from "../../hooks/useStudent";
import AdminDetailShell from "./AdminDetailShell";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { formatDateAndTime } from "../../utils/helperFunctions";
import { useUserQuery } from "../../hooks/useUser";

export default function StudentDetailsPage() {
  const { studentId = "" } = useParams();
  const { data, isLoading, error, refetch } = useSigleStudentQuery(studentId);
  const student = data?.data;
  const name = [student?.firstName, student?.lastName]
    .filter(Boolean)
    .join(" ");

  const { data: userData } = useUserQuery();
  const isTeacher = userData?.user?.role === "TEACHER";

  const updateStudentStatus = useUpdateStudentStatusMutation();

  const [statusModal, setStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = () => {
    setLoading(true);

    const payload = {
      isActive: student?.isActive ? false : true,
    };

    updateStudentStatus.mutate(
      { id: student?.id ?? "", payload },
      {
        onSuccess: (res) => {
          toast.success(res.message);
        },
        onError: (err: any) => {
          toast.error(err?.response?.data.message);
        },
        onSettled: () => {
          setLoading(false);
          setStatusModal(false);
        },
      },
    );
  };

  useEffect(() => {
    document.title = `Student Details | OpenStudy`;
  }, []);

  return (
    <AdminDetailShell
      backTo={
        userData?.user?.role === "ADMIN"
          ? `/admin/students`
          : `/teacher/students`
      }
      backLabel="All students"
      title={name || "Student details"}
      profilePic={student?.profilePic}
      subtitle={student?.email ?? "Student account"}
      initials={`${student?.firstName?.[0] ?? ""}${student?.lastName?.[0] ?? ""}`}
      status={student ? (student.isActive ? "Active" : "Inactive") : undefined}
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      notFound={!isLoading && !error && !student}
      onRetry={() => void refetch()}
    >
      {student && (
        <>
          <Button
            component={RouterLink}
            // students/:studentId/progress
            to={
              isTeacher
                ? `/teacher/students/${studentId}/progress`
                : `/admin/students/${studentId}/progress`
            }
            variant="contained"
            startIcon={<TrendingUp />}
            sx={{ justifySelf: "start" }}
          >
            View student progress
          </Button>
          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Student information
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Email address</span>
                <span className="admin-detail-field-value">
                  {student.email ? (
                    <Link href={`mailto:${student.email}`}>
                      {student.email}
                    </Link>
                  ) : (
                    "Not available"
                  )}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Account status</span>
                <span className="admin-detail-field-value">
                  {student.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Email verified</span>
                <span className="admin-detail-field-value">
                  {student.isEmailVerified ? "Verified" : "Not verified"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Student ID</span>
                <span className="admin-detail-field-value">
                  {student.id ?? student.id ?? studentId}
                </span>
              </div>
            </div>
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Enrollment and activity
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Class</span>
                <span className="admin-detail-field-value">
                  {student.class?.name ?? "Not assigned"}
                  {student.class?.level ? ` · ${student.class.level}` : ""}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Joined</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(student.createdAt)}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Last updated</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(student.updatedAt)}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Last login</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(student.lastLoginAt)}
                </span>
              </div>

              <Button
                variant="contained"
                onClick={() => setStatusModal(true)}
                sx={{ width: "fit-content", height: "fit-content" }}
                color={student?.isActive ? "error" : "success"}
              >
                {student.isActive ? "Deactivate" : "Activate"}
              </Button>
            </div>
          </Paper>
        </>
      )}

      <Dialog
        open={statusModal}
        onClose={() => setStatusModal(false)}
        aria-labelledby="logout-dialog-title"
        aria-describedby="logout-dialog-description"
        role="alertdialog"
      >
        <Edit
          color="error"
          sx={{
            mx: "20px",
            mt: "20px",
            mb: "0px",
            fontSize: "24px",
          }}
        />

        <DialogTitle id="logout-dialog-title" color="error">
          {student?.isActive ? "Deactivate" : "Activate"} {name}?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to{" "}
            {student?.isActive ? "deactivate" : "activate"} {name}? You can
            still change the {name} status again.
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button
            color="info"
            variant="contained"
            disabled={loading}
            onClick={() => setStatusModal(false)}
          >
            Cancel
          </Button>
          <Button
            color={student?.isActive ? "error" : "success"}
            variant="contained"
            disabled={loading}
            onClick={handleUpdateStatus}
          >
            {loading
              ? "Loadding..."
              : student?.isActive
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminDetailShell>
  );
}
