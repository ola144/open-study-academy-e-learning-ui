/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import type { EntityDirectoryConfig } from "../pages/admin/AdminEntityDirectory";
import {
  useCreateTeacherMutation,
  useUpdateTeacherMutation,
} from "../hooks/useTeacher";
import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import {
  useCreateSubjectMutation,
  useUpdateSubjectMutation,
} from "../hooks/useSubject";
import { useUpdateStudentMutation } from "../hooks/useStudent";
import { useUserQuery } from "../hooks/useUser";
import {
  useCreateClassMutation,
  useUpdateClassMutation,
} from "../hooks/useClass";
import type { Level } from "../api/class";

type Props = {
  dialogOpen: boolean;
  setDialogOpen: (value: boolean) => void;
  config: EntityDirectoryConfig;
  draft: Record<string, string>;
  setDraft: (value: any) => void;
};

const AdminFormModal = ({
  dialogOpen,
  setDialogOpen,
  config,
  draft,
  setDraft,
}: Props) => {
  const createTeacherMutation = useCreateTeacherMutation();
  const updateTeacherMutation = useUpdateTeacherMutation();

  const updateStudentMutation = useUpdateStudentMutation();

  const createSubjectMutation = useCreateSubjectMutation();
  const updateSubjectMutation = useUpdateSubjectMutation();
  const { data: currentUser } = useUserQuery();

  const createClassMutation = useCreateClassMutation();
  const updateClassMutation = useUpdateClassMutation();

  const [loading, setLoading] = useState<boolean>(false);

  const handleTeacher = async (event: FormEvent) => {
    event.preventDefault();

    setLoading(true);

    const payload = {
      firstName: draft.firstName,
      lastName: draft.lastName,
      email: draft.email,
      assignedSubjectIds: Array(...draft.assignedSubjects),
      role: "TEACHER" as const,
    };

    if (draft.id) {
      updateTeacherMutation.mutate(
        { payload: payload, id: draft.id },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            handleCloseModal();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data.message);
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } else {
      createTeacherMutation.mutate(payload, {
        onSuccess: (res) => {
          toast.success(res.message);
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  const handleClass = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: draft.name,
      description: draft.description,
      level: draft.level as Level,
      order: Number(draft.order),
      isActive: true,
    };

    if (draft.id) {
      updateClassMutation.mutate(
        { payload: payload, id: draft.id },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            handleCloseModal();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data.message);
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } else {
      createClassMutation.mutate(payload, {
        onSuccess: (res) => {
          toast.success(res.message);
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  const handleSubject = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      name: draft.name,
      description: draft.description,
      classId: draft.classId,
      order: Number(draft.order),
      createdBy: currentUser?.user?.id ?? "",
      category: draft.category,
    };

    if (draft.id) {
      updateSubjectMutation.mutate(
        { payload: payload, id: draft.id },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            handleCloseModal();
          },
          onError: (err: any) => {
            toast.error(err?.response?.data.message);
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } else {
      createSubjectMutation.mutate(payload, {
        onSuccess: (res) => {
          toast.success(res.message);
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      });
    }
  };

  const handleCloseModal = () => {
    setDraft({});
    setDialogOpen(false);
  };

  const handleUpdateStudent = (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      firstName: draft.firstName,
      lastName: draft.lastName,
      classId: draft.className,
    };

    updateStudentMutation.mutate(
      { payload: payload, id: draft.id },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          handleCloseModal();
        },
        onError: (err: any) => {
          toast.error(err?.response?.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      },
    );
  };

  return (
    <Dialog
      open={dialogOpen}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="sm"
    >
      <form
        onSubmit={
          config.id === "teachers"
            ? handleTeacher
            : config.id === "subjects"
              ? handleSubject
              : config.id === "classes"
                ? handleClass
                : handleUpdateStudent
        }
      >
        <DialogTitle sx={{ textTransform: "capitalize" }}>
          {draft.id ? "Edit" : "Add"} {config.singular}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} className="admin-dialog-fields">
            {config?.fields?.map((field) =>
              field.options ? (
                <TextField
                  key={field.name}
                  select
                  label={field.label}
                  value={draft[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft((current: any) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  required
                  fullWidth
                >
                  {field.options.map((option) => (
                    <MenuItem key={option} value={option.id}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : field.optionLevels ? (
                <TextField
                  key={field.name}
                  select
                  label={field.label}
                  value={draft[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft((current: any) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  required
                  fullWidth
                >
                  {field.optionLevels.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : field.optionCategories ? (
                <TextField
                  key={field.name}
                  select
                  label={field.label}
                  value={draft[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft((current: any) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  required
                  fullWidth
                >
                  {field.optionCategories.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              ) : field.optionClasses ? (
                <TextField
                  key={field.name}
                  select
                  label={field.label}
                  value={draft[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft((current: any) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  required
                  fullWidth
                >
                  {field.optionClasses.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : field.optionSubjects ? (
                <TextField
                  key={field.name}
                  select
                  label={field.label}
                  value={draft[field.name] ?? []}
                  onChange={(event) =>
                    setDraft((current: any) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  required
                  fullWidth
                  slotProps={{
                    select: {
                      multiple: true,
                      renderValue: (selected) => {
                        const ids = selected as string[];

                        return (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                            }}
                          >
                            {ids.map((id) => {
                              const subject = field?.optionSubjects?.find(
                                (option) => option.id === id,
                              );

                              return subject ? (
                                <Chip
                                  key={id}
                                  label={`${subject.name} (${subject.class.name})`}
                                  size="small"
                                />
                              ) : null;
                            })}
                          </Box>
                        );
                      },
                    },
                  }}
                >
                  {field.optionSubjects.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name} for {option.class.name}
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <TextField
                  key={field.name}
                  label={field.label}
                  name={field.name}
                  disabled={config.id === "students" && field.name === "email"}
                  type={field.name === "email" ? "email" : "text"}
                  value={draft[field.name] ?? ""}
                  onChange={(event) =>
                    setDraft((current: any) => ({
                      ...current,
                      [field.name]: event.target.value,
                    }))
                  }
                  helperText={field.helperText}
                  required={field.name !== "description"}
                  fullWidth
                />
              ),
            )}
          </Stack>
        </DialogContent>
        <DialogActions className="admin-dialog-actions">
          <Button
            color="inherit"
            disabled={loading}
            onClick={() => setDialogOpen(false)}
          >
            Cancel
          </Button>
          {config.id === "classes" ? (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Loading..." : draft.id ? "Update" : "Add"} Class
            </Button>
          ) : config.id === "teachers" ? (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? "Loading..."
                : draft?.id
                  ? "Update Teacher"
                  : "Add Teacher"}
            </Button>
          ) : config.id === "students" ? (
            <Button type="submit" variant="contained" disabled={loading}>
              {loading
                ? "Loading..."
                : draft?.id
                  ? "Edit Student"
                  : "Add Student"}
            </Button>
          ) : (
            config.id === "subjects" && (
              <Button type="submit" variant="contained" disabled={loading}>
                {loading
                  ? "Loading..."
                  : draft?.id
                    ? "Update Subject"
                    : "Add Subject"}
              </Button>
            )
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AdminFormModal;
