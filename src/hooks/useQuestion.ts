import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createQuestion,
  getQuestions,
  updateQuestion,
  type IQuestionPayload,
} from "../api/question";
import { queryClient } from "../app/queryClient";

export const QUESTION_KEY = ["question"];

export const useQuestionsQuery = (
  page = 1,
  limit = 10,
  filters: {
    search?: string;
    subjectId?: string;
    topicId?: string;
    lessonId?: string;
  } = {},
) =>
  useQuery({
    queryKey: [...QUESTION_KEY, page, limit, filters],
    queryFn: () => getQuestions(page, limit, filters),
  });

export const useCreateQuestionMutation = () =>
  useMutation({
    mutationFn: (payload: IQuestionPayload) => createQuestion(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUESTION_KEY }),
  });

export const useUpdateQuestionMutation = () =>
  useMutation({
    mutationFn: ({ payload, id }: { payload: IQuestionPayload; id: string }) =>
      updateQuestion(payload, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUESTION_KEY }),
  });
