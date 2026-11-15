/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControlLabel,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  SchoolOutlined,
  SaveOutlined,
  RestartAlt,
  CameraAltOutlined,
} from "@mui/icons-material";
import React, {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import axios from "axios";
import {
  useSchoolInfoQuery,
  useSaveSchoolInfoMutation,
  useUploadSchoolLogoMutation,
} from "../hooks/useSchoolInfo";
import type {
  SchoolInfo,
  SchoolInfoPayload,
  SchoolTerm,
} from "../api/schoolInfo";
import { toast } from "react-toastify";

const EMPTY_FORM: SchoolInfoPayload = {
  name: "",
  term: "FIRST",
  address: "",
  logo: "",
  email: "",
  phoneNumber: "",
};

const terms: Array<{ value: SchoolTerm; label: string }> = [
  { value: "FIRST", label: "First term" },
  { value: "SECOND", label: "Second term" },
  { value: "THIRD", label: "Third term" },
];

const toFormValues = (schoolInfo: SchoolInfo): SchoolInfoPayload => ({
  name: schoolInfo.name,
  term: schoolInfo.term,
  logo: schoolInfo.logo,
  address: schoolInfo.address,
  email: schoolInfo.email,
  phoneNumber: schoolInfo.phoneNumber,
});

const getErrorMessage = (error: unknown) => {
  if (
    axios.isAxiosError<{ message?: string }>(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }

  return "We couldn't save the school information. Please try again.";
};

const AdminSchoolInfo = () => {
  const schoolInfoQuery = useSchoolInfoQuery();
  const saveMutation = useSaveSchoolInfoMutation();
  const uploadLogoMutation = useUploadSchoolLogoMutation();

  const schoolInfo = schoolInfoQuery.data?.data ?? null;

  const [form, setForm] = useState<SchoolInfoPayload>(EMPTY_FORM);

  const [hasEdited, setHasEdited] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (schoolInfo && !hasEdited) {
      setForm(toFormValues(schoolInfo));
    }
  }, [schoolInfo, hasEdited]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaved(false);

    saveMutation.mutate(
      { id: schoolInfo?.id, payload: form },
      {
        onSuccess: (response) => {
          if (response.data) {
            setForm(toFormValues(response.data));
          }
          setHasEdited(false);
          setSaved(true);

          setTimeout(() => {
            setSaved(false);
          }, 3000);
        },
      },
    );
  };

  const handleUploadLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;

    if (!input.files?.length) return;

    const file = input.files[0];

    const reader = new FileReader();

    reader.onload = () => {
      setForm((prev) => ({
        ...prev,
        logo: reader.result as string,
      }));

      uploadLogoMutation.mutate(
        { id: schoolInfo?.id ?? "", logo: reader.result as string },
        {
          onSuccess: (res) => {
            toast.success(res.message || "School logo upload successfully!");
          },
          onError: (err: any) => {
            toast.error(err.response.data.message);
          },
        },
      );
    };

    reader.readAsDataURL(file);
  };

  const handleReset = () => {
    setForm(schoolInfo ? toFormValues(schoolInfo) : EMPTY_FORM);
    setHasEdited(false);
    setSaved(false);
    saveMutation.reset();
  };

  const handleChange =
    (field: keyof SchoolInfoPayload) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
      setHasEdited(true);
      setSaved(false);
      if (saveMutation.isError) saveMutation.reset();
    };

  const isBusy = schoolInfoQuery.isLoading || saveMutation.isPending;

  return (
    <Box sx={{ display: "grid", gap: 3, maxWidth: 1040 }}>
      <Box>
        <Typography
          component="h2"
          variant="h5"
          sx={{ color: "#202a24", fontWeight: 700, mb: 0.75 }}
        >
          School information
        </Typography>
        <Typography color="text.secondary">
          Keep your school&apos;s details and current academic term up to date.
          This information is used across your learning platform.
        </Typography>
      </Box>

      {schoolInfoQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void schoolInfoQuery.refetch()}
            >
              Try again
            </Button>
          }
        >
          School information couldn&apos;t be loaded. Please try again.
        </Alert>
      )}

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
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{
            px: { xs: 2.5, sm: 3.5 },
            py: 2.5,
            bgcolor: "#fbfcfb",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" spacing={1.75}>
            <Box sx={{ position: "relative" }}>
              {schoolInfo?.logo ? (
                <img
                  style={{
                    width: "46px",
                    height: "46px",
                    border: "2px solid #fff",
                    background: "#e9f2ec",
                    borderRadius: "10px",
                  }}
                  src={schoolInfo.logo}
                  alt={schoolInfo.name}
                />
              ) : (
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 46,
                    height: 46,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 1.5,
                    bgcolor: "#e9f2ec",
                    color: "#28624e",
                    alignItems: "center",
                  }}
                >
                  <SchoolOutlined />
                </Box>
              )}

              <Tooltip
                title={
                  schoolInfo?.logo ? "Change School Logo" : "Upload School Logo"
                }
              >
                <FormControlLabel
                  sx={{ position: "absolute", bottom: -15, right: -20 }}
                  disabled={uploadLogoMutation.isPending}
                  label={
                    uploadLogoMutation.isPending ? (
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
                      onChange={handleUploadLogo}
                    />
                  }
                ></FormControlLabel>
              </Tooltip>
            </Box>

            <Box>
              <Typography
                component="h3"
                variant="subtitle1"
                sx={{ fontWeight: 700 }}
              >
                School profile
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Basic details, address and contact information
              </Typography>
            </Box>
          </Stack>
          <Chip
            size="small"
            label={schoolInfo ? "Profile set up" : "Setup required"}
            color={schoolInfo ? "success" : "default"}
            variant={schoolInfo ? "outlined" : "filled"}
          />
        </Stack>

        <Box sx={{ px: { xs: 2.5, sm: 3.5 }, py: 3 }}>
          {schoolInfoQuery.isLoading ? (
            <Stack
              spacing={1.5}
              sx={{
                minHeight: 240,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress
                size={30}
                aria-label="Loading school information"
              />
              <Typography variant="body2" color="text.secondary">
                Loading school information…
              </Typography>
            </Stack>
          ) : (
            <>
              {saveMutation.isError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {getErrorMessage(saveMutation.error)}
                </Alert>
              )}
              {saved && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  School information saved successfully.
                </Alert>
              )}

              <Stack spacing={3}>
                <Box>
                  <Typography
                    component="h4"
                    variant="subtitle2"
                    sx={{ mb: 0.5, fontWeight: 700, color: "#303b33" }}
                  >
                    School details
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Set the name shown to your school community and its current
                    term.
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
                    label="School name"
                    value={form.name}
                    onChange={handleChange("name")}
                    required
                    fullWidth
                    autoComplete="organization"
                    slotProps={{ htmlInput: { maxLength: 120 } }}
                  />
                  <TextField
                    select
                    label="Current academic term"
                    value={form.term}
                    onChange={handleChange("term")}
                    required
                    fullWidth
                  >
                    {terms.map((term) => (
                      <MenuItem key={term.value} value={term.value}>
                        {term.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <Box>
                  <Typography
                    component="h4"
                    variant="subtitle2"
                    sx={{ mb: 0.5, fontWeight: 700, color: "#303b33" }}
                  >
                    Contact information
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Add the main address and contact details for your school.
                  </Typography>
                </Box>

                <TextField
                  label="School address"
                  value={form.address}
                  onChange={handleChange("address")}
                  required
                  fullWidth
                  multiline
                  minRows={3}
                  autoComplete="street-address"
                  slotProps={{ htmlInput: { maxLength: 300 } }}
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
                    label="School email"
                    type="email"
                    value={form.email}
                    onChange={handleChange("email")}
                    required
                    fullWidth
                    autoComplete="email"
                    slotProps={{ htmlInput: { maxLength: 254 } }}
                  />
                  <TextField
                    label="School phone number"
                    type="tel"
                    value={form.phoneNumber}
                    onChange={handleChange("phoneNumber")}
                    required
                    fullWidth
                    autoComplete="tel"
                    slotProps={{ htmlInput: { maxLength: 32 } }}
                  />
                </Box>
              </Stack>
            </>
          )}
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
            disabled={!hasEdited || isBusy}
          >
            Reset
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={
              saveMutation.isPending ? (
                <CircularProgress size={17} color="inherit" />
              ) : (
                <SaveOutlined />
              )
            }
            disabled={isBusy || schoolInfoQuery.isError}
          >
            {saveMutation.isPending
              ? "Saving…"
              : schoolInfo
                ? "Save changes"
                : "Create school profile"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminSchoolInfo;
