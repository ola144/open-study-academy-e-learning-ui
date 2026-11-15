import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createLesson,
  getLessons,
  getSingleLesson,
  updateLesson,
  updateLessonStatus,
  type ILessonPayload,
  type LessonStatus,
} from "../api/lesson";
import { queryClient } from "../app/queryClient";

export const LESSON_KEY = ["lesson"];

export const useLessonsQuery = (
  page = 1,
  limit = 10,
  topicId?: string,
  search?: string,
  status?: LessonStatus,
) =>
  useQuery({
    queryKey: [...LESSON_KEY, page, limit, topicId, search, status],
    queryFn: () => getLessons(page, limit, topicId, search, status),
    enabled: Boolean(topicId),
  });

export const useSingleLessonQuery = (id: string) =>
  useQuery({
    queryKey: [...LESSON_KEY, id],
    queryFn: () => getSingleLesson(id),
    enabled: Boolean(id),
  });

export const useCreateLessonMutation = () =>
  useMutation({
    mutationFn: (payload: ILessonPayload) => createLesson(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LESSON_KEY }),
  });

export const useUpdateLessonMutation = () =>
  useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ILessonPayload }) =>
      updateLesson(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LESSON_KEY }),
  });

export const useUpdateLessonStatusMutation = () =>
  useMutation({
    mutationFn: ({ id, publish }: { id: string; publish: boolean }) =>
      updateLessonStatus(id, publish),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LESSON_KEY }),
  });
