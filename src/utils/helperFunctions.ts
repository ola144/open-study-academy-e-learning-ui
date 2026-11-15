import type { Invoice } from "../api/invoice";
import type { ITransaction } from "../api/transaction";

export const formatDateAndTime = (date: string | undefined | null) => {
  return date ? new Date(date).toLocaleString() : "Not Available";
};

export const txId = (transaction: ITransaction) => transaction.id;

export const personName = (transaction: ITransaction) => {
  const student = transaction.student;

  return student
    ? `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim() ||
        student.email ||
        "Unknown student"
    : "Unknown student";
};

export const naira = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount / 100);

export const amountInKobo = (amount: number) => {
  return Math.round(Number(amount) * 100);
};

export const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 17) {
    return "Good afternoon";
  }

  return "Good evening";
};

export const initials = (name: string | undefined) => {
  return name
    ?.split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

export const errorMessage = (error: unknown) =>
  (error as { response?: { data?: { message?: string } } })?.response?.data
    ?.message ?? (error instanceof Error ? error.message : "Request failed.");

export const getRemainingSeconds = (date: string | null) => {
  if (!date) return 0;

  return Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 1000));
};

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remaining = seconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(
    2,
    "0",
  )}`;
};

export const studentName = (student: Invoice["student"] | undefined) =>
  typeof student === "object"
    ? `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim()
    : "Student";
