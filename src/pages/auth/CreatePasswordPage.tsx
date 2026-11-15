/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthPageLayout } from "./AuthPageLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreatePasswordMutation } from "../../hooks/useAuth";
import { toast } from "react-toastify";

export default function CreatePasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const navigate = useNavigate();

  const createPasswordMutation = useCreatePasswordMutation();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [searchParams] = useSearchParams();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const token = searchParams.get("token");

    const payload = {
      token: token ?? "",
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    createPasswordMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.message);
        navigate("/login");
      },
      onError: (err: any) => {
        toast.error(err.response.data.message);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  return (
    <AuthPageLayout
      title="You’re invited. Create password."
      pageTitle="Accept your invitation"
      description="Set up your password to login to your account to join your learning community."
      footer={null}
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={2}>
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
        <TextField
          label="Confirm password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          type={showConfirmPassword ? "text" : "password"}
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
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                    onClick={() =>
                      setShowConfirmPassword((visible) => !visible)
                    }
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? "Loading..." : "Create Password"}
        </Button>
      </Stack>
    </AuthPageLayout>
  );
}
