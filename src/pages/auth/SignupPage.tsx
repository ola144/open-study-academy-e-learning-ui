/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  type SelectChangeEvent,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthPageLayout } from "./AuthPageLayout";
import { useNavigate } from "react-router-dom";
import { useClassQuery } from "../../hooks/useClass";
import type { IRegisterPayload } from "../../api/auth";
import { useRegister } from "../../hooks/useAuth";
import { toast } from "react-toastify";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { data: classData } = useClassQuery();
  const signupMutation = useRegister();

  const departments = ["SCIENCE", "ARTS", "COMMERCIAL"];

  const [formData, setFormData] = useState<IRegisterPayload>({
    firstName: "",
    lastName: "",
    email: "",
    department: "",
    classId: "",
    role: "STUDENT",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleChangeSelectItem = (event: SelectChangeEvent) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { firstName, lastName, email, role, classId, password, department } =
      formData;

    const payload = {
      firstName: firstName,
      lastName: lastName,
      email: email,
      department: department ? department : "",
      role: role,
      classId: classId,
      password: password,
    };

    signupMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.message);
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          department: "",
          role: "STUDENT",
          classId: "",
          password: "",
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  const selectedClass = useMemo(() => {
    return classData?.data?.find((item) => item.id === formData.classId);
  }, [classData?.data, formData.classId]);

  return (
    <AuthPageLayout
      title="Start learning today"
      pageTitle="Create your account"
      description="Create an account and make your next learning goal happen."
      footer={
        <>
          Already have an account?{" "}
          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{
              cursor: "pointer",
              background: "transparent",
              ":hover": {
                textDecoration: "underline",
                background: "transparent",
              },
              height: "fit-content",
            }}
          >
            Login
          </Button>
        </>
      }
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={1}>
        <div className="auth-name-fields">
          <TextField
            label="First name"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            required
            fullWidth
            autoFocus
          />
          <TextField
            label="Last name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            required
            fullWidth
          />
        </div>
        <TextField
          label="Email address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          autoComplete="email"
          required
          fullWidth
        />

        <div
          className={
            selectedClass?.name === "SS 1" ||
            selectedClass?.name === "SS 2" ||
            selectedClass?.name === "SS 3"
              ? "auth-name-fields"
              : "department-grid"
          }
        >
          <FormControl fullWidth>
            <InputLabel id="class">Select Class</InputLabel>
            <Select
              labelId="class"
              name="classId"
              label="Select Class"
              required
              value={formData.classId}
              onChange={handleChangeSelectItem}
            >
              {classData?.data &&
                classData?.data?.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>

          {(selectedClass?.name === "SS 1" ||
            selectedClass?.name === "SS 2" ||
            selectedClass?.name === "SS 3") && (
            <FormControl fullWidth>
              <InputLabel id="department">Select Department</InputLabel>
              <Select
                labelId="deparment"
                label="Select Department"
                name="department"
                required={
                  selectedClass?.name === "SS 1" ||
                  selectedClass?.name === "SS 2" ||
                  selectedClass?.name === "SS 3"
                }
                value={formData.department}
                onChange={handleChangeSelectItem}
              >
                <MenuItem selected value="">
                  Select Department
                </MenuItem>
                {departments?.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </div>

        <TextField
          label="Create a password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          type={showPassword ? "text" : "password"}
          autoComplete="new-password"
          required
          fullWidth
          helperText="Use at least 8 characters."
          slotProps={{
            htmlInput: { minLength: 8 },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    onClick={() => setShowPassword((visible) => !visible)}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <FormControlLabel
          sx={{
            display: "flex",
            alignItems: "center",
          }}
          className="auth-terms-check"
          control={<Checkbox name="terms" required color="primary" />}
          label="I agree to the Terms of Service and Privacy Policy."
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          color="primary"
          fullWidth
        >
          {loading ? "Loading..." : "Create account"}
        </Button>
      </Stack>
    </AuthPageLayout>
  );
}
