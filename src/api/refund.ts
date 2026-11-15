import axios from "axios";
import api from "../app/axios";

export const RefundStatus = {
  INITIATING: "INITIATING",
  PENDING: "PENDING",
  PROCESSING: "PROCESSING",
  PROCESSED: "PROCESSED",
  FAILED: "FAILED",
  NEEDS_ATTENTION: "NEEDS_ATTENTION",
} as const;

export type RefundStatusType = (typeof RefundStatus)[keyof typeof RefundStatus];

export interface RefundPerson {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface RefundInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount?: number;
  amountPaid?: number;
  status?: string;
}

export interface IRefund {
  id: string;
  invoiceId?: string;
  studentId?: string;
  paymentTransactionId?: string;
  paymentReference: string;
  refundReference: string;
  paystackRefundId?: number;
  amount: number;
  currency: string;
  reason?: string;
  status: RefundStatusType;
  initiatedBy: string | RefundPerson;
  processedAt?: string;
  failureReason?: string;
  lastPaystackStatus?: string;
  lastReconciledAt?: string;
  createdAt?: string;
  updatedAt?: string;
  student?: string | RefundPerson | null;
  invoice?: string | RefundInvoice | null;
  paymentTransaction?: Record<string, unknown> | string;
}

export interface RefundListResponse {
  success: boolean;
  message: string;
  data: IRefund[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface RefundDetailsResponse {
  success: boolean;
  message: string;
  data: IRefund;
}

export interface RefundReconcileResponse {
  success: boolean;
  message: string;
  data: {
    updated: boolean;
    message: string;
    paystackStatus?: string;
    refund: IRefund;
  };
}

export const adminReconcileRefund = async (id: string) => {
  try {
    const { data } = await api.post<RefundReconcileResponse>(
      `/admin/refunds/${id}/reconcile`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not reconcile refund", error.response?.data);
    }
    throw error;
  }
};

export const adminGetRefunds = async (
  page = 1,
  limit = 10,
  status?: string,
  invoiceId?: string,
  studentId?: string,
  search?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(Math.min(100, Math.max(1, limit))),
    });

    if (status?.trim()) params.set("status", status.trim());
    if (invoiceId?.trim()) params.set("invoiceId", invoiceId.trim());
    if (studentId?.trim()) params.set("studentId", studentId.trim());
    if (search?.trim()) params.set("search", search.trim());

    const { data } = await api.get<RefundListResponse>("/admin/refunds", {
      params,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not load refunds", error.response?.data);
    }
    throw error;
  }
};

export const adminGetRefundDetails = async (id: string) => {
  try {
    const { data } = await api.get<RefundDetailsResponse>(
      `/admin/refunds/${id}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not load refund details", error.response?.data);
    }
    throw error;
  }
};

export const adminReconsileRefund = adminReconcileRefund;
export const adminGetAllRefunds = adminGetRefunds;
export const adminGetRefundDetaiils = adminGetRefundDetails;
