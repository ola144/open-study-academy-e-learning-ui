import axios from "axios";
import api from "../app/axios";
import type { IRefund } from "./refund";

export const invoiceId = (invoice: Invoice) => invoice.id ?? "";

export const statusColor = (
  status: string,
): "default" | "success" | "warning" | "error" | "info" =>
  status === "PAID"
    ? "success"
    : status === "OVERDUE" || status === "CANCELLED"
      ? "error"
      : status === "PARTIALLY_PAID"
        ? "info"
        : status === "UNPAID"
          ? "warning"
          : "default";

export const invoiceStatuses = [
  "DRAFT",
  "UNPAID",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
] as const;

export const feeCategories = [
  "TUITION",
  "REGISTRATION",
  "DEVELOPMENT_LEVY",
  "EXAMINATION",
  "LEARNING_MATERIALS",
  "DIGITAL_SUBSCRIPTION",
  "OTHER",
] as const;

export interface InvoiceItem {
  id?: string;
  description?: string;
  category?: (typeof feeCategories)[number];
  amount?: number;
}

export interface Invoice {
  id?: string;
  invoiceNumber: string;
  student?: { id?: string; firstName?: string; lastName?: string };
  class?: { id?: string; name?: string } | string;
  academicSession: string;
  term: string;
  items: InvoiceItem[];
  subtotal: number;
  discountAmount: number;
  totalAmount: number;
  amountPaid: number;
  outstandingBalance: number;
  refundedAmount?: number;
  refundPendingAmount?: number;
  currency: string;
  issuedAt: string;
  dueDate: string;
  status: (typeof invoiceStatuses)[number];
  allowInstallments: boolean;
  installmentCount: number;
  notes?: string;
}

export interface CreateInvoicePayload {
  studentId: string;
  classId: string;
  academicSession: string;
  term: "FIRST" | "SECOND" | "THIRD";
  items: InvoiceItem[];
  discountAmount: number;
  dueDate: string;
  allowInstallments: boolean;
  installmentCount: number;
  notes?: string;
}

export type ClassInvoicePayload = Omit<CreateInvoicePayload, "studentId">;

export interface InvoiceListResponse {
  success: boolean;
  data: Invoice[];
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const getAdminInvoices = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  studentId?: string,
  classId?: string,
  academicSession?: string,
  term?: string,
  from?: string,
  to?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });

    if (status?.trim()) params.set("status", status.trim());
    if (classId?.trim()) params.set("classId", classId.trim());
    if (academicSession?.trim())
      params.set("academicSession", academicSession.trim());
    if (term?.trim()) params.set("term", term.trim());
    if (studentId?.trim()) params.set("studentId", studentId.trim());
    if (from?.trim()) params.set("from", from.trim());
    if (to?.trim()) params.set("to", to.trim());

    const { data } = await api.get<InvoiceListResponse>("/admin/invoices", {
      params,
    });
    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const getAdminInvoiceDetails = async (id: string) => {
  try {
    const { data } = await api.get<{ success: boolean; data: Invoice }>(
      `/admin/invoices/${id}`,
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const createAdminInvoice = async (payload: CreateInvoicePayload) => {
  try {
    const { data } = await api.post<{ success: boolean; data: Invoice }>(
      "/admin/invoices",
      payload,
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const createAdminDraftInvoice = async (
  payload: CreateInvoicePayload,
) => {
  try {
    const { data } = await api.post<{ success: boolean; data: Invoice }>(
      "/admin/invoices/drafts",
      payload,
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const updateAdminDraftInvoice = async (
  id: string,
  payload: CreateInvoicePayload,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      data: Invoice;
    }>(`/admin/invoices/${id}`, payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const issueAdminInvoice = async (id: string) => {
  try {
    const { data } = await api.post<{ success: boolean; data: Invoice }>(
      `/admin/invoices/${id}/issued`,
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const unissuedAdminInvoice = async (id: string) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: Invoice;
    }>(`/admin/invoices/${id}/unissued`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const cancelAdminInvoice = async (id: string, reason: string) => {
  try {
    const { data } = await api.patch<{ success: boolean; data: Invoice }>(
      `/admin/invoices/${id}/cancel`,
      { reason },
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const getStudentInvoices = async (
  page: number = 1,
  limit: number = 10,
  status?: string,
  studentId?: string,
  classId?: string,
  academicSession?: string,
  term?: string,
  from?: string,
  to?: string,
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, page)),
      limit: String(limit),
    });

    if (status?.trim()) params.set("status", status.trim());
    if (classId?.trim()) params.set("classId", classId.trim());
    if (academicSession?.trim())
      params.set("academicSession", academicSession.trim());
    if (term?.trim()) params.set("term", term.trim());
    if (studentId?.trim()) params.set("studentId", studentId.trim());
    if (from?.trim()) params.set("from", from.trim());
    if (to?.trim()) params.set("to", to.trim());

    const { data } = await api.get<InvoiceListResponse>("/student/invoices", {
      params,
    });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const getStudentInvoiceSummary = async () => {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: {
        totalInvoices: number;
        totalBilled: number;
        totalPaid: number;
        outstandingBalance: number;
        paidInvoices: number;
        unpaidInvoices: number;
        overdueInvoices: number;
      };
    }>("/student/invoices/summary");

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const getStudentInvoice = async (id: string) => {
  try {
    const { data } = await api.get<{ success: boolean; data: Invoice }>(
      `/student/invoices/${id}`,
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const generateClassInvoice = async (payload: ClassInvoicePayload) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: {
        totalStudents: number;
        created: number;
        skipped: number;
        failed: number;
        results: Array<{
          studentId: string;
          invoiceNumber?: string | undefined;
          status: "CREATED" | "SKIPPED" | "FAILED";
          reason?: string | undefined;
        }>;
      };
    }>("/admin/invoices/generate-class", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const issueClassInvoice = async (payload: {
  classId: string;
  academicSession: string;
  term: string;
}) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: { matchedCount: number; issuedCount: number; message: string };
    }>(`/admin/invoices/issue-class`, payload);

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};

export const adminRefundStudentInvoice = async (
  id: string,
  payload: {
    reason: string;
    amount: number;
  },
) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: { refund: IRefund; message: string };
    }>(`/admin/invoices/${id}/refund`, payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
    throw error;
  }
};
