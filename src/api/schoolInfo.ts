import axios from "axios";
import api from "../app/axios";

export type SchoolTerm = "FIRST" | "SECOND" | "THIRD";

export interface SchoolInfoPayload {
  name: string;
  term: SchoolTerm;
  address: string;
  logo?: string;
  email: string;
  phoneNumber: string;
}

export interface SchoolInfo extends SchoolInfoPayload {
  id: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SchoolInfoResponse {
  success: boolean;
  message?: string;
  data: SchoolInfo | null;
}

export const getSchoolInfo = async (): Promise<SchoolInfoResponse> => {
  try {
    const { data } = await api.get<SchoolInfoResponse>("/school-info");
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};

export const createSchoolInfo = async (
  payload: SchoolInfoPayload,
): Promise<SchoolInfoResponse> => {
  try {
    const { data } = await api.post<SchoolInfoResponse>(
      "/school-info",
      payload,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};

export const updateSchoolInfo = async (
  id: string,
  payload: SchoolInfoPayload,
): Promise<SchoolInfoResponse> => {
  try {
    const { data } = await api.patch<SchoolInfoResponse>(
      `/school-info/${id}`,
      payload,
    );
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};

export const uploadSchoolLog = async (id: string, logo: string) => {
  try {
    const { data } = await api.patch<SchoolInfoResponse>(
      `/school-info/${id}/upload-logo`,
      {
        logo,
      },
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};
