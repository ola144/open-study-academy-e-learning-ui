import axios from "axios";
import api from "../app/axios";

export type Level = "JUNIOR" | "SENIOR";

export interface IClassData {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  order: number;
  level: string;
  createdAt: string;
}

export interface ClassPayload {
  name: string;
  level: Level;
  description?: string;
  order: number;
  isActive: boolean;
}

export interface ClassResponse {
  success: boolean;
  message: string;
  data?: IClassData[];
}

export const getClassesApi = async () => {
  try {
    const { data } = await api.get<ClassResponse>("/class");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const createClassApi = async (payload: ClassPayload) => {
  try {
    const { data } = await api.post<ClassResponse>("/class", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const updateClassApi = async (id: string, payload: ClassPayload) => {
  try {
    const { data } = await api.patch<ClassResponse>(`/class/${id}`, payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const updateClassStatusApi = async (
  id: string,
  payload: { isActive: boolean },
) => {
  try {
    const { data } = await api.patch<ClassResponse>(
      `/class/update-status/${id}`,
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
