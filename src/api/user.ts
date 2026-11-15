import axios from "axios";
import api from "../app/axios";
import type { AuthResponse, IUser } from "./auth";

export const getUser = async () => {
  try {
    const { data } = await api.get<AuthResponse>("/users");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const updateUser = async (payload: IUser) => {
  try {
    const { data } = await api.patch<AuthResponse>(
      "/users/update-user",
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

export const uploadProfilePic = async (payload: { image: string }) => {
  try {
    const { data } = await api.patch<AuthResponse>(
      "/users/upload-profile-pic",
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
