import { useMutation, useQuery } from "@tanstack/react-query";
import {
  cancelSchedule,
  createSchedule,
  getAllSchedules,
  getAllStudentSchedules,
  getAllTeacherSchedules,
  updateSchedule,
  type ISchedulePayload,
} from "../api/schedule";
import { queryClient } from "../app/queryClient";

const SCHEDULE_KEY = ["schedule"];

export const useCreateScheduleMutation = () =>
  useMutation({
    mutationFn: (payload: ISchedulePayload) => createSchedule(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
  });

export const useUpdateScheduleMutation = () =>
  useMutation({
    mutationFn: ({ payload, id }: { payload: ISchedulePayload; id: string }) =>
      updateSchedule(payload, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
  });

export const useCancelScheduleMutation = () =>
  useMutation({
    mutationFn: ({ id }: { id: string }) => cancelSchedule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHEDULE_KEY }),
  });

export const useGetAllSchedules = (enabled = true) =>
  useQuery({
    queryKey: [...SCHEDULE_KEY, "admin"],
    queryFn: getAllSchedules,
    retry: false,
    enabled,
  });

export const useGetAllTeacherSchedules = (enabled = true) =>
  useQuery({
    queryKey: [...SCHEDULE_KEY, "teacher"],
    queryFn: getAllTeacherSchedules,
    retry: false,
    enabled,
  });

export const useGetAllStudentSchedules = (enabled = true) =>
  useQuery({
    queryKey: [...SCHEDULE_KEY, "student"],
    queryFn: getAllStudentSchedules,
    retry: false,
    enabled,
  });
