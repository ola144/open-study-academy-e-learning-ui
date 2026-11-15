import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createTopic,
  getAssignedTeacherTopics,
  getAllTopics,
  getSingleTopic,
  updateTopic,
  type ITopicPayload,
  markTopicAsCompleted,
} from "../api/topic";
import { queryClient } from "../app/queryClient";
import { useSchoolInfoQuery } from "./useSchoolInfo";

export const TOPIC_KEY = ["topic"];

export const useTopicsQuery = (
  page = 1,
  limit = 10,
  search?: string,
  subjectId?: string,
  includeInactive = false,
  enabled = true,
  term?: string,
) => {
  return useQuery({
    queryKey: [...TOPIC_KEY, page, limit, search, subjectId, includeInactive],
    queryFn: () => {
      return getAllTopics(
        page,
        limit,
        search,
        subjectId,
        term,
        includeInactive,
      );
    },
    enabled,
  });
};

export const useAssignedTeacherTopicsQuery = (
  page = 1,
  limit = 10,
  search?: string,
  subjectId?: string,
) => {
  const schoolInfoQuery = useSchoolInfoQuery();
  const info = schoolInfoQuery.data?.data;
  const term = info?.term;

  return useQuery({
    queryKey: [...TOPIC_KEY, "assigned", page, limit, search, subjectId || ""],
    queryFn: () => {
      if (!term) return;
      return getAssignedTeacherTopics(page, limit, search, subjectId, term);
    },
  });
};

export const useSingleTopicQuery = (id: string) =>
  useQuery({
    queryKey: [...TOPIC_KEY, id],
    queryFn: () => getSingleTopic(id),
    enabled: Boolean(id),
  });

export const useCreateTopicMutation = () =>
  useMutation({
    mutationFn: (payload: ITopicPayload) => createTopic(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOPIC_KEY }),
  });

export const useUpdateTopicMutation = () =>
  useMutation({
    mutationFn: ({
      payload,
      id,
    }: {
      payload: Partial<ITopicPayload> & { isActive?: boolean };
      id: string;
    }) => updateTopic(payload, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOPIC_KEY }),
  });

export const useMarkAsCompletedMutation = () =>
  useMutation({
    mutationFn: ({ id }: { id: string }) => markTopicAsCompleted(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: TOPIC_KEY }),
  });
