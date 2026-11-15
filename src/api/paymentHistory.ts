import axios from "axios";
import api from "../app/axios";

export type PaymentStatus =
  | "PENDING"
  | "SUCCESS"
  | "FAILED"
  | "ABANDONED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentHistoryItem = {
  id: string;
  reference: string;
  provider: string;
  status: PaymentStatus;
  amount: number; // kobo
  currency: string;
  description?: string;
  paidAt?: string;
  createdAt: string;
  invoices?: Array<{
    invoiceNumber: string;
    academicSession: string;
    term: string;
    status: string;
  }>;
};

export type PaymentHistoryResponse = {
  success: boolean;
  data: {
    transactions: PaymentHistoryItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
};

export const getStudentPaymentHistory = async (
  page: number,
  limit: number,
  status?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });

    if (status?.trim()) params.set("status", status);

    const { data } = await api.get<PaymentHistoryResponse>(
      "/student/payment-history",
      { params },
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const getPaymentHistoryDetails = async (id: string) => {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: PaymentHistoryItem;
    }>(`/student/payment-history/${id}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const downloadPaymentReceipt = async (id: string) => {
  try {
    const response = await api.get<Blob>(
      `/student/payment-history/${id}/receipt`,
      {
        responseType: "blob",
      },
    );

    const disposition = response.headers["content-disposition"] as
      | string
      | undefined;
    const filenameMatch = disposition?.match(
      /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i,
    );
    const filename = decodeURIComponent(
      filenameMatch?.[1] ?? filenameMatch?.[2] ?? `payment-receipt-${id}.pdf`,
    );

    const url = URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};
