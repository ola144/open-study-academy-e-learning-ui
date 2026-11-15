import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboard,
  getAdminDashboardErrolmentActivity,
  getStudentDashboard,
  getTeacherDashboard,
  type EnrollmentPeriod,
} from "../api/dashboard";
import { useSchoolInfoQuery } from "./useSchoolInfo";

const DASHBOARD_KEY = ["dashboard"];

export const useStudentDashboardQuery = () => {
  const { data: schoolInfo } = useSchoolInfoQuery();
  const term = schoolInfo?.data?.term;

  return useQuery({
    queryKey: [...DASHBOARD_KEY, "student"],
    queryFn: () => {
      if (!term) throw new Error("School term is not available");
      return getStudentDashboard(term);
    },
    enabled: Boolean(term),
    retry: false,
  });
};

export const useAdminDashboardQuery = () => {
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "admin"],
    queryFn: getAdminDashboard,
    retry: false,
  });
};

export const useAdminDashboardEnrollmentActivityQuery = (
  period: EnrollmentPeriod,
) => {
  return useQuery({
    queryKey: ["student-enrollment", period],
    queryFn: () => getAdminDashboardErrolmentActivity(period),
  });
};

export const useTeacherDashboardQuery = () => {
  const { data: schoolInfo } = useSchoolInfoQuery();
  const term = schoolInfo?.data?.term;
  return useQuery({
    queryKey: [...DASHBOARD_KEY, "teacher"],
    queryFn: () => {
      if (!term) throw new Error("School term is not available");
      return getTeacherDashboard(term);
    },
    enabled: Boolean(term),
    retry: false,
  });
};
