/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Typography,
} from "@mui/material";
import { useParams } from "react-router-dom";
import {
  useGetSingleSubjectQuery,
  useUpdateSubjectStatusMutation,
} from "../../hooks/useSubject";
import AdminDetailShell from "./AdminDetailShell";
import { Edit } from "@mui/icons-material";
import { useEffect, useState } from "react";

import { toast } from "react-toastify";
import { formatDateAndTime } from "../../utils/helperFunctions";

export default function SubjectDetailsPage() {
  const { subjectId = "" } = useParams();
  const { data, isLoading, error, refetch } =
    useGetSingleSubjectQuery(subjectId);
  const subject = data?.data;

  const updateSubjectStatus = useUpdateSubjectStatusMutation();

  const [statusModal, setStatusModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleUpdateStatus = () => {
    setLoading(true);

    const payload = {
      isActive: subject?.isActive ? false : true,
    };

    updateSubjectStatus.mutate(
      { id: subject?.id ?? "", payload },
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
    document.title = `Subject Details | OpenStudy`;
  }, []);

  return (
    <AdminDetailShell
      backTo={`/admin/subjects`}
      backLabel="All subjects"
      title={subject?.name ?? "Subject details"}
      subtitle={subject?.description ?? "Curriculum subject"}
      initials={subject?.name?.slice(0, 2).toUpperCase() ?? ""}
      status={subject ? (subject.isActive ? "Active" : "Inactive") : undefined}
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      notFound={!isLoading && !error && !subject}
      onRetry={() => void refetch()}
    >
      {subject && (
        <>
          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Subject information
            </Typography>
            <div className="admin-detail-grid" style={{ position: "relative" }}>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Class</span>
                <span className="admin-detail-field-value">
                  {subject.class?.name ?? "Not assigned"}
                  {subject.class?.level ? ` · ${subject.class.level}` : ""}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Category</span>
                <span className="admin-detail-field-value">
                  <Chip
                    label={subject.category}
                    size="small"
                    variant="outlined"
                  />
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Publication</span>
                <span className="admin-detail-field-value">
                  {subject.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Display order</span>
                <span className="admin-detail-field-value">
                  {subject.order ?? "Not set"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Subject ID</span>
                <span className="admin-detail-field-value">
                  {subject.id ?? subject.id ?? subjectId}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Slug</span>
                <span className="admin-detail-field-value">
                  {subject.slug ?? "Not available"}
                </span>
              </div>
            </div>
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Description
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
              {subject.description || "No description has been added."}
            </Typography>
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Record history
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Created</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(subject.createdAt)}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Last updated</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(subject.updatedAt)}
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
                <Button
                  variant="contained"
                  onClick={() => setStatusModal(true)}
                  sx={{ width: "fit-content", height: "fit-content" }}
                  color={subject?.isActive ? "error" : "success"}
                >
                  {subject.isActive ? "Deactivate" : "Activate"}
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
          color="error"
          sx={{
            mx: "20px",
            mt: "20px",
            mb: "0px",
            fontSize: "24px",
          }}
        />

        <DialogTitle id="logout-dialog-title" color="error">
          {subject?.isActive ? "Deactivate" : "Activate"} {subject?.name}?
        </DialogTitle>

        <DialogContent>
          <DialogContentText id="logout-dialog-description">
            Are you sure you want to{" "}
            {subject?.isActive ? "deactivate" : "activate"} {subject?.name}? You
            can still change the {subject?.name} status again.
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
            color={subject?.isActive ? "error" : "success"}
            variant="contained"
            disabled={loading}
            onClick={handleUpdateStatus}
          >
            {loading
              ? "Loadding..."
              : subject?.isActive
                ? "Deactivate"
                : "Activate"}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminDetailShell>
  );
}
