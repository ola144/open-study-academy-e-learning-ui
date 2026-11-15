import axios from "axios";
import api from "../app/axios";

export const batchColors: Record<
  PayrollBatchStatus,
  "default" | "success" | "warning" | "error" | "info"
> = {
  PENDING_APPROVAL: "warning",
  APPROVED: "info",
  PROCESSING: "info",
  COMPLETED: "success",
  PARTIALLY_COMPLETED: "warning",
  FAILED: "error",
  CANCELLED: "default",
};

export type PayrollBatchStatus =
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "PROCESSING"
  | "COMPLETED"
  | "PARTIALLY_COMPLETED"
  | "FAILED"
  | "CANCELLED";

export interface BatchPayrollRecord {
  id: string;
  period: string;
  baseSalary: number;
  allowances: number;
  deductions: number;
  status: string;
  transferStatus: string;
  netAmount: number;
  notes?: string;
  paidAt?: string;
  payrollBatchId: string;
  teacher?: {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export interface IPayrollBatch {
  id: string;
  batchNumber: string;
  period: string;
  currency: string;
  payrolls?: BatchPayrollRecord[];
  totalEmployees: number;
  totalAmount: number;
  successfulCount: number;
  failedCount: number;
  pendingCount: number;
  status: PayrollBatchStatus;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  submittedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollBatchFilters {
  page?: number;
  limit?: number;
  period?: string;
  status?: PayrollBatchStatus | "";
}

export interface PayrollBatchPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PayrollBatchListResponse {
  success: boolean;
  message: string;
  data: {
    batches: IPayrollBatch[];
    pagination: PayrollBatchPagination;
  };
}

export interface PayrollBatchResponse {
  success: boolean;
  message: string;
  data: IPayrollBatch;
}

export interface PayrollBatchTransferResponse {
  success: boolean;
  message: string;
  data: {
    batchId: string;
    batchNumber: string;
    totalEmployees: number;
    totalAmount: number;
    submittedTransfers: number;
    status: PayrollBatchStatus;
    results: Array<{
      id: number;
      integration: number;
      reference: string;
      transfer_code: string;
      status: string;
      amount: number;
      currency: string;
      recipient: number;
    }>;
  };
}

export const adminGenerateBatchPayroll = async (payload: {
  period: string;
}) => {
  try {
    const { data } = await api.post<PayrollBatchResponse>(
      "/admin/teacher-payroll/batches",
      payload,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not generate payroll batch", error.response?.data);
    }

    throw error;
  }
};

export const adminApproveBatchPayroll = async (id: string) => {
  try {
    const { data } = await api.patch<PayrollBatchResponse>(
      `/admin/teacher-payroll/batches/${id}/approve`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not approve payroll batch", error.response?.data);
    }

    throw error;
  }
};

export const adminInitiateBatchPayrollTransfer = async (id: string) => {
  try {
    const { data } = await api.patch<PayrollBatchTransferResponse>(
      `/admin/teacher-payroll/batches/${id}/transfer`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not initiate batch transfers", error.response?.data);
    }

    throw error;
  }
};

export const adminReconcileBulkPayrollTransfer = async (id: string) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: {
        message: string;
        batchId: string;
        batchStatus: string;
        totalEmployees: number;
        successfulCount: number;
        failedCount: number;
        pendingCount: number;
        reconciliation: {
          checked: number;
          successful: number;
          failed: number;
          reversed: number;
          pending: number;
          skipped: number;
          errors: Array<{
            payrollId: string;
            reference?: string;
            message: string;
          }>;
        };
      };
    }>(`/admin/teacher-payroll/batches/${id}/reconcile`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not approve payroll batch", error.response?.data);
    }

    throw error;
  }
};

export const adminGetBatchPayroll = async (
  filters: PayrollBatchFilters = {},
) => {
  try {
    const params = new URLSearchParams({
      page: String(Math.max(1, filters.page ?? 1)),
      limit: String(Math.min(100, Math.max(1, filters.limit ?? 10))),
    });

    if (filters.period?.trim()) params.set("period", filters.period.trim());
    if (filters.status) params.set("status", filters.status);

    const { data } = await api.get<PayrollBatchListResponse>(
      `/admin/teacher-payroll/batches?${params.toString()}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Could not load payroll batches", error.response?.data);
    }

    throw error;
  }
};

export const adminGetBatchPayrollDetails = async (id: string) => {
  try {
    const { data } = await api.get<PayrollBatchResponse>(
      `/admin/teacher-payroll/batches/${id}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Could not load payroll batch details",
        error.response?.data,
      );
    }

    throw error;
  }
};
