import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getStudentEvaluations,
  getStudentAttempt,
  startStudentEvaluation,
  submitStudentEvaluation,
  type IManualGrade,
  manualGradeEvaluation,
} from "../api/studentEvaluation";
import { getStudentProgress, getTeacherStudentProgress } from "../api/progress";
import { queryClient } from "../app/queryClient";

export const STUDENT_PROGRESS_KEY = ["student-progress"];
export const STUDENT_EVALUATION_KEY = ["student-evaluations"];
export const STUDENT_ATTEMPT_KEY = ["student-attempt"];

export const useStudentProgressQuery = () =>
  useQuery({
    queryKey: STUDENT_PROGRESS_KEY,
    queryFn: getStudentProgress,
  });

export const useTeacherStudentProgressQuery = (studentId: string) =>
  useQuery({
    queryKey: [...STUDENT_PROGRESS_KEY, "teacher", studentId],
    queryFn: () => getTeacherStudentProgress(studentId),
    enabled: Boolean(studentId),
  });

export const useStudentEvaluationsQuery = (
  page = 1,
  limit = 50,
  topicId?: string,
) =>
  useQuery({
    queryKey: [...STUDENT_EVALUATION_KEY, page, limit, topicId],
    queryFn: () => getStudentEvaluations(page, limit, topicId),
  });

export const useStudentAttemptQuery = (attemptId: string) =>
  useQuery({
    queryKey: [...STUDENT_ATTEMPT_KEY, attemptId],
    queryFn: () => getStudentAttempt(attemptId),
    enabled: Boolean(attemptId),
  });

export const useStartStudentEvaluationMutation = () =>
  useMutation({
    mutationFn: ({
      evaluationId,
      classId,
    }: {
      evaluationId: string;
      classId: string;
    }) => startStudentEvaluation(evaluationId, classId),
  });

export const useSubmitStudentEvaluationMutation = () =>
  useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: Array<{ questionId: string; answer: string }>;
    }) => submitStudentEvaluation(attemptId, answers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_PROGRESS_KEY });
      queryClient.invalidateQueries({ queryKey: STUDENT_EVALUATION_KEY });
    },
  });

export const useTeacherManualGradeEvaluationMutation = () =>
  useMutation({
    mutationFn: ({
      attemptId,
      answers,
    }: {
      attemptId: string;
      answers: Array<IManualGrade>;
    }) => manualGradeEvaluation(attemptId, answers),
    onSuccess: (response) => {
      queryClient.invalidateQueries({
        queryKey: [...STUDENT_PROGRESS_KEY, "teacher"],
      });
      queryClient.invalidateQueries({
        queryKey: [...STUDENT_ATTEMPT_KEY, response.data.attemptId],
      });
    },
  });
