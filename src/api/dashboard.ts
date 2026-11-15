import axios from "axios";
import api from "../app/axios";
import type { IUser } from "./auth";
import type { IEvaluationRecord } from "./evaluation";

export type EnrollmentPeriod = "weekly" | "twoWeeks" | "monthly" | "twoMonths";

interface EnrollmentActivity {
  date: string;
  value: number;
}

export interface EnrollmentResponse {
  data: {
    period: EnrollmentPeriod;
    groupBy: "day" | "week";
    data: Array<EnrollmentActivity>;
    totalEnrollments: number;
  };
}

export interface IStudentDashboard {
  summary: {
    totalSubjects: number;
    totalTopics: number;
    completedTopics: number;
    learningStreak: number;
  };
  subjects: Array<{
    id: string;
    name: string;
    totalTopics: number;
    completedTopics: number;
    progress: number;
  }>;
  recentLearning: Array<{
    id: string;
    title: string;
    subject: { name: string; id: string };
    slug: string;
    updatedAt: string;
    completedAt: string;
  }>;
  availableEvaluation: Array<IEvaluationRecord>;
}

export interface IAdminDashboard {
  summary: {
    student: {
      totalStudents: number;
      studentDifference: number;
      studentPercentageChange: number;
      studentWeeklyPercentageChange: number;
      weeklyTrend: string;
      trend: string;
    };
    teacher: {
      totalTeachers: number;
      activeTeachers: number;
      teachersJoinedThisMonth: number;
    };
    class: {
      totalClasses: number;
      totalClassLevel: number;
      averageClassSize: number;
    };
    subject: {
      totalSubjects: number;
      activeSubjects: number;
    };
    lesson: {
      publishedLesson: number;
      draftLesson: number;
    };
  };
  entrollmentActivity: Array<{ day: string; value: number }>;
  recentStudents: Array<IUser>;
}

export interface ITeacherDashboard {
  teacher: {
    id: string;
    name: string;
  };
  summary: {
    totalStudents: number;
    totalSubjects: number;
    totalClasses: number;
    totalEvaluations: number;
    submissionsToReview: number;
  };
  classProgress: Array<{
    classId: string;
    className: string;
    level: string;
    studentCount: number;
    progressPercentage: number;
  }>;
  studentsToCheckIn: Array<{
    studentId: string;
    name: string;
    email: string;
    className: string;
    lastActivityAt: null;
    daysSinceActivity: null;
    reasons: ["No recent learning activity"];
  }>;
  pendingReviews: Array<{
    attemptId: string;
    student: {
      id: string;
      name: string;
      email: string;
    } | null;
    evaluation: {
      id: string;
      title: string;
    } | null;
    submittedAt: string | null;
  }>;
}

export interface IStudentDashboardResponse {
  success: boolean;
  message?: string;
  data?: IStudentDashboard;
}

export interface IAdminDashboardResponse {
  success: boolean;
  message?: string;
  data?: IAdminDashboard;
}

export interface ITeacherDashboardResponse {
  success: boolean;
  message?: string;
  data?: ITeacherDashboard;
}

export const getStudentDashboard = async (
  term: string,
): Promise<IStudentDashboardResponse> => {
  try {
    const parms = new URLSearchParams({});

    parms.set("term", term);

    const { data } = await api.get<IStudentDashboardResponse>(
      `/dashboard/student?${parms}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};

export const getAdminDashboard = async (): Promise<IAdminDashboardResponse> => {
  try {
    const { data } = await api.get<IAdminDashboardResponse>("/dashboard/admin");

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};

export const getAdminDashboardErrolmentActivity = async (
  period: EnrollmentPeriod,
) => {
  try {
    const { data } = await api.get<EnrollmentResponse>(
      `/dashboard/admin/enrollment-activity`,
      {
        params: { period },
      },
    );

    return data.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};

export const getTeacherDashboard = async (
  term: string,
): Promise<ITeacherDashboardResponse> => {
  try {
    const parms = new URLSearchParams({});

    parms.set("term", term);

    const { data } = await api.get<ITeacherDashboardResponse>(
      `/dashboard/teacher?${parms}`,
    );

    return data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Status:", error.response?.data);
    }
    throw error;
  }
};
