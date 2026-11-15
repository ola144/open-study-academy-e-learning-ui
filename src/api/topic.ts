import axios from "axios";
import api from "../app/axios";

export type AcademicTerm = "FIRST" | "SECOND" | "THIRD";

export interface ITopicPayload {
  title: string;
  subjectId: string;
  classId: string;
  description?: string;
  order?: number;
  term?: AcademicTerm | string;
}

export type ITopicRecord = Omit<ITopicPayload, "subjectId"> & {
  id?: string;
  slug?: string;
  isActive: boolean;
  isComplete: boolean;
  createdAt?: string;
  updatedAt?: string;
  classId?: string;
  subject: {
    id?: string;
    name: string;
    classId?: string | { name: string; level?: string };
  };
  class: {
    id?: string;
    name: string;
    level: string;
  };
};

export interface SingleTopicResponse {
  success: boolean;
  message: string;
  data: ITopicRecord;
}

export interface TopicResponse {
  success: boolean;
  message: string;
  data: ITopicRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createTopic = async (payload: ITopicPayload) => {
  try {
    const { data } = await api.post<SingleTopicResponse>("/topics", payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Topic request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const updateTopic = async (
  payload: Partial<ITopicPayload> & { isActive?: boolean },
  id: string,
) => {
  try {
    const { data } = await api.patch<SingleTopicResponse>(
      `/topics/${id}`,
      payload,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Topic request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getAllTopics = async (
  page = 1,
  limit = 10,
  search?: string,
  subjectId?: string,
  term?: string,
  includeInactive = false,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });
    if (search?.trim()) params.set("search", search.trim());
    if (subjectId) params.set("subjectId", subjectId);
    if (term) params.set("term", term);
    if (includeInactive) params.set("includeInactive", "true");

    const { data } = await api.get<TopicResponse>(`/topics?${params}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Topic request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getAssignedTeacherTopics = async (
  page = 1,
  limit = 10,
  search?: string,
  subjectId?: string,
  term?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });
    if (search?.trim()) params.set("search", search.trim());
    if (subjectId) params.set("subjectId", subjectId);
    if (term) params.set("term", term);

    const { data } = await api.get<TopicResponse>(`/topics/assigned?${params}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Assigned topics request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getSingleTopic = async (id: string) => {
  try {
    const { data } = await api.get<SingleTopicResponse>(`/topics/${id}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Topic request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const markTopicAsCompleted = async (id: string) => {
  try {
    const { data } = await api.patch<SingleTopicResponse>(
      `/topics/mark-as-completed/${id}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Topic request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};
