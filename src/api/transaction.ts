import axios from "axios";
import api from "../app/axios";

export interface ITransactionSummary {
  totalTransactions: number;
  pendingCount: number;
  successfulCount: number;
  failedCount: number;
  refundedCount: number;
  successfulAmount: number;
}

export interface ITransaction {
  id: string;
  student: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  invoices: [
    {
      id: string;
      invoiceNumber: string;
      totalAmount: number;
      amountPaid: number;
      refundedAmount: number;
      status: string;
    },
  ];
  reference: string;
  providerTransactionId: string;
  provider: string;
  status: string;
  amount: number;
  currency: string;
  description: string;
  paidAt: string;
  failureReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  reviewNote: string | null;
  createdAt: string;
  updatedAt: string;
  accessCode: string;
  authorizationUrl: string;
}

export interface TransactionListResponse {
  success: boolean;
  data: ITransaction[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const getTransactions = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  provider?: string,
  reference?: string,
  studentId?: string,
  from?: string,
  to?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });

    if (status?.trim()) params.set("status", status.trim());
    if (provider?.trim()) params.set("provider", provider.trim());
    if (reference?.trim()) params.set("reference", reference.trim());
    if (studentId?.trim()) params.set("studentId", studentId.trim());
    if (from?.trim()) params.set("from", from.trim());
    if (to?.trim()) params.set("to", to.trim());

    const { data } = await api.get<TransactionListResponse>(
      "/admin/transactions",
      {
        params,
      },
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const getTransactionDetails = async (id: string) => {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: ITransaction;
      message: string;
    }>(`/admin/transactions/${id}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const getTransactionSummary = async (from?: string, to?: string) => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message: string;
      data: ITransactionSummary;
    }>("/admin/transactions/summary", {
      params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const markTransactionAsReviewed = async (
  id: string,
  reviewNote: string,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      data: ITransaction;
      message: string;
    }>(`/admin/transactions/${id}/mark-reviewed`, { reviewNote });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};
