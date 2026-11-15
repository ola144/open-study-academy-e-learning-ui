import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createEvaluation,
  getEvaluations,
  updateEvaluation,
  updateEvaluationStatus,
  type IEvaluationPayload,
} from "../api/evaluation";
import { queryClient } from "../app/queryClient";

export const EVALUATION_KEY = ["evaluation"];

export const useEvaluationsQuery = (
  page = 1,
  limit = 10,
  search?: string,
  classId?: string,
  topicId?: string,
  status?: "published" | "draft",
) =>
  useQuery({
    queryKey: [
      ...EVALUATION_KEY,
      page,
      limit,
      search,
      classId,
      topicId,
      status,
    ],
    queryFn: () =>
      getEvaluations(page, limit, search, classId, topicId, status),
  });

export const useCreateEvaluationMutation = () =>
  useMutation({
    mutationFn: (payload: IEvaluationPayload) => createEvaluation(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEY }),
  });

export const useUpdateEvaluationStatusMutation = () =>
  useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      updateEvaluationStatus(id, isPublished),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEY }),
  });

export const useUpdateEvaluationMutation = () =>
  useMutation({
    mutationFn: ({
      payload,
      id,
    }: {
      payload: IEvaluationPayload;
      id: string;
    }) => updateEvaluation(payload, id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: EVALUATION_KEY }),
  });
