import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSubject,
  getAssignedTeacherSubjects,
  getStudentSubjects,
  getStudentSubject,
  getAllSubjects,
  getSingleSubject,
  updateSubject,
  updateSubjectStatus,
  type ISubjectPayload,
} from "../api/subject";
import { queryClient } from "../app/queryClient";

export const SUBJECT_KEY = ["subject"];

export const useCreateSubjectMutation = () => {
  return useMutation({
    mutationFn: (payload: ISubjectPayload) => createSubject(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEY });
    },
  });
};

export const useUpdateSubjectMutation = () => {
  return useMutation({
    mutationFn: ({ payload, id }: { payload: ISubjectPayload; id: string }) =>
      updateSubject(payload, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEY });
    },
  });
};

export const useGetSubjectQuery = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  classId?: string,
  includeInactive = false,
) => {
  return useQuery({
    queryKey: [...SUBJECT_KEY, page, limit, search, classId, includeInactive],
    queryFn: () =>
      getAllSubjects(page, limit, search, classId, includeInactive),
  });
};

export const useAssignedTeacherSubjectsQuery = (
  page = 1,
  limit = 10,
  search?: string,
) =>
  useQuery({
    queryKey: [...SUBJECT_KEY, "assigned", page, limit, search],
    queryFn: () => getAssignedTeacherSubjects(page, limit, search),
  });

export const useStudentSubjectsQuery = (
  page = 1,
  limit = 100,
  search?: string,
) =>
  useQuery({
    queryKey: [...SUBJECT_KEY, "student", page, limit, search],
    queryFn: () => getStudentSubjects(page, limit, search),
  });

export const useStudentSubjectQuery = (id: string) =>
  useQuery({
    queryKey: [...SUBJECT_KEY, "student", id],
    queryFn: () => getStudentSubject(id),
    enabled: Boolean(id),
  });

export const useGetSingleSubjectQuery = (id: string) => {
  return useQuery({
    queryKey: [...SUBJECT_KEY, id],
    queryFn: () => getSingleSubject(id),
    enabled: !!id,
  });
};

export const useUpdateSubjectStatusMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive: boolean };
    }) => updateSubjectStatus(payload, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SUBJECT_KEY });
    },
  });
};
