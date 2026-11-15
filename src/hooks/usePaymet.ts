import { useMutation } from "@tanstack/react-query";
import {
  studentInitializeInvoicePayment,
  studentVerifyInvoicePayment,
} from "../api/payment";
import { queryClient } from "../app/queryClient";
import { PAYMENT_KEY } from "./usePaymentHistory";

export const useStudentPaymentMutation = () => {
  return useMutation({
    mutationFn: (payload: { invoiceId: string; amount?: number }) =>
      studentInitializeInvoicePayment(payload.invoiceId, payload.amount),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: [...PAYMENT_KEY] }),
  });
};

export const useStudentVerifyPaymentMutation = () => {
  return useMutation({
    mutationFn: (payload: { reference: string }) =>
      studentVerifyInvoicePayment(payload.reference),
  });
};
