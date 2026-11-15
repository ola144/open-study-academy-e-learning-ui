import axios from "axios";
import api from "../app/axios";

export type LessonContentType = "HEADING" | "TEXT" | "IMAGE" | "VIDEO" | "LIST";
export type LessonStatus = "DRAFT" | "PUBLISHED";

export interface ILessonContentBlock {
  type: LessonContentType;
  text?: string;
  url?: string;
  caption?: string;
  items?: string[];
}

export interface ILessonRecord {
  id?: string;
  title: string;
  slug?: string;
  topicId?: string;
  topic?: {
    id?: string;
    title: string;
    subject?: {
      classId: string;
      name: string;
      id: string;
    };
  };
  summary?: string;
  objectives: Array<string>;
  content: ILessonContentBlock[];
  estimatedMinutes: number;
  status: LessonStatus;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ILessonPayload = Omit<
  ILessonRecord,
  "id" | "slug" | "status" | "publishedAt" | "createdAt" | "updatedAt"
> & { topicId: string };

export interface LessonResponse {
  success: boolean;
  message: string;
  data: ILessonRecord;
}

export interface LessonsResponse {
  success: boolean;
  message: string;
  data: ILessonRecord[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const createLesson = async (payload: ILessonPayload) => {
  try {
    const { data } = await api.post<LessonResponse>("/lessons", payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Lesson request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const updateLesson = async (id: string, payload: ILessonPayload) => {
  try {
    const { data } = await api.patch<LessonResponse>(`/lessons/${id}`, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Lesson request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getLessons = async (
  page = 1,
  limit = 10,
  topicId?: string,
  search?: string,
  status?: LessonStatus,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });
    if (topicId) params.set("topicId", topicId);
    if (search?.trim()) params.set("search", search.trim());
    if (status) params.set("status", status);

    const { data } = await api.get<LessonsResponse>(`/lessons?${params}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Lesson request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getSingleLesson = async (id: string) => {
  try {
    const { data } = await api.get<LessonResponse>(`/lessons/${id}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Lesson request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const updateLessonStatus = async (id: string, publish: boolean) => {
  try {
    const action = publish ? "publish" : "unpublish";
    const { data } = await api.patch<LessonResponse>(
      `/lessons/${id}/${action}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Lesson request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};
