/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  CameraAltOutlined,
  CheckCircleOutlined,
  EditOutlined,
  LockOutlined,
  PersonOutlined,
  RestartAlt,
  SaveOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import axios from "axios";
import React, { useEffect, useState, type FormEvent } from "react";
import {
  useUpdateUser,
  useUploadProfilePicMutation,
  useUserQuery,
} from "../hooks/useUser";
import type { IUser } from "../api/auth";
import TeacherBankAccountTab from "./TeacherBankAccountTab";
import { toast } from "react-toastify";

interface ProfileForm {
  firstName: string;
  lastName: string;
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const EMPTY_FORM: ProfileForm = {
  firstName: "",
  lastName: "",
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const getErrorMessage = (error: unknown) => {
  if (
    axios.isAxiosError<{ message?: string }>(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "Your profile couldn't be saved. Please try again.";
};

const AdminProfile = () => {
  const { data, isLoading, isError, refetch } = useUserQuery();

  const updateUser = useUpdateUser();
  const uploadProfilePicMutation = useUploadProfilePicMutation();

  const user = data?.user;
  const role = user?.role;

  const [form, setForm] = useState<ProfileForm>(EMPTY_FORM);
  const [hasEdited, setHasEdited] = useState(false);

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (user && !hasEdited) {
      setForm({
        ...EMPTY_FORM,
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
      });
    }
  }, [user, hasEdited]);

  const updateField = (field: keyof ProfileForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setHasEdited(true);
    setSaved(false);
    setValidationError("");
    if (updateUser.isError) updateUser.reset();
  };

  const handleReset = () => {
    setForm({
      ...EMPTY_FORM,
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
    });
    setHasEdited(false);
    setSaved(false);
    setValidationError("");
    updateUser.reset();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);
    setValidationError("");

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setValidationError("Enter both your first and last name.");
      return;
    }

    const isChangingPassword =
      form.oldPassword.length > 0 ||
      form.newPassword.length > 0 ||
      form.confirmPassword.length > 0;

    if (isChangingPassword && !form.oldPassword) {
      setValidationError("Enter your current password to set a new one.");
      return;
    }
    if (isChangingPassword && !form.newPassword) {
      setValidationError("Enter a new password.");
      return;
    }
    if (form.newPassword.length > 0 && form.newPassword.length < 8) {
      setValidationError("Your new password must be at least 8 characters.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setValidationError("The new password and confirmation don't match.");
      return;
    }

    const payload: IUser = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      oldPassword: isChangingPassword ? form.oldPassword : "",
      newPassword: isChangingPassword ? form.newPassword : "",
    };

    updateUser.mutate(
      { payload },
      {
        onSuccess: () => {
          setForm((current) => ({
            ...current,
            oldPassword: "",
            newPassword: "",
            confirmPassword: "",
          }));
          setHasEdited(false);
          setSaved(true);
        },
      },
    );
  };

  const handleUploadProfilePic = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      uploadProfilePicMutation.mutate(
        { payload: { image: reader.result as string } },
        {
          onSuccess: (res) => {
            toast.success(
              res.message || "Profile picture uploaded successfully!",
            );
          },
          onError: (err: any) => {
            toast.error(err.reponse.data.message);
          },
        },
      );
    };

    reader.readAsDataURL(file);
  };

  const initials = [user?.firstName?.[0], user?.lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();
  const joinedDate = user?.createdAt
    ? new Intl.DateTimeFormat("en", {
        month: "long",
        year: "numeric",
      }).format(new Date(user.createdAt))
    : "";

  const busy = isLoading || updateUser.isPending;

  useEffect(() => {
    document.title = `Profile | OpenStudy`;
  }, []);

  return (
    <Box sx={{ display: "grid", gap: 3, maxWidth: 1040 }}>
      <Box>
        <Typography
          component="h2"
          variant="h5"
          sx={{ color: "#202a24", fontWeight: 700, mb: 0.75 }}
        >
          {role === "ADMIN" ? "Administrator" : "Teacher"} Profile
        </Typography>
        <Typography color="text.secondary">
          Manage your account details and keep your sign-in credentials secure.
        </Typography>
      </Box>

      {role === "TEACHER" && (
        <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
          <Tab value="profile" label="Profile" />
          <Tab value="bank" label="Bank account" />
        </Tabs>
      )}

      {activeTab === "bank" && role === "TEACHER" && <TeacherBankAccountTab />}

      {activeTab === "profile" && isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        >
          Your profile couldn&apos;t be loaded. Please try again.
        </Alert>
      )}

      {activeTab === "profile" &&
        (isLoading ? (
          <Paper
            elevation={0}
            sx={{
              display: "grid",
              justifyItems: "center",
              alignContent: "center",
              gap: 1.5,
              minHeight: 300,
              border: "1px solid #e3e9e4",
              borderRadius: 2,
            }}
          >
            <CircularProgress
              size={30}
              aria-label="Loading administrator profile"
            />
            <Typography variant="body2" color="text.secondary">
              Loading your profile…
            </Typography>
          </Paper>
        ) : (
          <>
            <Paper
              elevation={0}
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 2.5,
                p: { xs: 2.5, sm: 3.5 },
                border: "1px solid #e3e9e4",
                borderRadius: 2,
              }}
            >
              <Box sx={{ position: "relative" }}>
                {user?.profilePic?.length ? (
                  <img
                    style={{
                      width: "68px",
                      height: "68px",
                      border: "4px solid #fff",
                      background: "#e7efe9",
                      borderRadius: "100%",
                    }}
                    src={user.profilePic}
                    alt={user.firstName ?? "" + user.lastName}
                  />
                ) : (
                  <Avatar
                    aria-label={`${user?.firstName ?? ""} ${user?.lastName ?? ""}`}
                    sx={{
                      width: 68,
                      height: 68,
                      bgcolor: "#e9f2ec",
                      color: "#28624e",
                      fontSize: 22,
                      fontWeight: 700,
                    }}
                  >
                    {initials || <PersonOutlined />}
                  </Avatar>
                )}

                <Tooltip
                  title={
                    user?.profilePic
                      ? "Change profile picture"
                      : "Upload profile picture"
                  }
                  placement="bottom"
                >
                  <FormControlLabel
                    sx={{ position: "absolute", bottom: -4, right: -20 }}
                    disabled={uploadProfilePicMutation.isPending}
                    label={
                      uploadProfilePicMutation.isPending ? (
                        <CircularProgress
                          sx={{
                            fontSize: 24,
                            border: "4px solid #fff",
                            background: "#fff",
                            borderRadius: "100%",
                          }}
                          size={24}
                          aria-label="Loading..."
                        />
                      ) : (
                        <CameraAltOutlined
                          sx={{
                            fontSize: 24,
                            border: "4px solid #fff",
                            background: "#fff",
                            borderRadius: "100%",
                          }}
                        />
                      )
                    }
                    control={
                      <TextField
                        type="file"
                        slotProps={{ htmlInput: { accept: "image/*" } }}
                        id="profile-pic"
                        sx={{ display: "none" }}
                        onChange={handleUploadProfilePic}
                      />
                    }
                  ></FormControlLabel>
                </Tooltip>
              </Box>

              <Box sx={{ flex: "1 1 220px", minWidth: 0 }}>
                <Typography
                  component="h3"
                  variant="h6"
                  sx={{ color: "#202a24", fontWeight: 700 }}
                >
                  {[user?.firstName, user?.lastName]
                    .filter(Boolean)
                    .join(" ") || "Administrator"}
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  {user?.email || "No email address"}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  <Chip
                    size="small"
                    label={user?.role || "Administrator"}
                    color="primary"
                    variant="outlined"
                  />
                  {user?.isEmailVerified && (
                    <Chip
                      size="small"
                      label="Email verified"
                      icon={<CheckCircleOutlined />}
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </Box>
              {joinedDate && (
                <Typography variant="body2" color="text.secondary">
                  Member since {joinedDate}
                </Typography>
              )}
            </Paper>

            <Paper
              component="form"
              elevation={0}
              onSubmit={handleSubmit}
              sx={{
                overflow: "hidden",
                border: "1px solid #e3e9e4",
                borderRadius: 2,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: { xs: 2.5, sm: 3.5 },
                  py: 2.5,
                  bgcolor: "#fbfcfb",
                  borderBottom: "1px solid #edf0ed",
                }}
              >
                <EditOutlined sx={{ color: "#28624e" }} />
                <Box>
                  <Typography
                    component="h3"
                    variant="subtitle1"
                    sx={{ fontWeight: 700 }}
                  >
                    Personal details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Update the information associated with your account.
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 3,
                  px: { xs: 2.5, sm: 3.5 },
                  py: 3,
                }}
              >
                {updateUser.isError && (
                  <Alert severity="error">
                    {getErrorMessage(updateUser.error)}
                  </Alert>
                )}
                {validationError && (
                  <Alert severity="warning">{validationError}</Alert>
                )}
                {saved && (
                  <Alert severity="success">
                    Your profile has been updated successfully.
                  </Alert>
                )}

                <Box>
                  <Typography
                    component="h4"
                    variant="subtitle2"
                    sx={{ mb: 0.5, fontWeight: 700, color: "#303b33" }}
                  >
                    Account details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Your email is used to sign in and cannot be changed here.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="First name"
                    value={form.firstName}
                    onChange={(event) =>
                      updateField("firstName", event.target.value)
                    }
                    required
                    fullWidth
                    autoComplete="given-name"
                    disabled={updateUser.isPending}
                    slotProps={{ htmlInput: { maxLength: 80 } }}
                  />
                  <TextField
                    label="Last name"
                    value={form.lastName}
                    onChange={(event) =>
                      updateField("lastName", event.target.value)
                    }
                    required
                    fullWidth
                    autoComplete="family-name"
                    disabled={updateUser.isPending}
                    slotProps={{ htmlInput: { maxLength: 80 } }}
                  />
                  <TextField
                    label="Email address"
                    type="email"
                    value={user?.email ?? ""}
                    fullWidth
                    disabled
                    autoComplete="email"
                    //   helperText="Contact support if you need to change your email."
                  />
                  <TextField
                    label="Account role"
                    value={user?.role ?? "Administrator"}
                    fullWidth
                    disabled
                  />
                </Box>

                <Box sx={{ borderTop: "1px solid #edf0ed" }} />

                <Box>
                  <Typography
                    component="h4"
                    variant="subtitle2"
                    sx={{ mb: 0.5, fontWeight: 700, color: "#303b33" }}
                  >
                    Change password
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Leave these fields blank if you don&apos;t want to change
                    your password.
                  </Typography>
                </Box>

                <TextField
                  label="Current password"
                  type={showCurrentPassword ? "text" : "password"}
                  value={form.oldPassword}
                  onChange={(event) =>
                    updateField("oldPassword", event.target.value)
                  }
                  fullWidth
                  autoComplete="current-password"
                  disabled={updateUser.isPending}
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockOutlined fontSize="small" />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showCurrentPassword
                                ? "Hide current password"
                                : "Show current password"
                            }
                            edge="end"
                            onClick={() =>
                              setShowCurrentPassword((visible) => !visible)
                            }
                          >
                            {showCurrentPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2.5,
                  }}
                >
                  <TextField
                    label="New password"
                    type={showNewPassword ? "text" : "password"}
                    value={form.newPassword}
                    onChange={(event) =>
                      updateField("newPassword", event.target.value)
                    }
                    fullWidth
                    autoComplete="new-password"
                    disabled={updateUser.isPending}
                    helperText="Use at least 8 characters."
                    slotProps={{
                      htmlInput: { minLength: 8 },
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showNewPassword
                                  ? "Hide new password"
                                  : "Show new password"
                              }
                              edge="end"
                              onClick={() =>
                                setShowNewPassword((visible) => !visible)
                              }
                            >
                              {showNewPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                  <TextField
                    label="Confirm new password"
                    type={showConfirmation ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(event) =>
                      updateField("confirmPassword", event.target.value)
                    }
                    fullWidth
                    autoComplete="new-password"
                    disabled={updateUser.isPending}
                    error={
                      form.confirmPassword.length > 0 &&
                      form.newPassword !== form.confirmPassword
                    }
                    helperText={
                      form.confirmPassword.length > 0 &&
                      form.newPassword !== form.confirmPassword
                        ? "Passwords don't match."
                        : "Re-enter your new password."
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label={
                                showConfirmation
                                  ? "Hide password confirmation"
                                  : "Show password confirmation"
                              }
                              edge="end"
                              onClick={() =>
                                setShowConfirmation((visible) => !visible)
                              }
                            >
                              {showConfirmation ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1.5,
                  px: { xs: 2.5, sm: 3.5 },
                  py: 2,
                  borderTop: "1px solid #edf0ed",
                  bgcolor: "#fbfcfb",
                }}
              >
                <Button
                  type="button"
                  variant="outlined"
                  color="inherit"
                  startIcon={<RestartAlt />}
                  onClick={handleReset}
                  disabled={!hasEdited || busy}
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    updateUser.isPending ? (
                      <CircularProgress size={17} color="inherit" />
                    ) : (
                      <SaveOutlined />
                    )
                  }
                  disabled={busy || isError}
                >
                  {updateUser.isPending ? "Saving…" : "Save changes"}
                </Button>
              </Box>
            </Paper>
          </>
        ))}
    </Box>
  );
};

export default AdminProfile;
