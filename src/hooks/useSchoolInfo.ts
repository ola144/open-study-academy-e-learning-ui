import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createSchoolInfo,
  getSchoolInfo,
  updateSchoolInfo,
  uploadSchoolLog,
} from "../api/schoolInfo";
import type { SchoolInfoPayload } from "../api/schoolInfo";
import { queryClient } from "../app/queryClient";

const SCHOOL_INFO_KEY = ["school-info"];

export const useSchoolInfoQuery = () =>
  useQuery({
    queryKey: SCHOOL_INFO_KEY,
    queryFn: getSchoolInfo,
    retry: false,
  });

export const useSaveSchoolInfoMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id?: string;
      payload: SchoolInfoPayload;
    }) => (id ? updateSchoolInfo(id, payload) : createSchoolInfo(payload)),
    onSuccess: (response) => {
      queryClient.setQueryData(SCHOOL_INFO_KEY, response);
    },
  });
};

export const useUploadSchoolLogoMutation = () => {
  return useMutation({
    mutationFn: ({ id, logo }: { id: string; logo: string }) =>
      uploadSchoolLog(id, logo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SCHOOL_INFO_KEY });
    },
  });
};
