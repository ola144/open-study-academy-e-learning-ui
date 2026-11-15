/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../app/axios";

export const handlePaystackWebhook = async (payload: { event: string }) => {
  try {
    const { data } = await api.post("/payments/paystack/webhook", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const handlePaystackPayrollWebhook = async (payload: {
  event: any;
  data: any;
}) => {
  try {
    const { data } = await api.post(
      "/payments/paystack/payroll-webhook",
      payload,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};
