import axios from "axios";
import api from "../app/axios";
import type { EvaluationType } from "./evaluation";
import type { IQuestionOption, QuestionType } from "./question";

export interface IStudentEvaluation {
  id: string;
  title: string;
  type: EvaluationType;
  subject: { id: string; name: string };
  topic?: { id: string; title: string };
  class: { id: string; name: string; level: string };
  questions: Array<string | { id: string; prompt: string }>;
  durationMinutes: number;
  passMark: number;
  maxAttempts: number;
  availableFrom?: string;
  availableUntil?: string;
  isPublished: boolean;
}

export interface StudentEvaluationsResponse {
  success: boolean;
  message: string;
  data: IStudentEvaluation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IManualGradeResponse {
  attemptId: string;
  status: string;
  needsManualGrading: boolean;
  score: number;
  totalMarks: number;
  percentage: number;
  passed: boolean;
  gradedAt: string;
  answers: Array<{
    questionId: string;
    awardedMarks: number;
    maxMarks: number;
    needsManualGrading: boolean;
    feedback?: string;
  }>;
}

export interface IAttemptQuestion {
  id: string;
  prompt: string;
  type: QuestionType;
  options: IQuestionOption[];
  marks: number;
  difficulty: string;
}

export interface IAttemptAnswer {
  questionId: string;
  answer: unknown;
  awardedMarks: number;
  maxMarks: number;
  needsManualGrading: boolean;
  feedback?: string;
}

export interface IStudentAttemptDetails {
  id: string;
  evaluation: {
    id?: string;
    title: string;
    type?: EvaluationType;
    passMark?: number;
    showResultsImmediately?: boolean;
  } | null;
  questions: IAttemptQuestion[];
  answers: IAttemptAnswer[];
  status: string;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  passed?: boolean;
  expiresAt: string;
  startedAt: string;
  submittedAt?: string;
  gradedAt?: string;
  needsManualGrading?: boolean;
}

export interface IStartedAttempt {
  attemptId: string;
  startedAt: string;
  expiresAt: string;
  evaluation: { id?: string; title: string; durationMinutes: number };
  questions: IAttemptQuestion[];
}

export interface IAttemptResult {
  attemptId: string;
  status: string;
  submittedAt: string;
  needsManualGrading: boolean;
  score?: number;
  totalMarks?: number;
  percentage?: number;
  passed?: boolean;
}

export interface IManualGrade {
  questionId: string;
  awardedMarks: number;
  feedback?: string;
}

export const getStudentEvaluations = async (
  page = 1,
  limit = 50,
  topicId?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (topicId) params.set("topicId", topicId);
    const { data } = await api.get<StudentEvaluationsResponse>(
      `/evaluations/student-evaluation?${params.toString()}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Student evaluations request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const startStudentEvaluation = async (
  evaluationId: string,
  classId: string,
) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      data: IStartedAttempt;
    }>(`/evaluation-attempt/start-evaluation/${evaluationId}/${classId}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Starting evaluation failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getStudentAttempt = async (attemptId: string) => {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: IStudentAttemptDetails;
    }>(`/evaluation-attempt/${attemptId}`);
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Evaluation attempt request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const submitStudentEvaluation = async (
  attemptId: string,
  answers: Array<{ questionId: string; answer: string }>,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      data: IAttemptResult;
    }>(`/evaluation-attempt/submit-evaluation/${attemptId}`, { answers });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Submitting evaluation failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const manualGradeEvaluation = async (
  attemptId: string,
  answers: Array<IManualGrade>,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      data: IManualGradeResponse;
    }>(`/evaluation-attempt/${attemptId}/manual-grade`, { answers });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Grading evaluation failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};
