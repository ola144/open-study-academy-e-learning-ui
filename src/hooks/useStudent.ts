import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getAllStudents,
  getSingleStudent,
  updateStudent,
  updateStudentStatus,
  type IStudentPayload,
} from "../api/student";
import { queryClient } from "../app/queryClient";

export const STUDENT_KEY = ["student"];

export const useStudentsQuery = (
  page: number = 1,
  limit: number = 10,
  search?: string,
  classId?: string,
) => {
  return useQuery({
    queryKey: [...STUDENT_KEY, page, limit, search, classId],
    queryFn: () => getAllStudents(page, limit, search, classId),
    retry: false,
  });
};

export const useSigleStudentQuery = (id: string) => {
  return useQuery({
    queryKey: [...STUDENT_KEY, id],
    queryFn: ({ queryKey }) => getSingleStudent(queryKey[1] as string),
    enabled: !!id,
    retry: false,
  });
};

export const useUpdateStudentStatusMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive: boolean };
    }) => updateStudentStatus(payload, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEY });
    },
  });
};

export const useUpdateStudentMutation = () => {
  return useMutation({
    mutationFn: ({ payload, id }: { payload: IStudentPayload; id: string }) =>
      updateStudent(payload, id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STUDENT_KEY });
    },
  });
};
