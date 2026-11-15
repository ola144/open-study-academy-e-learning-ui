/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from "react";
import {
  useClassQuery,
  useUpdateClassStatusMutation,
} from "../../hooks/useClass";
import AdminEntityDirectory, {
  type EntityDirectoryConfig,
} from "./AdminEntityDirectory";
import type { IClassData } from "../../api/class";
import { toast } from "react-toastify";

export default function ClassesPage() {
  const { data: classData, isLoading, error } = useClassQuery();
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [loading, setLoading] = useState({});

  const updateClassStatusMutation = useUpdateClassStatusMutation();

  const handleUpdateClassStatus = (editClass: IClassData | any) => {
    setLoading((current) => ({
      ...current,
      [editClass.id]: true,
    }));

    const payload = {
      isActive: editClass.status === "Active" ? false : true,
    };

    updateClassStatusMutation.mutate(
      { id: editClass.id, payload: payload },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Class status updated successfully!");
        },
        onError: (err: any) => {
          toast.error(err.response.data.message);
        },
        onSettled: () => {
          setLoading((current) => ({
            ...current,
            [editClass.id]: false,
          }));
        },
      },
    );
  };

  const config = useMemo(
    () =>
      ({
        id: "classes",
        title: "Classes",
        singular: "class",
        description: "Organize students and teachers into learning groups.",
        searchLabel: "Search classes",
        columns: [
          { name: "name", label: "CLASS" },
          { name: "level", label: "LEVEL" },
          { name: "status", label: "STATUS" },
          { name: "actions", label: "ACTIONS" },
        ],
        fields: [
          { name: "name", label: "Class name" },
          {
            name: "level",
            label: "Level",
            optionLevels: ["JUNIOR", "SENIOR"],
          },

          { name: "description", label: "Description" },
          { name: "order", label: "Order (1-3)" },
        ],
        statuses: ["Active", "Inactive"],
        initialRecords: (classData?.data ?? []).map((record) => ({
          id: record.id,
          name: record.name,
          level: record.level,
          description: record.description,
          status: record.isActive ? "Active" : "Inactive",
          order: record.order,
        })),
      }) satisfies EntityDirectoryConfig,
    [classData?.data],
  );

  useEffect(() => {
    document.title = `Classes | OpenStudy`;
  }, []);

  return (
    <AdminEntityDirectory
      config={config}
      loading={isLoading}
      error={error instanceof Error ? error.message : undefined}
      selectedEdit={selectedEdit}
      setSelectedEdit={setSelectedEdit}
      updateClassStatus={(editClass: IClassData | any) =>
        handleUpdateClassStatus(editClass)
      }
      isUpdatingStatus={loading}
    />
  );
}
