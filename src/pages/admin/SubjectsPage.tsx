import { useEffect, useMemo, useState } from "react";
import { useClassQuery } from "../../hooks/useClass";
import { useGetSubjectQuery } from "../../hooks/useSubject";
import AdminEntityDirectory, {
  type EntityDirectoryConfig,
} from "./AdminEntityDirectory";

export default function SubjectsPage() {
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [selectedEdit, setSelectedEdit] = useState<{ id?: string }>({});

  const {
    data: subjectData,
    isLoading: subjectsLoading,
    error: subjectsError,
  } = useGetSubjectQuery(page, limit, search, undefined, true);

  const {
    data: classData,
    isLoading: classesLoading,
    error: classesError,
  } = useClassQuery();

  const config = useMemo(
    () =>
      ({
        id: "subjects",
        title: "Subjects",
        singular: "subject",
        description: "Manage curriculum subjects and their publication status.",
        searchLabel: "Search subjects",
        columns: [
          { name: "name", label: "SUBJECT" },
          { name: "classId", label: "CLASS" },
          { name: "category", label: "CATEGORY" },
          { name: "status", label: "STATUS" },
          { name: "actions", label: "ACTIONS" },
        ],
        fields: [
          { name: "name", label: "Subject name" },
          {
            name: "classId",
            label: "Class",
            optionClasses: classData?.data ?? [],
          },
          {
            name: "category",
            label: "Category",
            optionCategories: ["GENERAL", "ARTS", "SCIENCE", "COMMERCIAL"],
          },
          {
            name: "order",
            label: "Display Order (In Number (1-3))",
          },
          {
            name: "description",
            label: "Description",
            helperText: "A short description of this subject.",
          },
        ],
        statuses: ["Active", "Inactive"],
        initialRecords: (subjectData?.data ?? []).map((subject) => ({
          id: subject.id,
          name: subject.name,
          order: subject.order,
          classId: subject.class.id,
          category: subject.category,
          description: subject.description,
          status: subject.isActive ? "Active" : "Inactive",
        })),
      }) satisfies EntityDirectoryConfig,
    [classData?.data, subjectData?.data],
  );

  const error = subjectsError ?? classesError;

  useEffect(() => {
    document.title = `Subjects | OpenStudy`;
  }, []);

  return (
    <AdminEntityDirectory
      paginations={{
        total: subjectData?.pagination?.total ?? 0,
        page: page,
        limit: limit,
        search: search,
        setLimit: setLimit,
        setPage: setPage,
        setSearch: setSearch,
      }}
      config={config}
      loading={subjectsLoading || classesLoading}
      error={error instanceof Error ? error.message : undefined}
      selectedEdit={selectedEdit}
      setSelectedEdit={setSelectedEdit}
    />
  );
}
