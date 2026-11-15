import axios from "axios";
import api from "../app/axios";

export interface IProgressEvaluation {
  id: string;
  title: string;
  type: string;
  subject?: { id: string; name: string };
  topic?: { id: string; title: string };
  passMark: number;
}

export interface IProgressAttempt {
  attemptId: string;
  evaluation: IProgressEvaluation | null;
  status: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | "EXPIRED";
  score: number;
  totalMarks: number;
  percentage: number;
  passed?: boolean;
  needsManualGrading: boolean;
  startedAt: string;
  submittedAt?: string;
  expiresAt?: string;
}

export interface IStudentProgress {
  totals: {
    attempts: number;
    gradedAttempts: number;
    passed: number;
    failed: number;
    averagePercentage: number;
    pendingManualGrading: number;
  };
  history: IProgressAttempt[];
}

export interface StudentProgressResponse {
  success: boolean;
  message: string;
  data: IStudentProgress;
}

export const getStudentProgress = async () => {
  try {
    const { data } = await api.get<StudentProgressResponse>(
      "/progress/student-progress",
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Student progress request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};

export const getTeacherStudentProgress = async (studentId: string) => {
  try {
    const { data } = await api.get<StudentProgressResponse>(
      `/progress/student-progress/${studentId}`,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Teacher student progress request failed:",
        error.response?.data ?? error.message,
      );
    }
    throw error;
  }
};
