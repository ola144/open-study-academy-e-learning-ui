import { useMutation, useQuery } from "@tanstack/react-query";
import {
  adminApprovePayroll,
  adminCancelPayroll,
  adminCreatePayroll,
  adminGetPayroll,
  adminGetPayrollDetails,
  adminGetTeacherPendingBankAccounts,
  adminInitiateTeacherPayrollTransfer,
  adminRejectTeacherBank,
  adminResendAuthorizeOTP,
  adminVerifyPendingPayrollTransfer,
  adminVerifyTeacherBank,
  finalizePayrollTransferApi,
  getAdminPayrollSummary,
  getTeacherBankAcount,
  getTeacherPayroll,
  getTeacherPayrollDetails,
  listPaystackBanks,
  teacherCreateBankAcount,
  teacherDownloadPayslip,
  teacherUpdateBankAcount,
  type PayrollFilters,
  type PayrollPayload,
  type TeacherBankPayload,
} from "../api/payroll";
import { queryClient } from "../app/queryClient";

const PAYROLL_KEY = ["payroll"];

export const useAdminCreatePayroll = () => {
  return useMutation({
    mutationFn: (payload: PayrollPayload) => adminCreatePayroll(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

export const useGetAdminPayroll = (filters: PayrollFilters = {}) => {
  return useQuery({
    queryKey: [...PAYROLL_KEY, "admin", filters],
    queryFn: () => adminGetPayroll(filters),
    retry: false,
  });
};

export const useGetAdminPayrollDetails = (id: string) => {
  return useQuery({
    queryKey: [...PAYROLL_KEY, "admin", "detail", id],
    queryFn: () => adminGetPayrollDetails(id),
    enabled: Boolean(id),
    retry: false,
  });
};

export const useGetAdminPayrollSummary = (period?: string) => {
  return useQuery({
    queryKey: [...PAYROLL_KEY, "summary", period],
    queryFn: () => getAdminPayrollSummary(period),
  });
};

export const useAdminApprovePayroll = () => {
  return useMutation({
    mutationFn: (id: string) => adminApprovePayroll(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

export const useAdminCancelPayroll = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { reason: string };
    }) => adminCancelPayroll(payload, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

export const useGetTeacherPendingBanks = () => {
  return useQuery({
    queryKey: ["admin", "bank"],
    queryFn: adminGetTeacherPendingBankAccounts,
    retry: false,
  });
};

export const useAdminVerifyTeacherBank = () => {
  return useMutation({
    mutationFn: (id: string) => adminVerifyTeacherBank(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bank"] });
    },
  });
};

export const useAdminVerifyPendingPayrollTransfer = () => {
  return useMutation({
    mutationFn: (id: string) => adminVerifyPendingPayrollTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

export const useAdminRejectTeacherBank = () => {
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminRejectTeacherBank(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "bank"] });
    },
  });
};

export const useAdminInitiateTeacherPayrollTransfer = () => {
  return useMutation({
    mutationFn: (id: string) => adminInitiateTeacherPayrollTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

export const useAdminResendAuthorizeOTP = () => {
  return useMutation({
    mutationFn: ({ id }: { id: string }) => adminResendAuthorizeOTP(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

export const useAdminFinalizeTeacherPayrollTransfer = () => {
  return useMutation({
    mutationFn: ({ id, otp }: { id: string; otp: string }) =>
      finalizePayrollTransferApi(id, otp),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...PAYROLL_KEY, "admin"] });
    },
  });
};

/*
  TEACHER
*/

export const useGetTeacherPayroll = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: [...PAYROLL_KEY, "teacher", page, limit],
    queryFn: () => getTeacherPayroll(page, limit),
    retry: false,
  });
};

export const useGetTeacherPayrollDetails = (id: string) => {
  return useQuery({
    queryKey: [...PAYROLL_KEY, "teacher", "detail", id],
    queryFn: () => getTeacherPayrollDetails(id),
    enabled: Boolean(id),
    retry: false,
  });
};

export const useDownloadTeacherPayslip = () => {
  return useMutation({
    mutationFn: (id: string) => teacherDownloadPayslip(id),
  });
};

export const useTeacherCreateBankAccount = () => {
  return useMutation({
    mutationFn: (payload: TeacherBankPayload) =>
      teacherCreateBankAcount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "bank"] });
    },
  });
};

export const useTeacherUpdateBankAccount = () => {
  return useMutation({
    mutationFn: (payload: TeacherBankPayload) =>
      teacherUpdateBankAcount(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher", "bank"] });
    },
  });
};

export const useGetTeacherBankAccount = () => {
  return useQuery({
    queryKey: ["teacher", "bank"],
    queryFn: getTeacherBankAcount,
    retry: false,
  });
};

export const useGetPaystackBanks = () => {
  return useQuery({
    queryKey: ["paystack", "bank"],
    queryFn: listPaystackBanks,
    retry: false,
  });
};
