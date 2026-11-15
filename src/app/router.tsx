/* eslint-disable react-refresh/only-export-components */
import { createBrowserRouter, Navigate } from "react-router-dom";
const PublicLayout = lazy(() => import("../layouts/PublicLayout"));
const StudentLayout = lazy(() => import("../layouts/StudentLayout"));
const TeacherLayout = lazy(() => import("../layouts/TeacherLayout"));

import { lazy } from "react";

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
import { ProtectedRoute } from "../routes/protect/protectRoute";
import RouterLayout from "../components/RouterLayout";
const AdminInvoiceDetailsPage = lazy(
  () => import("../pages/admin/AdminInvoiceDetailsPage"),
);
const PaymentCallback = lazy(() => import("../pages/paystack/PaymentCallback"));
const StudentInvoiceDetailsPage = lazy(
  () => import("../pages/student/StudentInvoiceDetailsPage"),
);

const AdminDashboard = lazy(() => import("../pages/admin/AdminDashboard"));
const ClassesPage = lazy(() => import("../pages/admin/ClassesPage"));
const AdminStudentDetailsPage = lazy(
  () => import("../pages/admin/StudentDetailsPage"),
);
const AdminSubjectDetailsPage = lazy(
  () => import("../pages/admin/SubjectDetailsPage"),
);
const AdminTeacherDetailsPage = lazy(
  () => import("../pages/admin/TeacherDetailsPage"),
);
const AdminTopicsPage = lazy(() => import("../pages/admin/TopicsPage"));
const AdminTopicDetailsPage = lazy(
  () => import("../pages/admin/TopicDetailsPage"),
);
const AdminLessonsPage = lazy(() => import("../pages/admin/LessonsPage"));
const AdminLessonDetailsPage = lazy(
  () => import("../pages/admin/LessonDetailsPage"),
);
const StudentsPage = lazy(() => import("../pages/admin/StudentsPage"));
const SubjectsPage = lazy(() => import("../pages/admin/SubjectsPage"));
const TeachersPage = lazy(() => import("../pages/admin/TeachersPage"));

const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const VerifyEmailPage = lazy(() => import("../pages/auth/VerifyEmailPage"));
const CreatePasswordPage = lazy(
  () => import("../pages/auth/CreatePasswordPage"),
);

const StudentDashboard = lazy(
  () => import("../pages/student/StudentDashboard"),
);
const EvaluationPage = lazy(() => import("../pages/student/EvaluationPage"));
const ProfilePage = lazy(() => import("../pages/student/ProfilePage"));
const ProgressPage = lazy(() => import("../pages/student/ProgressPage"));
const StudentSubjectsPage = lazy(() => import("../pages/student/SubjectsPage"));
const SubjectDetailsPage = lazy(
  () => import("../pages/student/SubjectDetailsPage"),
);
const TopicDetailsPage = lazy(
  () => import("../pages/student/TopicDetailsPage"),
);

const TeacherDashboard = lazy(
  () => import("../pages/teacher/TeacherDashboard"),
);
const EvaluationsPage = lazy(() => import("../pages/teacher/EvaluationsPage"));
const QuestionsPage = lazy(() => import("../pages/teacher/QuestionsPage"));
const TeacherSubjectsPage = lazy(() => import("../pages/teacher/SubjectsPage"));
const TopicsPage = lazy(() => import("../pages/teacher/TopicsPage"));
const TeacherStudentProgressPage = lazy(
  () => import("../pages/teacher/StudentProgressPage"),
);
const SchedulePage = lazy(() => import("../pages/shared/SchedulePage"));
const InvoicesPage = lazy(() => import("../pages/admin/InvoicesPage"));
const TransactionsPage = lazy(() => import("../pages/admin/TransactionsPage"));
const AdminPayrollPage = lazy(() => import("../pages/admin/PayrollPage"));
const TeacherPayrollPage = lazy(() => import("../pages/teacher/PayrollPage"));
const StudentInvoicesPage = lazy(() => import("../pages/student/InvoicesPage"));

const Settings = lazy(() => import("../pages/admin/Settings"));
const AdminProfile = lazy(() => import("../components/AdminProfile"));

export const router = createBrowserRouter([
  {
    element: <RouterLayout />,
    children: [
      {
        path: "/",
        element: <PublicLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/login" replace />,
          },
          {
            path: "login",
            element: <LoginPage />,
          },
          {
            path: "signup",
            element: <SignupPage />,
          },
          {
            path: "verify-email/:token",
            element: <VerifyEmailPage />,
          },
          {
            path: "create-password/*",
            element: <CreatePasswordPage />,
          },
          { path: "*", element: <Navigate to="/login" replace /> },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["ADMIN"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminLayout />,
            children: [
              { index: true, element: <AdminDashboard /> },
              { path: "teachers", element: <TeachersPage /> },
              {
                path: "teachers/:teacherId",
                element: <AdminTeacherDetailsPage />,
              },
              { path: "students", element: <StudentsPage /> },
              {
                path: "students/:studentId",
                element: <AdminStudentDetailsPage />,
              },
              {
                path: "students/:studentId/progress",
                element: <TeacherStudentProgressPage />,
              },
              { path: "classes", element: <ClassesPage /> },
              { path: "invoices", element: <InvoicesPage /> },
              {
                path: "invoices/:invoiceId",
                element: <AdminInvoiceDetailsPage />,
              },
              { path: "transactions", element: <TransactionsPage /> },
              { path: "payroll", element: <AdminPayrollPage /> },
              { path: "schedule", element: <SchedulePage /> },
              { path: "subjects", element: <SubjectsPage /> },
              {
                path: "subjects/:subjectId",
                element: <AdminSubjectDetailsPage />,
              },
              { path: "topics", element: <AdminTopicsPage /> },
              {
                path: "topics/:topicId/lessons",
                element: <AdminLessonsPage />,
              },
              {
                path: "topics/:topicId/lessons/:lessonId",
                element: <AdminLessonDetailsPage />,
              },
              { path: "topics/:topicId", element: <AdminTopicDetailsPage /> },
              { path: "settings", element: <Settings /> },
              { path: "*", element: <Navigate to="/admin" replace /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["TEACHER"]} />,
        children: [
          {
            path: "/teacher",
            element: <TeacherLayout />,
            children: [
              { index: true, element: <TeacherDashboard /> },
              { path: "subjects", element: <TeacherSubjectsPage /> },
              { path: "topics", element: <TopicsPage /> },
              { path: "topics/:topicId", element: <AdminTopicDetailsPage /> },
              {
                path: "topics/:topicId/lessons",
                element: <AdminLessonsPage />,
              },
              {
                path: "topics/:topicId/lessons/:lessonId",
                element: <AdminLessonDetailsPage />,
              },
              { path: "evaluations", element: <EvaluationsPage /> },
              { path: "questions", element: <QuestionsPage /> },
              { path: "students", element: <StudentsPage /> },
              { path: "payroll", element: <TeacherPayrollPage /> },
              { path: "schedule", element: <SchedulePage /> },
              {
                path: "students/:studentId/progress",
                element: <TeacherStudentProgressPage />,
              },
              {
                path: "students/:studentId",
                element: <AdminStudentDetailsPage />,
              },
              { path: "profile", element: <AdminProfile /> },
              { path: "*", element: <Navigate to="/teacher" replace /> },
            ],
          },
        ],
      },
      {
        element: <ProtectedRoute allowedRoles={["STUDENT"]} />,
        children: [
          {
            path: "/student",
            element: <StudentLayout />,
            children: [
              { index: true, element: <StudentDashboard /> },
              { path: "subjects", element: <StudentSubjectsPage /> },
              { path: "subjects/:subjectId", element: <SubjectDetailsPage /> },
              { path: "topics/:topicId", element: <TopicDetailsPage /> },
              { path: "evaluations", element: <EvaluationPage /> },
              {
                path: "evaluations/:evaluationId",
                element: <EvaluationPage />,
              },
              { path: "progress", element: <ProgressPage /> },
              { path: "schedule", element: <SchedulePage /> },
              { path: "invoices", element: <StudentInvoicesPage /> },
              {
                path: "invoices/:invoiceId",
                element: <StudentInvoiceDetailsPage />,
              },
              { path: "profile", element: <ProfilePage /> },
              { path: "payment/callback", element: <PaymentCallback /> },
              { path: "*", element: <Navigate to="/student" replace /> },
            ],
          },
        ],
      },
    ],
  },
]);
