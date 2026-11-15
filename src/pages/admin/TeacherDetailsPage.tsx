/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Link,
  Paper,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  useSigleTeacherQuery,
  useUpdateTeacherStatusMutation,
} from "../../hooks/useTeacher";
import AdminDetailShell from "./AdminDetailShell";
import { useEffect, useState } from "react";
import { useResendInvitationMutation } from "../../hooks/useAuth";
import { toast } from "react-toastify";
import { Edit } from "@mui/icons-material";
import { formatDateAndTime } from "../../utils/helperFunctions";

export default function TeacherDetailsPage() {
  const { teacherId = "" } = useParams();
  const { data, isLoading, error, refetch } = useSigleTeacherQuery(teacherId);
  const teacher = data?.data;
  const name = [teacher?.firstName, teacher?.lastName]
    .filter(Boolean)
    .join(" ");
  const assignedSubjects = teacher?.assignedSubjects ?? [];

  const [resendingInv, setResendingInv] = useState(false);
  const [statusModal, setStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const resendInvitationMutation = useResendInvitationMutation();
  const updateTeacherStatus = useUpdateTeacherStatusMutation();

  const handleResendInvitation = () => {
    setResendingInv(true);

    resendInvitationMutation.mutate(teacher?.id ?? "", {
      onSuccess: (res) => {
        toast.success(res.message);
      },
      onError: (err: any) => {
        toast.error(err?.response?.data.message);
      },
      onSettled: () => {
        setResendingInv(false);
      },
    });
  };

  const handleUpdateStatus = () => {
    setLoading(true);

    const payload = {
      isActive: teacher?.isActive ? false : true,
    };

    updateTeacherStatus.mutate(
      { id: teacher?.id ?? "", payload },
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
    document.title = `Teacher Details | OpenStudy`;
  }, []);

  return (
    <AdminDetailShell
      backTo="/admin/teachers"
      backLabel="All teachers"
      title={name || "Teacher details"}
      subtitle={teacher?.email ?? "Teacher account"}
      initials={`${teacher?.firstName?.[0] ?? ""}${teacher?.lastName?.[0] ?? ""}`}
      profilePic={teacher?.profilePic}
      status={teacher ? (teacher.isActive ? "Active" : "Inactive") : undefined}
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      notFound={!isLoading && !error && !teacher}
      onRetry={() => void refetch()}
    >
      {teacher && (
        <>
          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Teacher information
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Email address</span>
                <span className="admin-detail-field-value">
                  {teacher.email ? (
                    <Link href={`mailto:${teacher.email}`}>
                      {teacher.email}
                    </Link>
                  ) : (
                    "Not available"
                  )}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Account status</span>
                <span className="admin-detail-field-value">
                  {teacher.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Email verified</span>
                <span className="admin-detail-field-value">
                  {teacher.isEmailVerified ? "Verified" : "Not verified"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Teacher ID</span>
                <span className="admin-detail-field-value">
                  {teacher.id ?? teacher.id ?? teacherId}
                </span>
              </div>
            </div>
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Teaching assignments
            </Typography>
            {assignedSubjects.length ? (
              <div className="admin-detail-chip-list">
                {assignedSubjects.map((subject: any, index: number) => (
                  <Chip
                    key={
                      typeof subject === "string"
                        ? subject
                        : (subject.id ?? `${subject.name}-${index}`)
                    }
                    label={
                      typeof subject === "string"
                        ? subject
                        : [
                            subject.name,
                            subject.class?.name
                              ? `· ${subject.class.name}`
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")
                    }
                    variant="outlined"
                  />
                ))}
              </div>
            ) : (
              <Typography color="text.secondary">
                No subjects are currently assigned.
              </Typography>
            )}
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Account activity
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Joined</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(teacher.createdAt)}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Last login</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(teacher.lastLoginAt)}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "8px",
                  flexWrap: "wrap",
                  justifyContent: "space-between",
                }}
                className="admin-detail-field"
              >
                {!teacher.hasPassword && (
                  <div>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      {teacher.firstName} {teacher.lastName} have not setup
                      password:
                    </Typography>
                    <Button
                      variant="contained"
                      sx={{ width: "fit-content" }}
                      color="warning"
                      onClick={handleResendInvitation}
                      disabled={resendingInv}
                    >
                      {resendingInv ? "Resending..." : "Resend Invitation"}
                    </Button>
                  </div>
                )}
                <Button
                  variant="contained"
                  onClick={() => setStatusModal(true)}
                  sx={{ width: "fit-content", height: "fit-content" }}
                  color={teacher?.isActive ? "error" : "success"}
                >
                  {teacher.isActive ? "Deactivate" : "Activate"}
                </Button>
              </div>
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
          color={teacher?.isActive ? "error" : "success"}
          sx={{
            mx: "20px",
            mt: "20px",
            mb: "0px",
            fontSize: "24px",
          }}
        />

        <DialogTitle
          id="logout-dialog-title"
          color={teacher?.isActive ? "error" : "success"}
        >
          {teacher?.isActive ? "Deactivate" : "Activate"} {name}?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to{" "}
            {teacher?.isActive ? "deactivate" : "activate"} {name}? You can
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
            color={teacher?.isActive ? "error" : "success"}
            variant="contained"
            disabled={loading}
            onClick={handleUpdateStatus}
          >
            {loading
              ? "Loadding..."
              : teacher?.isActive
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminDetailShell>
  );
}
