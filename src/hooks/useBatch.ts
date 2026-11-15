import { useMutation, useQuery } from "@tanstack/react-query";
import {
  adminApproveBatchPayroll,
  adminGenerateBatchPayroll,
  adminGetBatchPayroll,
  adminGetBatchPayrollDetails,
  adminInitiateBatchPayrollTransfer,
  adminReconcileBulkPayrollTransfer,
  type PayrollBatchFilters,
} from "../api/batch";
import { queryClient } from "../app/queryClient";

export const BATCH_KEY = ["admin", "batch"];

const invalidateBatchPayroll = () =>
  Promise.all([
    queryClient.invalidateQueries({ queryKey: BATCH_KEY }),
    queryClient.invalidateQueries({ queryKey: ["payroll", "admin"] }),
  ]);

export const useAdminGenerateBatchPayrollMutation = () => {
  return useMutation({
    mutationFn: (payload: { period: string }) =>
      adminGenerateBatchPayroll(payload),
    onSuccess: invalidateBatchPayroll,
  });
};

export const useAdminApproveBatchPayrollMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adminApproveBatchPayroll(id),
    onSuccess: invalidateBatchPayroll,
  });
};

export const useAdminInitiateBatchPayrollMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adminInitiateBatchPayrollTransfer(id),
    onSuccess: invalidateBatchPayroll,
  });
};

export const useAdminReconcileBatchPayrollTransferMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adminReconcileBulkPayrollTransfer(id),
    onSuccess: invalidateBatchPayroll,
  });
};

export const useAdminGetBatchPayroll = (filters: PayrollBatchFilters = {}) => {
  return useQuery({
    queryKey: [...BATCH_KEY, filters],
    queryFn: () => adminGetBatchPayroll(filters),
    retry: false,
  });
};

export const useGetAdminPayrollBatchDetails = (id: string) => {
  return useQuery({
    queryKey: [...BATCH_KEY, "detail", id],
    queryFn: () => adminGetBatchPayrollDetails(id),
    enabled: Boolean(id),
    retry: false,
  });
};
