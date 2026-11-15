/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  adminRefundStudentInvoice,
  cancelAdminInvoice,
  createAdminDraftInvoice,
  createAdminInvoice,
  generateClassInvoice,
  getAdminInvoiceDetails,
  getAdminInvoices,
  getStudentInvoice,
  getStudentInvoices,
  getStudentInvoiceSummary,
  issueAdminInvoice,
  issueClassInvoice,
  unissuedAdminInvoice,
  updateAdminDraftInvoice,
  type ClassInvoicePayload,
  type CreateInvoicePayload,
} from "../api/invoice";
import { queryClient } from "../app/queryClient";

export const useGetStudentInvoiceSummaryQuery = () => {
  return useQuery({
    queryKey: ["student-invoice-summary"],
    queryFn: getStudentInvoiceSummary,
  });
};

export const useGetStudentInvoiceQuery = (
  page: number = 1,
  limit: number = 10,
  status: any,
  studentId?: string,
  classId?: string,
  academicSession?: string,
  term?: string,
  from?: string,
  to?: string,
) => {
  return useQuery({
    queryKey: [
      "student-invoices",
      page,
      limit,
      status,
      studentId,
      classId,
      academicSession,
      term,
      from,
      to,
    ],
    queryFn: () =>
      getStudentInvoices(
        page,
        limit,
        status,
        studentId,
        classId,
        academicSession,
        term,
        from,
        to,
      ),
  });
};

export const useGetStudentInvoiceDetailQuery = (selectedId: string) => {
  return useQuery({
    queryKey: ["student-invoice", selectedId],
    queryFn: () => getStudentInvoice(selectedId),
    enabled: !!selectedId,
  });
};

export const useGetAdminInvoiceQuery = (
  page: number = 1,
  limit: number = 10,
  status: string,
  studentId?: string,
  classId?: string,
  academicSession?: string,
  term?: string,
  from?: string,
  to?: string,
) => {
  return useQuery({
    queryKey: [
      "admin-invoices",
      page,
      limit,
      status,
      studentId,
      classId,
      academicSession,
      term,
      from,
      to,
    ],
    queryFn: () =>
      getAdminInvoices(
        page,
        limit,
        status,
        studentId,
        classId,
        academicSession,
        term,
        from,
        to,
      ),
  });
};

export const useGetAdminInvoiceDetailQuery = (selectedId: string) => {
  return useQuery({
    queryKey: ["admin-invoice", selectedId],
    queryFn: () => getAdminInvoiceDetails(selectedId),
    enabled: !!selectedId,
  });
};

export const useCreateInvoiceMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => createAdminInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useCreateDraftInvoiceMutation = () => {
  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) =>
      createAdminDraftInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useUpdateDraftInvoiceMutation = () => {
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: CreateInvoicePayload;
    }) => updateAdminDraftInvoice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useIssueInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => issueAdminInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useUnissuedInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) => unissuedAdminInvoice(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useCancelInvoiceMutation = () => {
  return useMutation({
    mutationFn: (id: string) =>
      cancelAdminInvoice(id, "Cancelled by administrator"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useGenerateClassInvoiceMutation = () => {
  return useMutation({
    mutationFn: (payload: ClassInvoicePayload) => generateClassInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useIssueClassInvoiceMutation = () => {
  return useMutation({
    mutationFn: (payload: {
      classId: string;
      academicSession: string;
      term: string;
    }) => issueClassInvoice(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
    },
  });
};

export const useRefundInvoiceMutation = () => {
  return useMutation({
    mutationFn: ({
      payload,
      id,
    }: {
      payload: {
        reason: string;
        amount: number;
      };
      id: string;
    }) => adminRefundStudentInvoice(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-invoices"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "refund"] });
    },
  });
};
