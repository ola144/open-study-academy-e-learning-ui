import axios from "axios";
import api from "../app/axios";

export type SubjectCategory = "GENERAL" | "ARTS" | "SCIENCE" | "COMMERCIAL";

export interface ISubjectPayload {
  name: string;
  slug?: string;
  description?: string;
  classId: string;
  category: SubjectCategory | string;
  order?: number;
  createdBy: string;
  createdAt?: Date;
  updatedAt?: Date;
  isActive?: boolean;
}

export interface ISubjectRecord extends Omit<
  ISubjectPayload,
  "classId" | "createdAt" | "updatedAt"
> {
  id?: string;
  class: {
    id: string;
    name: string;
    level: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface SingleSubjectResponse {
  success: boolean;
  message: string;
  data: ISubjectRecord;
}

export interface SubjectsResponse {
  success: boolean;
  message: string;
  data: ISubjectRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createSubject = async (payload: ISubjectPayload) => {
  try {
    const { data } = await api.post<SingleSubjectResponse>(
      "/subjects",
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

export const updateSubject = async (payload: ISubjectPayload, id: string) => {
  try {
    const { data } = await api.patch<SingleSubjectResponse>(
      `/subjects/${id}`,
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

export const getAllSubjects = async (
  page: number = 1,
  limit: number = 10,
  search?: string,
  classId?: string,
  includeInactive = false,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });
    if (search?.trim()) params.set("search", search.trim());
    if (classId) params.set("classId", classId);
    if (includeInactive) params.set("includeInactive", "true");

    const { data } = await api.get<SubjectsResponse>(`/subjects?${params}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const getAssignedTeacherSubjects = async (
  page = 1,
  limit = 10,
  search?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });
    if (search?.trim()) params.set("search", search.trim());

    const { data } = await api.get<SubjectsResponse>(
      `/subjects/assigned?${params}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Assigned subjects request failed:", error.response?.data);
    }

    throw error;
  }
};

export const getStudentSubjects = async (
  page = 1,
  limit = 100,
  search?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(Math.min(100, limit)),
    });
    if (search?.trim()) params.set("search", search.trim());

    const { data } = await api.get<SubjectsResponse>(
      `/subjects/student-assigned?${params.toString()}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Student subjects request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getStudentSubject = async (id: string) => {
  try {
    const { data } = await api.get<SingleSubjectResponse>(
      `/subjects/student-assigned/${id}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Student subject request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getSingleSubject = async (id: string) => {
  try {
    const { data } = await api.get<SingleSubjectResponse>(`/subjects/${id}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};

export const updateSubjectStatus = async (
  payload: { isActive: boolean },
  id: string,
) => {
  try {
    const { data } = await api.patch<SingleSubjectResponse>(
      `/subjects/update-status/${id}`,
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
