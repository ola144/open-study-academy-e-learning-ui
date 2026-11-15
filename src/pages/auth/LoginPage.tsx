/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { AuthPageLayout } from "./AuthPageLayout";
import { useNavigate } from "react-router-dom";
import type { ILoginPayload } from "../../api/auth";
import { toast } from "react-toastify";
import { useLogin } from "../../hooks/useAuth";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useLogin();

  const [formData, setFormData] = useState<ILoginPayload>({
    email: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    const { email, password } = formData;

    const payload = {
      email: email,
      password: password,
    };

    loginMutation.mutate(payload, {
      onSuccess: (res) => {
        toast.success(res.message);
        const user = res.user;
        if (user?.role === "STUDENT") {
          navigate("/student");
        } else if (user?.role === "TEACHER") {
          navigate("/teacher");
        } else {
          navigate("/admin");
        }
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message);
      },
      onSettled: () => {
        setLoading(false);
      },
    });
  };

  useEffect(() => {
    const sessionExpired = sessionStorage.getItem("sessionExpired");

    // if (sessionExpired) {
    toast.error(sessionExpired);

    setTimeout(() => {
      sessionStorage.removeItem("sessionExpired");
    }, 4000);

    // }
  }, []);

  return (
    <AuthPageLayout
      title="Welcome back"
      pageTitle="Sign in"
      description="Pick up where you left off. Your next lesson is waiting."
      footer={
        <>
          New to OpenStudy?{" "}
          <Button
            variant="text"
            onClick={() => navigate("/signup")}
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
            Create an account
          </Button>
        </>
      }
    >
      <Stack component="form" onSubmit={handleSubmit} spacing={1}>
        <TextField
          label="Email address"
          name="email"
          value={formData.email}
          onChange={handleChange}
          type="email"
          autoComplete="email"
          required
          fullWidth
          autoFocus
        />
        <TextField
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          fullWidth
          slotProps={{
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
        <div className="auth-form-options">
          <FormControlLabel
            control={<Checkbox name="remember" color="primary" />}
            label="Remember me"
          />
        </div>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          color="primary"
          fullWidth
        >
          {loading ? "Loading..." : "Sign in"}
        </Button>
      </Stack>
    </AuthPageLayout>
  );
}
