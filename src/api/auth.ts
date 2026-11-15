import axios from "axios";
import api from "../app/axios";

export interface IRegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  password: string;
  role?: string;
  classId: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  profilePic?: string;
  class?: {
    name: string;
    createdAt: string;
    description: string;
    isActive: boolean;
    level: string;
    order: number;
    updatedAt: string;
    id: string;
  };
  isEmailVerified?: boolean;
  isActive?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  oldPassword?: string;
  newPassword?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: IUser;
}

export const registerApi = async (payload: IRegisterPayload) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/register", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const loginApi = async (payload: ILoginPayload) => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

// export const getMeApi = async () => {
//   try {
//     const { data } = await api.get<AuthResponse>("/auth/me");

//     return data;
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       console.error("Status:", error.response?.data);
//     }

//     throw error;
//   }
// };

export const logoutApi = async () => {
  try {
    const { data } = await api.post<AuthResponse>("/auth/logout");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const verfifyEmailApi = async (token: string) => {
  try {
    const { data } = await api.get<AuthResponse>(`/auth/verify-email/${token}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const createPasswordApi = async (payload: {
  token: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const { data } = await api.post<AuthResponse>(
      `/auth/create-password`,
      payload,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const resendPasswordCreationApi = async (teacherId: string) => {
  try {
    const { data } = await api.get<AuthResponse>(
      `/auth/resend-invitation/${teacherId}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
    }>(`/auth/refresh`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};
