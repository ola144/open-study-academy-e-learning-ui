/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import api from "../app/axios";

export interface PayrollPayload {
  teacherId: string;
  period: string;
  baseSalary: number;
  allowances?: number;
  deductions?: number;
  notes?: string;
}

export type PayrollStatus =
  | "DRAFT"
  | "APPROVED"
  | "TRANSFER_PENDING"
  | "PAID"
  | "REVERSED"
  | "FAILED"
  | "CANCELLED";
export type PayrollTransferStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "OTP_REQUIRED"
  | "SUCCESS"
  | "FAILED"
  | "REVERSED";

export interface IPayrollRecord {
  id: string;
  period: string;
  baseSalary: number;
  allowances?: number;
  deductions?: number;
  netAmount?: number;
  currency: string;
  notes?: string;
  status: PayrollStatus;
  cancellationReason?: string;
  paymentMethod?: string;
  paymentReference?: string;
  transferStatus?: PayrollTransferStatus;
  transferReference?: string;
  transferCode?: string;
  transferFailureReason?: string;
  transferInitiatedAt?: string;
  transferCompletedAt?: string;
  transferOtpResendAvailableAt?: string;
  payrollBatchId?: string | null;
  teacher?: {
    firstName: string;
    lastName: string;
    email: string;
  };
  approvedBy?: {
    firstName: string;
    lastName: string;
  };
  cancelledBy?: {
    firstName: string;
    lastName: string;
  };
  paidBy?: {
    firstName: string;
    lastName: string;
  };
  createdBy?: {
    firstName: string;
    lastName: string;
  };
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IBankAccountRecord {
  id?: string;
  teacher?: {
    id?: string;
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  bankCode: string;
  bankName: string;
  accountName: string;
  accountNumberLast4: string;
  status: string;
  createdAt: string;
}

export interface PayrollResponse {
  success: boolean;
  message?: string;
  data: {
    payrolls: IPayrollRecord[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface IPaystackBankRecord {
  name: string;
  code: string;
  active: boolean;
  country: string;
  currency: string;
}

export interface TeacherBankPayload {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
}

export interface TeacherBankRecord {
  id?: string;
  teacherId?: string;
  bankCode?: string;
  bankName?: string;
  accountNumberLast4?: string;
  accountName?: string;
  status?: "PENDING" | "VERIFIED" | "REJECTED";
  rejectionReason?: string;
  hasAccount?: boolean;
}

export const adminCreatePayroll = async (payload: PayrollPayload) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: IPayrollRecord;
    }>("/admin/teacher-payroll", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export interface PayrollFilters {
  page?: number;
  limit?: number;
  period?: string;
  status?: PayrollStatus | "";
  teacherId?: string;
}

export const adminGetPayroll = async (filters: PayrollFilters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.period) params.set("period", filters.period);
    if (filters.status) params.set("status", filters.status);
    if (filters.teacherId) params.set("teacherId", filters.teacherId);

    const query = params.toString();

    const { data } = await api.get<PayrollResponse>(
      `/admin/teacher-payroll${query ? `?${query}` : ""}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const getAdminPayrollSummary = async (period?: string) => {
  try {
    const params = new URLSearchParams();

    if (period?.trim()) params.set("period", period.trim());

    const { data } = await api.get<{
      success: boolean;
      data: {
        payrollRecords: number;
        totalDraft: number;
        totalApprovedUnpaid: number;
        totalTransferPending: number;
        totalPaid: number;
        totalReversed: number;
        totalCancelled: number;
        teachersPaid: number;
        teachersAwaitingPayment: number;
        baseSalaryTotal: number;
        allowanceTotal: number;
        deductionTotal: number;
      };
    }>(
      `/admin/teacher-payroll/summary${params.toString() ? `?${params}` : ""}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }
  }
};

export const adminGetPayrollDetails = async (id: string) => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message?: string;
      data: IPayrollRecord;
    }>(`/admin/teacher-payroll/${id}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminApprovePayroll = async (id: string) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message?: string;
      data: IPayrollRecord;
    }>(`/admin/teacher-payroll/${id}/approve`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminCancelPayroll = async (
  payload: { reason: string },
  id: string,
) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message?: string;
      data: IPayrollRecord;
    }>(`/admin/teacher-payroll/${id}/cancel`, payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminGetTeacherPendingBankAccounts = async () => {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: IBankAccountRecord[];
    }>("/admin/teacher-banking/pending-account");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminVerifyTeacherBank = async (id: string) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/teacher-banking/teacher/${id}/verify`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminRejectTeacherBank = async (id: string, reason: string) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      data: any;
    }>(`/admin/teacher-banking/teacher/${id}/reject`, { reason });

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminInitiateTeacherPayrollTransfer = async (id: string) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: {
        payrollId: string;
        reference: string;
        transferCode: string;
        transferStatus: string;
        message: string;
      };
    }>(`/admin/teacher-banking/payroll/${id}/transfer`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const finalizePayrollTransferApi = async (
  payrollId: string,
  otp: string,
) => {
  try {
    const { data } = await api.patch(
      `/admin/teacher-payroll/${payrollId}/authorize-transfer`,
      { otp },
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminResendAuthorizeOTP = async (payrollId: string) => {
  try {
    const { data } = await api.post(
      `/admin/teacher-payroll/${payrollId}/resend-otp`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const adminVerifyPendingPayrollTransfer = async (payrollId: string) => {
  try {
    const { data } = await api.post(
      `/admin/teacher-payroll/${payrollId}/verify`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

/*
  Teacher functions/medthods
*/

export const teacherCreateBankAcount = async (payload: TeacherBankPayload) => {
  try {
    const { data } = await api.post<{
      success: boolean;
      message: string;
      data: any;
    }>("/teacher/bank-account", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const teacherUpdateBankAcount = async (payload: TeacherBankPayload) => {
  try {
    const { data } = await api.patch<{
      success: boolean;
      message: string;
      data: any;
    }>("/teacher/bank-account", payload);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const getTeacherBankAcount = async () => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message: string;
      data: TeacherBankRecord;
    }>("/teacher/bank-account");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const getTeacherPayroll = async (page = 1, limit = 10) => {
  try {
    const { data } = await api.get<PayrollResponse>(
      `/teacher/payroll?page=${page}&limit=${limit}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const getTeacherPayrollDetails = async (id: string) => {
  try {
    const { data } = await api.get<{
      success: boolean;
      message?: string;
      data: IPayrollRecord;
    }>(`/teacher/payroll/${id}`);

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};

export const teacherDownloadPayslip = async (id: string) => {
  try {
    const response = await api.get<Blob>(`/teacher/payroll/${id}/payslip`, {
      responseType: "blob",
    });

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

export const listPaystackBanks = async () => {
  try {
    const { data } = await api.get<{
      success: boolean;
      data: IPaystackBankRecord[];
    }>("/admin/teacher-banking/banks");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("Error", error.response?.data);
    }

    throw error;
  }
};
