/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import {
  CameraAltOutlined,
  EditOutlined,
  SaveOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import "./student-pages.css";
import {
  useUpdateUser,
  useUploadProfilePicMutation,
  useUserQuery,
} from "../../hooks/useUser";
import { toast } from "react-toastify";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";

export default function ProfilePage() {
  const [saved, setSaved] = useState(false);
  const [emailUpdates, setEmailUpdates] = useState(true);
  const [progressReminders, setProgressReminders] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    role: "",
    email: "",
    class: "",
    classId: "",
    oldPassword: "",
    newPassword: "",
    profilePic: "",
  });

  const { data: userData } = useUserQuery();
  const updateUserMutation = useUpdateUser();
  const uploadProfilePicMutation = useUploadProfilePicMutation();

  const schoolInfoQuery = useSchoolInfoQuery();
  const info = schoolInfoQuery.data?.data;

  const user = useMemo(() => {
    return userData?.user;
  }, [userData?.user]);

  const joinedAt = new Date(user?.createdAt ?? "");

  const joinedSince = new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(new Date(user?.createdAt ? user?.createdAt : new Date()));

  const onChangePhoto = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      setProfile((prev) => ({
        ...prev,
        profilePic: reader.result as string,
      }));

      uploadProfilePicMutation.mutate(
        { payload: { image: reader.result as string } },
        {
          onSuccess: (res) => {
            toast.success(
              res.message || "Profile picture uploaded successfully!",
            );
          },
          onError: (err: any) => {
            toast.error(err.response.data.message);
          },
        },
      );
    };

    reader.readAsDataURL(file);
  };

  const handleSave = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const payload = {
      firstName: profile.firstName,
      lastName: profile.lastName,
      oldPassword: profile.oldPassword,
      newPassword: profile.newPassword,
    };

    updateUserMutation.mutate(
      { payload: payload },
      {
        onSuccess: (res) => {
          toast.success(res.message);
        },
        onError: (err: any) => {
          toast.error(err.response.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      },
    );
  };

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        class: user.class?.name ?? "",
        classId: user.class?.id ?? "",
        email: user.email ?? "",
        role: user.role ?? "",
        profilePic: user.profilePic ?? "",
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [user]);

  useEffect(() => {
    document.title = `Profile | OpenStudy`;
  }, []);

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <div>
          <Typography className="student-eyebrow">ACCOUNT SETTINGS</Typography>
          <Typography component="h2" className="student-page-title">
            My profile
          </Typography>
          <Typography className="student-page-description">
            Your account details and learning preferences.
          </Typography>
        </div>
      </div>
      <div className="student-profile-grid">
        <Paper elevation={0} className="student-panel student-profile-card">
          <div className="student-profile-cover" />

          <Box sx={{ position: "relative" }}>
            {profile.profilePic.length ? (
              <img
                style={{
                  width: "72px",
                  height: "72px",
                  marginTop: "-36px",
                  border: "4px solid #fff",
                  background: "#e7efe9",
                  borderRadius: "100%",
                }}
                src={profile.profilePic}
                alt={profile.firstName + profile.lastName}
              />
            ) : (
              <Avatar className="student-profile-large-avatar">
                {profile?.firstName?.[0]}
                {profile?.lastName?.[0]}
              </Avatar>
            )}

            <FormControlLabel
              sx={{ position: "absolute", top: 8, right: -20 }}
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
                  onChange={onChangePhoto}
                />
              }
            ></FormControlLabel>
          </Box>

          <Typography component="h3">
            {profile.firstName} {profile.lastName}
          </Typography>
          <Typography>
            {user?.class?.name} · {user?.role}
          </Typography>
          <div className="student-profile-id">
            <span>STUDENT ID</span>
            <strong>
              STU-{joinedAt.getFullYear()}-
              {user?.id?.slice(0, 6) ?? "".slice(0, 4)}
            </strong>
          </div>
          <div className="student-profile-joined">
            Learning with OpenStudy since {joinedSince}
          </div>
        </Paper>

        <Paper
          elevation={0}
          className="student-panel student-profile-form-panel"
        >
          <div className="student-panel-heading">
            <div>
              <Typography component="h3">Personal details</Typography>
              <Typography>Keep your account information up to date</Typography>
            </div>
            <EditOutlined className="student-profile-heading-icon" />
          </div>
          <form onSubmit={handleSave}>
            <Stack spacing={2.25} className="student-profile-form-fields">
              <div className="student-profile-name-fields">
                <TextField
                  label="First name"
                  autoComplete="given-name"
                  value={profile.firstName}
                  onChange={(event) =>
                    setProfile({ ...profile, firstName: event.target.value })
                  }
                  required
                  fullWidth
                />
                <TextField
                  label="Last name"
                  autoComplete="family-name"
                  value={profile.lastName}
                  onChange={(event) =>
                    setProfile({ ...profile, lastName: event.target.value })
                  }
                  required
                  fullWidth
                />
              </div>
              <TextField
                label="Email address"
                type="email"
                value={profile.email}
                disabled
                fullWidth
                // helperText="Contact your school to change your email."
              />
              <div className="student-profile-name-fields">
                <TextField
                  label="Class"
                  value={profile.class}
                  disabled
                  fullWidth
                />
                <TextField
                  label=""
                  focused
                  value={info?.name ? info?.name : ""}
                  disabled
                  fullWidth
                />
              </div>

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
                  Leave these fields blank if you don&apos;t want to change your
                  password.
                </Typography>
              </Box>

              <div className="student-profile-name-fields">
                <TextField
                  label="Old Password"
                  type={showOldPassword ? "text" : "password"}
                  value={profile.oldPassword}
                  onChange={(event) =>
                    setProfile({ ...profile, oldPassword: event.target.value })
                  }
                  fullWidth
                  required
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showOldPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            edge="end"
                            onClick={() => setShowOldPassword(!showOldPassword)}
                          >
                            {showOldPassword ? (
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
                  label="New Password"
                  minRows={2}
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={profile.newPassword}
                  onChange={(event) =>
                    setProfile({ ...profile, newPassword: event.target.value })
                  }
                  fullWidth
                  helperText="Use at least 8 characters."
                  slotProps={{
                    htmlInput: { minLength: 8 },
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={
                              showNewPassword
                                ? "Hide password"
                                : "Show password"
                            }
                            edge="end"
                            onClick={() => setShowNewPassword(!showNewPassword)}
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
              </div>
              {/* <div className="student-profile-security">
                <LockOutlined />
                <span>
                  Password and account access are managed by your school.
                </span>
              </div> */}
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={<SaveOutlined />}
                className="student-profile-save"
              >
                {loading ? "Saving..." : "Save changes"}
              </Button>
            </Stack>
          </form>
        </Paper>

        <Paper
          elevation={0}
          className="student-panel student-preferences-panel"
        >
          <div className="student-panel-heading">
            <div>
              <Typography component="h3">Learning reminders</Typography>
              <Typography>Choose which updates you receive</Typography>
            </div>
          </div>
          <FormControlLabel
            control={
              <Switch
                checked={emailUpdates}
                onChange={(event) => setEmailUpdates(event.target.checked)}
              />
            }
            label="Email updates"
          />
          <Typography className="student-preference-description">
            Important announcements and class updates.
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={progressReminders}
                onChange={(event) => setProgressReminders(event.target.checked)}
              />
            }
            label="Progress reminders"
          />
          <Typography className="student-preference-description">
            A gentle reminder when you have learning to pick up.
          </Typography>
        </Paper>
      </div>
      <Snackbar
        open={saved}
        autoHideDuration={3000}
        onClose={() => setSaved(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity="success"
          variant="filled"
          onClose={() => setSaved(false)}
        >
          Profile updated in this session.
        </Alert>
      </Snackbar>
    </div>
  );
}
