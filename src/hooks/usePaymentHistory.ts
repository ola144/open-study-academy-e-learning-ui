import { useQuery } from "@tanstack/react-query";
import {
  downloadPaymentReceipt,
  getPaymentHistoryDetails,
  getStudentPaymentHistory,
} from "../api/paymentHistory";

export const PAYMENT_KEY = ["payment", "history"];

export const usePaymentHistoryQuery = (
  page: number = 1,
  limit: number = 10,
  status?: string,
) => {
  return useQuery({
    queryKey: [...PAYMENT_KEY, page, limit, status],
    queryFn: () => getStudentPaymentHistory(page, limit, status),
    retry: false,
  });
};

export const usePaymentHistoryDetailsQuery = (id: string) => {
  return useQuery({
    queryKey: [...PAYMENT_KEY],
    queryFn: () => getPaymentHistoryDetails(id),
    enabled: !!id,
    retry: false,
  });
};

export const useDownloadPaymentReceipt = (id: string) => {
  return useQuery({
    queryKey: [...PAYMENT_KEY],
    queryFn: () => downloadPaymentReceipt(id),
  });
};
