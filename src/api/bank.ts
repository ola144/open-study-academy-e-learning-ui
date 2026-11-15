import axios from "axios";
import api from "../app/axios";

export interface IBank {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  gateway: string | null;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
}

export const getAllBanks = async () => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message: string;
      data: Array<IBank>;
      total: number;
    }>("/banks");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }

    throw error;
  }
};
