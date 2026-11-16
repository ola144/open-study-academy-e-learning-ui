import { useMutation } from "@tanstack/react-query";
import {
  createPasswordApi,
  loginApi,
  logoutApi,
  refreshToken,
  registerApi,
  resendPasswordCreationApi,
  verfifyEmailApi,
  type AuthResponse,
  type ILoginPayload,
  type IRegisterPayload,
} from "../api/auth";
import { queryClient } from "../app/queryClient";

export const AUTH_QUERY_KEY = ["auth"];

// export const useCurrentUser = () => {
//   return useQuery({
//     queryKey: AUTH_QUERY_KEY,
//     queryFn: getMeApi,
//     retry: false,
//   });
// };

export const useRegister = () => {
  return useMutation({
    mutationFn: (payload: IRegisterPayload) => registerApi(payload),
  });
};

export const useLogin = () => {
  return useMutation<AuthResponse, Error, ILoginPayload>({
    mutationFn: (payload: ILoginPayload) => loginApi(payload),

    onSuccess: (data) => {
      if (data.user) {
        queryClient.setQueryData(AUTH_QUERY_KEY, data);
      }
    },
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logoutApi,

    onSuccess: () => {
      queryClient.clear();
      sessionStorage.removeItem("sessionExpired");

      window.location.href = "/login";
    },
  });
};

export const useVerifyEmail = () => {
  return useMutation({
    mutationFn: (token: string) => verfifyEmailApi(token),
  });
};

export const useCreatePasswordMutation = () => {
  return useMutation({
    mutationFn: (payload: {
      token: string;
      password: string;
      confirmPassword: string;
    }) => createPasswordApi(payload),
  });
};

export const useResendInvitationMutation = () => {
  return useMutation({
    mutationFn: (id: string) => resendPasswordCreationApi(id),
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth", "user"] });
    },
  });
};
