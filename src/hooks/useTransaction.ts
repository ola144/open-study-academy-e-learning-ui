import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getTransactionDetails,
  getTransactions,
  getTransactionSummary,
  markTransactionAsReviewed,
} from "../api/transaction";
import { queryClient } from "../app/queryClient";

const TRANSACTION_KEY = ["transaction"];

export const useTransactionsQuery = (
  page: number = 1,
  limit: number = 10,
  status?: string,
  provider?: string,
  reference?: string,
  studentId?: string,
  from?: string,
  to?: string,
) => {
  return useQuery({
    queryKey: [
      ...TRANSACTION_KEY,
      page,
      limit,
      status,
      provider,
      reference,
      studentId,
      from,
      to,
    ],
    queryFn: () =>
      getTransactions(
        page,
        limit,
        status,
        provider,
        reference,
        studentId,
        from,
        to,
      ),
    retry: false,
  });
};

export const useTransactionDetailQuery = (id: string) => {
  return useQuery({
    queryKey: [...TRANSACTION_KEY, id],
    queryFn: () => getTransactionDetails(id),
    enabled: !!id,
    retry: false,
  });
};

export const useTransactionSummary = (from?: string, to?: string) => {
  return useQuery({
    queryKey: [...TRANSACTION_KEY, "summary", from, to],
    queryFn: () => getTransactionSummary(from, to),
    retry: false,
  });
};

export const useMarkAsReviewedMutation = () => {
  return useMutation({
    mutationFn: ({ id, reviewNote }: { id: string; reviewNote: string }) =>
      markTransactionAsReviewed(id, reviewNote),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: TRANSACTION_KEY }),
  });
};
