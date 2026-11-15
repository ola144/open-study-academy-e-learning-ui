import { useMutation, useQuery } from "@tanstack/react-query";
import {
  adminGetRefundDetails,
  adminGetRefunds,
  adminReconcileRefund,
} from "../api/refund";
import { queryClient } from "../app/queryClient";

export const REFUND_KEY = ["admin", "refund"];

export const useAdminReconcileRefundMutation = () => {
  return useMutation({
    mutationFn: (id: string) => adminReconcileRefund(id),
    onSuccess: (_result, id) => {
      queryClient.invalidateQueries({ queryKey: REFUND_KEY });
      queryClient.invalidateQueries({ queryKey: [...REFUND_KEY, id] });
    },
  });
};

export const useAdminGetRefundsQuery = (
  page = 1,
  limit = 10,
  status?: string,
  search?: string,
) => {
  return useQuery({
    queryKey: [...REFUND_KEY, "list", page, limit, status, search],
    queryFn: () =>
      adminGetRefunds(page, limit, status, undefined, undefined, search),
  });
};

export const useAdminGetRefundDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: [...REFUND_KEY, id],
    queryFn: () => adminGetRefundDetails(id),
    enabled: !!id,
  });
};
