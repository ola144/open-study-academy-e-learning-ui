import axios from "axios";
import api from "../app/axios";

export interface ISchedulePayload {
  title: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  topicId?: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

export interface IScheduleRecord {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  teacher?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  class?: {
    id?: string;
    name: string;
    level: string;
  } | null;
  subject: {
    id?: string;
    name: string;
  } | null;
  topic?: {
    id?: string;
    title: string;
  } | null;
}

export interface ScheduleResponse {
  success: boolean;
  message: string;
  count?: number;
  data?: IScheduleRecord | IScheduleRecord[];
}

export interface ScheduleListResponse extends ScheduleResponse {
  data: IScheduleRecord[];
}

export const createSchedule = async (payload: ISchedulePayload) => {
  try {
    const { data } = await api.post<ScheduleResponse>(
      "/teaching-schedules",
      payload,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error creating schedule: ", error.response?.data);
    }
    throw error;
  }
};

export const updateSchedule = async (payload: ISchedulePayload, id: string) => {
  try {
    const { data } = await api.patch<ScheduleResponse>(
      `/teaching-schedules/${id}`,
      payload,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error updating schedule: ", error.response?.data);
    }
    throw error;
  }
};

export const cancelSchedule = async (id: string) => {
  try {
    const { data } = await api.patch<ScheduleResponse>(
      `/teaching-schedules/${id}/cancel`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error updating schedule: ", error.response?.data);
    }
    throw error;
  }
};

export const getAllSchedules = async () => {
  try {
    const { data } = await api.get<ScheduleListResponse>(
      `/teaching-schedules/all-schedules`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error fetching schedule: ", error.response?.data);
    }
    throw error;
  }
};

export const getAllTeacherSchedules = async () => {
  try {
    const { data } = await api.get<ScheduleListResponse>(
      `/teaching-schedules/teacher-schedules`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error fetching schedule: ", error.response?.data);
    }
    throw error;
  }
};

export const getAllStudentSchedules = async () => {
  try {
    const { data } = await api.get<ScheduleListResponse>(
      `/teaching-schedules/student-schedules`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error fetching schedule: ", error.response?.data);
    }
    throw error;
  }
};
