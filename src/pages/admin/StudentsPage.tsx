import { useEffect, useState } from "react";
import { useStudentsQuery } from "../../hooks/useStudent";
import AdminEntityDirectory, {
  type EntityDirectoryConfig,
} from "./AdminEntityDirectory";
import { useClassQuery } from "../../hooks/useClass";

export default function StudentsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedEdit, setSelectedEdit] = useState<{ id?: string }>({});

  const classQuery = useClassQuery();
  const classes = classQuery.data?.data;

  const {
    data: studentsData,
    isLoading,
    error,
  } = useStudentsQuery(page, limit, search);

  const config = {
    id: "students",
    title: "Students",
    singular: "student",
    description:
      "Review student accounts, class placement, and enrollment status.",
    searchLabel: "Search students",
    columns: [
      { name: "person", label: "STUDENT" },
      { name: "className", label: "CLASS" },
      { name: "joined", label: "JOINED" },
      { name: "status", label: "STATUS" },
      { name: "actions", label: "ACTIONS" },
    ],
    fields: [
      { name: "firstName", label: "First name" },
      { name: "lastName", label: "Last name" },
      { name: "email", label: "Email address" },
      { name: "className", label: "Class", optionClasses: classes },
    ],
    statuses: ["Active", "Inactive"],
    initialRecords: (studentsData?.data ?? [])?.map((student) => ({
      id: student.id,
      firstName: student.firstName ?? "",
      className: student.class?.id,
      lastName: student.lastName ?? "",
      profilePic: student.profilePic ?? "",
      email: student.email ?? "",
      joined: student.createdAt
        ? new Date(student.createdAt).toLocaleDateString("en-NG", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
          })
        : "—",
      status: student.isActive ? "Active" : "Inactive",
    })),
  } satisfies EntityDirectoryConfig;

  useEffect(() => {
    document.title = `Students | OpenStudy`;
  }, []);

  return (
    <AdminEntityDirectory
      config={config}
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      paginations={{
        page: page,
        limit: limit,
        search: search,
        total: studentsData?.pagination?.total ?? 0,
        setLimit: setLimit,
        setPage: setPage,
        setSearch: setSearch,
      }}
      selectedEdit={selectedEdit}
      setSelectedEdit={setSelectedEdit}
    />
  );
}
