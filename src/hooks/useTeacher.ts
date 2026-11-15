import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createTeacher,
  getAllTeachers,
  getSingleTeacher,
  updateTeacher,
  updateTeacherStatus,
  type ITeacherPayload,
} from "../api/teacher";
import { queryClient } from "../app/queryClient";

export const TEACHER_KEY = ["teacher"];

export const useCreateTeacherMutation = () => {
  return useMutation({
    mutationFn: (payload: ITeacherPayload) => createTeacher(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_KEY });
    },
  });
};

export const useUpdateTeacherMutation = () => {
  return useMutation({
    mutationFn: ({ payload, id }: { payload: ITeacherPayload; id: string }) =>
      updateTeacher(payload, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_KEY });
    },
  });
};

export const useTeachersQuery = (
  page: number = 1,
  limit: number = 10,
  search?: string,
) => {
  return useQuery({
    queryKey: [...TEACHER_KEY, page, limit, search],
    queryFn: () => getAllTeachers(page, limit, search),
    retry: false,
  });
};

export const useSigleTeacherQuery = (id: string) => {
  return useQuery({
    queryKey: [...TEACHER_KEY, id],
    queryFn: ({ queryKey }) => getSingleTeacher(queryKey[1] as string),
    enabled: !!id,
    retry: false,
  });
};

export const useUpdateTeacherStatusMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive: boolean };
    }) => updateTeacherStatus(payload, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TEACHER_KEY });
    },
  });
};
