import { useEffect, useMemo, useState } from "react";
import { useTeachersQuery } from "../../hooks/useTeacher";
import AdminEntityDirectory, {
  type EntityDirectoryConfig,
} from "./AdminEntityDirectory";
import { useGetSubjectQuery } from "../../hooks/useSubject";

export default function TeachersPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedEdit, setSelectedEdit] = useState(null);

  const {
    data: teacherData,
    isLoading,
    error,
  } = useTeachersQuery(page, limit, search.toLowerCase());
  const { data: subjectData } = useGetSubjectQuery(1, 1000);

  const config = useMemo(
    () =>
      ({
        id: "teachers",
        title: "Teachers",
        singular: "teacher",
        description: "Manage teaching staff and their subject assignments.",
        searchLabel: "Search teachers",
        columns: [
          { name: "person", label: "TEACHER" },
          { name: "createdAt", label: "JOINED" },
          { name: "status", label: "STATUS" },
          { name: "actions", label: "ACTIONS" },
        ],
        fields: [
          { name: "firstName", label: "First name" },
          { name: "lastName", label: "Last name" },
          { name: "email", label: "Email address" },
          {
            name: "assignedSubjects",
            label: "Subjects",
            optionSubjects: subjectData?.data,
          },
        ],
        statuses: ["Active", "Inactive"],
        initialRecords: (teacherData?.data ?? []).map((teacher) => ({
          id: teacher.id,
          firstName: teacher.firstName ?? "",
          lastName: teacher.lastName ?? "",
          email: teacher.email ?? "",
          profilePic: teacher.profilePic ?? "",
          createdAt: teacher.createdAt
            ? new Date(teacher.createdAt).toLocaleDateString("en-NG", {
                day: "2-digit",
                month: "2-digit",
                year: "2-digit",
                minute: "2-digit",
                hour: "2-digit",
              })
            : "—",
          assignedSubjects: teacher.assignedSubjectIds ?? [],
          status: teacher.isActive ? "Active" : "Inactive",
        })),
      }) satisfies EntityDirectoryConfig,
    [teacherData?.data, subjectData?.data],
  );

  useEffect(() => {
    document.title = `Teachers | OpenStudy`;
  }, []);

  return (
    <AdminEntityDirectory
      paginations={{
        total: teacherData?.pagination?.total ?? 0,
        page: page,
        limit: limit,
        search: search,
        setLimit: setLimit,
        setPage: setPage,
        setSearch: setSearch,
      }}
      config={config}
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      selectedEdit={selectedEdit}
      setSelectedEdit={setSelectedEdit}
    />
  );
}
