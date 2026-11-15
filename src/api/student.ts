import axios from "axios";
import api from "../app/axios";

export interface IStudentPayload {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: string;
  profilePic?: string;
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  updatedAt?: string;
  class?: {
    id: string;
    name: string;
    level: string;
  };
}

export interface SingleStudentResponse {
  success: boolean;
  message: string;
  data?: IStudentPayload;
}

export interface StudentsResponse {
  success: boolean;
  message: string;
  data?: IStudentPayload[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getAllStudents = async (
  page: number = 0,
  limit: number = 10,
  search?: string,
  classId?: string,
) => {
  try {
    const params = new URLSearchParams();

    if (page) params.set("page", String(page));
    if (limit) params.set("limit", String(limit));
    if (search) params.set("search", search);
    if (classId) params.set("classId", classId);

    const { data } = await api.get<StudentsResponse>(
      `/students${params ? `?${params}` : ""}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const getSingleStudent = async (id: string) => {
  try {
    const { data } = await api.get<SingleStudentResponse>(`/students/${id}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const updateStudent = async (payload: IStudentPayload, id: string) => {
  try {
    const { data } = await api.patch<SingleStudentResponse>(
      `/students/${id}/update-student`,
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

export const updateStudentStatus = async (
  payload: { isActive: boolean },
  id: string,
) => {
  try {
    const { data } = await api.patch<SingleStudentResponse>(
      `/students/update-status/${id}`,
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
