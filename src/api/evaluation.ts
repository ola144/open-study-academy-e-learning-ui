import axios from "axios";
import api from "../app/axios";

export type EvaluationType = "QUIZ" | "TEST" | "EXAM";

export interface IEvaluationPayload {
  title: string;
  type: EvaluationType;
  subjectId: string;
  topicId: string;
  lessonId?: string;
  classId: string;
  questionIds: string[];
  durationMinutes: number;
  passMark: number;
  availableFrom?: string;
  availableUntil?: string;
  maxAttempts: number;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
}

export interface IEvaluationRecord {
  id: string;
  title: string;
  type: EvaluationType;
  subject: { id: string; name: string };
  topic: { id: string; title: string };
  lesson?: { id: string; title: string };
  class: { id: string; name: string; level?: string };
  questions: Array<{
    id: string;
    prompt: string;
    type: string;
    marks: number;
  }>;
  durationMinutes: number;
  availableFrom?: string;
  availableUntil?: string;
  passMark: number;
  maxAttempts: number;
  isPublished: boolean;
  createdAt?: string;
  shuffleQuestions?: boolean;
  showResultsImmediately?: boolean;
}

export interface EvaluationsResponse {
  success: boolean;
  message: string;
  data: IEvaluationRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getEvaluations = async (
  page = 1,
  limit = 10,
  search?: string,
  classId?: string,
  topicId?: string,
  status?: "published" | "draft",
) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search?.trim()) params.set("search", search.trim());
    if (classId?.trim()) params.set("classId", classId.trim());
    if (topicId?.trim()) params.set("topicId", topicId.trim());
    if (status) params.set("status", status);
    const { data } = await api.get<EvaluationsResponse>(
      `/evaluations?${params.toString()}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Evaluations request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const createEvaluation = async (payload: IEvaluationPayload) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      data: IEvaluationRecord;
      message: string;
    }>("/evaluations", payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Evaluation creation failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const updateEvaluation = async (
  payload: IEvaluationPayload,
  id: string,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      data: IEvaluationRecord;
      message: string;
    }>(`/evaluations/${id}`, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Evaluation creation failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const updateEvaluationStatus = async (
  id: string,
  isPublished: boolean,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      data: IEvaluationRecord;
    }>(`/evaluations/update-status/${id}`, { isPublished });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Evaluation status update failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};
