/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../app/axios";

export const studentInitializeInvoicePayment = async (
  invoiceId: string,
  amountKobo?: number,
) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      data: { authorizationUrl: string; reference: string };
    }>("/student/payments/initialize", {
      invoiceId,
      ...(amountKobo ? { amountKobo } : {}),
    });

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const studentVerifyInvoicePayment = async (reference: string) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: {
        reference: any;
        status: string;
        alreadyProcessed: boolean;
        amountKobo?: undefined;
        currency?: undefined;
        paidAt?: undefined;
      };
    }>("/student/payments/verify", {
      reference,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};
