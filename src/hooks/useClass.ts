import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createClassApi,
  getClassesApi,
  updateClassApi,
  updateClassStatusApi,
  type ClassPayload,
} from "../api/class";
import { queryClient } from "../app/queryClient";

const CLASS_KEY = ["classes"];

export const useClassQuery = () => {
  return useQuery({
    queryKey: CLASS_KEY,
    queryFn: getClassesApi,
    retry: false,
  });
};

export const useCreateClassMutation = () => {
  return useMutation({
    mutationFn: (paylaod: ClassPayload) => createClassApi(paylaod),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_KEY }),
  });
};

export const useUpdateClassMutation = () => {
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: ClassPayload }) =>
      updateClassApi(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_KEY }),
  });
};

export const useUpdateClassStatusMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { isActive: boolean };
    }) => updateClassStatusApi(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: CLASS_KEY }),
  });
};
