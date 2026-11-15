import axios from "axios";
import api from "../app/axios";

export interface ITeacherSubject {
  id?: string;
  name?: string;
  class?: {
    id?: string;
    name?: string;
  };
}

export interface ITeacherPayload {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profilePic?: string;
  assignedSubjects?: Array<string | ITeacherSubject>;
  assignedSubjectIds?: string[];
  role?: "ADMIN" | "TEACHER" | "STUDENT";
  isActive?: boolean;
  isEmailVerified?: boolean;
  lastLoginAt?: string;
  createdAt?: string;
  hasPassword?: boolean;
}

export interface SingleTeacherResponse {
  success: boolean;
  message: string;
  data?: ITeacherPayload;
}

export interface TeachersResponse {
  success: boolean;
  message: string;
  data?: ITeacherPayload[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createTeacher = async (payload: ITeacherPayload) => {
  const { data } = await api.post<SingleTeacherResponse>(
    "/admin/teacher",
    payload,
  );

  return data;
};

export const getAllTeachers = async (
  page: number = 0,
  limit: number = 10,
  search?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });

    if (search?.trim()) params.set("search", search.trim());

    const { data } = await api.get<TeachersResponse>(
      `/admin/teacher?${params}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const getSingleTeacher = async (id: string) => {
  try {
    const { data } = await api.get<SingleTeacherResponse>(
      `/admin/teacher/${id}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const updateTeacher = async (payload: ITeacherPayload, id: string) => {
  try {
    const { data } = await api.patch<SingleTeacherResponse>(
      `/admin/teacher/${id}`,
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

export const updateTeacherStatus = async (
  payload: { isActive: boolean },
  id: string,
) => {
  try {
    const { data } = await api.patch<SingleTeacherResponse>(
      `/admin/teacher/update-status/${id}`,
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
