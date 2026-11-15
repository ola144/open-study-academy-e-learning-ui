import axios from "axios";
import api from "../app/axios";

export type QuestionType =
  | "MULTIPLE_CHOICE"
  | "TRUE_FALSE"
  | "SHORT_ANSWER"
  | "ESSAY";
export type QuestionDifficulty = "EASY" | "MEDIUM" | "HARD";

export interface IQuestionOption {
  label: string;
  value: string;
}

export interface IQuestionRecord {
  id: string;
  prompt: string;
  type: QuestionType;
  options: IQuestionOption[];
  explanation?: string;
  marks: number;
  correctAnswers?: string[];
  difficulty: QuestionDifficulty;
  subject: { id: string; name: string };
  topic?: { id: string; title: string };
  lesson?: { id: string; title: string };
  isActive: boolean;
  createdAt?: string;
}

export interface IQuestionPayload {
  prompt: string;
  type: QuestionType;
  options: IQuestionOption[];
  correctAnswers: string[];
  explanation?: string;
  marks: number;
  difficulty: QuestionDifficulty;
  subjectId: string;
  topicId?: string;
  lessonId?: string;
}

export interface QuestionsResponse {
  success: boolean;
  message: string;
  data: IQuestionRecord[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const getQuestions = async (
  page = 1,
  limit = 10,
  filters: {
    search?: string;
    subjectId?: string;
    topicId?: string;
    lessonId?: string;
  } = {},
) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value?.trim()) params.set(key, value.trim());
    });
    const { data } = await api.get<QuestionsResponse>(
      `/questions?${params.toString()}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Questions request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const createQuestion = async (payload: IQuestionPayload) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      data: IQuestionRecord;
    }>("/questions", payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Question creation failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const updateQuestion = async (
  payload: Partial<IQuestionPayload>,
  id: string,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      data: IQuestionRecord;
    }>(`/questions/${id}`, payload);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Question updating failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

// export const changeQuestion
