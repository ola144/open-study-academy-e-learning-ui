import { useEffect, useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  AddOutlined,
  CalendarMonthOutlined,
  EditOutlined,
  EventAvailableOutlined,
  EventBusyOutlined,
  ScheduleOutlined,
} from "@mui/icons-material";
import { useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useGetAllSchedules,
  useGetAllStudentSchedules,
  useGetAllTeacherSchedules,
  useCreateScheduleMutation,
  useUpdateScheduleMutation,
} from "../../hooks/useSchedule";
import type { ISchedulePayload, IScheduleRecord } from "../../api/schedule";
import { useClassQuery } from "../../hooks/useClass";
import { useTeachersQuery } from "../../hooks/useTeacher";
import { useGetSubjectQuery } from "../../hooks/useSubject";
import { useTopicsQuery } from "../../hooks/useTopic";
import type { ITeacherPayload } from "../../api/teacher";
import type { IClassData } from "../../api/class";
import type { ISubjectRecord } from "../../api/subject";
import type { ITopicRecord } from "../../api/topic";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";

type ScheduleStatusFilter = "ALL" | "SCHEDULED" | "COMPLETED" | "CANCELLED";

interface ScheduleDraft {
  title: string;
  teacherId: string;
  classId: string;
  subjectId: string;
  topicId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes: string;
}

const EMPTY_DRAFT: ScheduleDraft = {
  title: "",
  teacherId: "",
  classId: "",
  subjectId: "",
  topicId: "",
  date: "",
  startTime: "",
  endTime: "",
  notes: "",
};

const messageFromError = (error: unknown, fallback: string) => {
  if (
    axios.isAxiosError<{ message?: string }>(error) &&
    typeof error.response?.data?.message === "string"
  ) {
    return error.response.data.message;
  }
  return error instanceof Error ? error.message : fallback;
};

const formatDate = (value: string) => {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Date unavailable";
  return new Intl.DateTimeFormat(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

const displayTime = (value: string) => {
  const [hour, minute] = value.split(":").map(Number);
  if (!Number.isFinite(hour) || !Number.isFinite(minute)) return value;
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(2000, 0, 1, hour, minute));
};

const scheduleDateInput = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
};

const getTeacherName = (teacher?: IScheduleRecord["teacher"]) =>
  teacher
    ? [teacher.firstName, teacher.lastName].filter(Boolean).join(" ")
    : "Teacher not available";

const ScheduleEditorDialog = ({
  open,
  onClose,
  schedule,
}: {
  open: boolean;
  onClose: () => void;
  schedule: IScheduleRecord | null;
}) => {
  const [draft, setDraft] = useState<ScheduleDraft>(
    schedule
      ? {
          title: schedule.title,
          teacherId: schedule.teacher?.id ?? "",
          classId: schedule.class?.id ?? "",
          subjectId: schedule.subject?.id ?? "",
          topicId: schedule.topic?.id ?? "",
          date: scheduleDateInput(schedule.date),
          startTime: schedule.startTime,
          endTime: schedule.endTime,
          notes: schedule.notes ?? "",
        }
      : EMPTY_DRAFT,
  );

  const createMutation = useCreateScheduleMutation();
  const updateMutation = useUpdateScheduleMutation();

  const classesQuery = useClassQuery();
  const teachersQuery = useTeachersQuery(1, 1000);
  const subjectsQuery = useGetSubjectQuery(1, 1000);
  const schoolInfoQuery = useSchoolInfoQuery();
  const info = schoolInfoQuery.data?.data;
  const topicsQuery = useTopicsQuery(
    1,
    1000,
    undefined,
    draft.subjectId || undefined,
    undefined,
    false,
    info?.term,
  );
  const classes = classesQuery.data?.data ?? [];
  const teachers = teachersQuery.data?.data ?? [];
  const allSubjects = (subjectsQuery.data?.data ?? []).filter(
    (subject) => subject.class.id === draft.classId,
  );
  const selectedTeacher = teachers.find(
    (teacher) => teacher.id === draft.teacherId,
  );
  const subjects = selectedTeacher?.assignedSubjectIds
    ? allSubjects.filter((subject) =>
        selectedTeacher.assignedSubjectIds?.includes(subject.id ?? ""),
      )
    : allSubjects;
  const topics = (topicsQuery.data?.data ?? []).filter(
    (topic) => topic.classId === draft.classId,
  );
  const loadingOptions =
    classesQuery.isLoading ||
    teachersQuery.isLoading ||
    subjectsQuery.isLoading;
  const saving = createMutation.isPending || updateMutation.isPending;
  const busy = saving || loadingOptions;
  const saveError = createMutation.error ?? updateMutation.error;
  const lookupError =
    classesQuery.error ?? teachersQuery.error ?? subjectsQuery.error;

  const updateField = <K extends keyof ScheduleDraft>(
    field: K,
    value: ScheduleDraft[K],
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === "classId" ? { subjectId: "", topicId: "" } : {}),
      ...(field === "subjectId" ? { topicId: "" } : {}),
      ...(field === "teacherId" ? { subjectId: "", topicId: "" } : {}),
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const payload: ISchedulePayload = {
      title: draft.title.trim(),
      teacherId: draft.teacherId,
      classId: draft.classId,
      subjectId: draft.subjectId,
      ...(draft.topicId ? { topicId: draft.topicId } : {}),
      date: draft.date,
      startTime: draft.startTime,
      endTime: draft.endTime,
      notes: draft.notes.trim(),
    };

    const callbacks = {
      onSuccess: (response: { message: string }) => {
        toast.success(response.message);
        onClose();
      },
      onError: (error: unknown) => {
        toast.error(messageFromError(error, "Unable to save the schedule."));
      },
    };

    if (schedule) {
      updateMutation.mutate({ payload, id: schedule.id }, callbacks);
    } else {
      createMutation.mutate(payload, callbacks);
    }
  };

  const teacherOptions: ITeacherPayload[] = teachers;
  const classOptions: IClassData[] = classes;
  const subjectOptions: ISubjectRecord[] = subjects;
  const topicOptions: ITopicRecord[] = topics;

  return (
    <Dialog
      open={open}
      onClose={busy ? undefined : onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="schedule-dialog-title"
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle id="schedule-dialog-title">
          {schedule ? "Update schedule" : "Create schedule"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2.5} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Add lesson details, assign the teaching team and choose when it
              takes place.
            </Typography>
            {lookupError && (
              <Alert severity="error">
                {messageFromError(
                  lookupError,
                  "Some schedule options could not be loaded.",
                )}
                {!loadingOptions &&
                  !lookupError &&
                  (teachers.length === 0 ||
                    classes.length === 0 ||
                    subjectsQuery.data?.data?.length === 0) && (
                    <Alert severity="warning">
                      Add an active teacher, class, and subject before creating
                      a schedule.
                    </Alert>
                  )}
              </Alert>
            )}
            {saveError && (
              <Alert severity="error">
                {messageFromError(saveError, "Unable to save the schedule.")}
              </Alert>
            )}
            <TextField
              label="Schedule title"
              value={draft.title}
              onChange={(event) => updateField("title", event.target.value)}
              required
              fullWidth
              disabled={busy}
              slotProps={{ htmlInput: { maxLength: 120 } }}
            />
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(2, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                select
                label="Teacher"
                value={draft.teacherId}
                onChange={(event) =>
                  updateField("teacherId", event.target.value)
                }
                required
                fullWidth
                disabled={busy}
              >
                {teacherOptions.map((teacher) => (
                  <MenuItem key={teacher.id} value={teacher.id ?? ""}>
                    {teacher.firstName} {teacher.lastName}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Class"
                value={draft.classId}
                onChange={(event) => updateField("classId", event.target.value)}
                required
                fullWidth
                disabled={busy}
              >
                {classOptions.map((classItem) => (
                  <MenuItem key={classItem.id} value={classItem.id}>
                    {classItem.name}
                    {classItem.level ? ` · ${classItem.level}` : ""}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Subject"
                value={draft.subjectId}
                onChange={(event) =>
                  updateField("subjectId", event.target.value)
                }
                required
                fullWidth
                disabled={busy || !draft.classId}
                helperText={
                  draft.classId && subjects.length === 0
                    ? "No active subjects found for this class."
                    : undefined
                }
              >
                {subjectOptions.map((subject) => (
                  <MenuItem key={subject.id} value={subject.id ?? ""}>
                    {subject.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Topic (optional)"
                value={draft.topicId}
                onChange={(event) => updateField("topicId", event.target.value)}
                fullWidth
                disabled={busy || !draft.subjectId || topicsQuery.isLoading}
              >
                <MenuItem value="">No specific topic</MenuItem>
                {topicOptions.map((topic) => (
                  <MenuItem key={topic.id} value={topic.id ?? ""}>
                    {topic.title}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            {topicsQuery.isError && (
              <Alert severity="error">
                {messageFromError(
                  topicsQuery.error,
                  "Topics could not be loaded.",
                )}
              </Alert>
            )}
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "minmax(0, 1fr)",
                  sm: "repeat(3, minmax(0, 1fr))",
                },
                gap: 2,
              }}
            >
              <TextField
                label="Date"
                type="date"
                value={draft.date}
                onChange={(event) => updateField("date", event.target.value)}
                required
                fullWidth
                disabled={busy}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="Start time"
                type="time"
                value={draft.startTime}
                onChange={(event) =>
                  updateField("startTime", event.target.value)
                }
                required
                fullWidth
                disabled={busy}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                label="End time"
                type="time"
                value={draft.endTime}
                onChange={(event) => updateField("endTime", event.target.value)}
                required
                fullWidth
                disabled={busy}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <TextField
              label="Notes (optional)"
              value={draft.notes}
              onChange={(event) => updateField("notes", event.target.value)}
              fullWidth
              multiline
              minRows={3}
              disabled={busy}
              slotProps={{ htmlInput: { maxLength: 1000 } }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button type="button" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={
              busy ? (
                <CircularProgress size={17} color="inherit" />
              ) : schedule ? (
                <EditOutlined />
              ) : (
                <AddOutlined />
              )
            }
            disabled={busy || Boolean(lookupError)}
          >
            {loadingOptions
              ? "Loading options…"
              : saving
                ? "Saving…"
                : schedule
                  ? "Save changes"
                  : "Create schedule"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

const SchedulePage = () => {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith("/admin");
  const isTeacher = pathname.startsWith("/teacher");
  const isStudent = pathname.startsWith("/student");
  const schedulesQuery = useGetAllSchedules(isAdmin);
  const teacherSchedulesQuery = useGetAllTeacherSchedules(isTeacher);
  const studentSchedulesQuery = useGetAllStudentSchedules(
    !isAdmin && !isTeacher,
  );
  const [statusFilter, setStatusFilter] = useState<ScheduleStatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] =
    useState<IScheduleRecord | null>(null);
  const query = isAdmin
    ? schedulesQuery
    : isTeacher
      ? teacherSchedulesQuery
      : studentSchedulesQuery;

  const schedules = useMemo(() => query.data?.data ?? [], [query.data?.data]);

  const title = isAdmin
    ? "School schedule"
    : isTeacher
      ? "Teaching schedule"
      : "Class schedule";

  const visibleSchedules = useMemo(() => {
    const searchTerm = search.trim().toLocaleLowerCase();
    return schedules.filter((schedule) => {
      const matchesStatus =
        statusFilter === "ALL" || schedule.status === statusFilter;
      const haystack = [
        schedule.title,
        schedule.class?.name,
        schedule.subject?.name,
        schedule.topic?.title,
        getTeacherName(schedule.teacher),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase();
      return matchesStatus && (!searchTerm || haystack.includes(searchTerm));
    });
  }, [schedules, statusFilter, search]);

  const openCreateDialog = () => {
    setSelectedSchedule(null);
    setEditorOpen(true);
  };

  const openEditDialog = (schedule: IScheduleRecord) => {
    setSelectedSchedule(schedule);
    setEditorOpen(true);
  };

  const closeEditor = () => {
    setEditorOpen(false);
    setSelectedSchedule(null);
  };

  const statusCounts = {
    ALL: schedules.length,
    SCHEDULED: schedules.filter((item) => item.status === "SCHEDULED").length,
    COMPLETED: schedules.filter((item) => item.status === "COMPLETED").length,
    CANCELLED: schedules.filter((item) => item.status === "CANCELLED").length,
  };

  const summaryStats = isStudent
    ? [
        {
          label: "Scheduled sessions",
          value: statusCounts.SCHEDULED,
          icon: <CalendarMonthOutlined />,
          tone: "#28624e",
        },
        {
          label: "Upcoming lessons",
          value: statusCounts.SCHEDULED,
          icon: <EventAvailableOutlined />,
          tone: "#397354",
        },
      ]
    : [
        {
          label: "All sessions",
          value: statusCounts.ALL,
          icon: <CalendarMonthOutlined />,
          tone: "#28624e",
        },
        {
          label: "Scheduled",
          value: statusCounts.SCHEDULED,
          icon: <EventAvailableOutlined />,
          tone: "#397354",
        },
        {
          label: "Completed",
          value: statusCounts.COMPLETED,
          icon: <EventBusyOutlined />,
          tone: "#758078",
        },
      ];

  useEffect(() => {
    document.title = `Schedules | OpenStudy`;
  }, []);
  return (
    <Box sx={{ display: "grid", gap: 3 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            component="h2"
            variant="h5"
            sx={{ color: "#202a24", fontWeight: 700, mb: 0.75 }}
          >
            {title}
          </Typography>
          <Typography color="text.secondary">
            {isAdmin
              ? "Create and manage lessons across your classes."
              : isTeacher
                ? "See your upcoming teaching commitments and lesson details."
                : "View upcoming lessons for your class."}
          </Typography>
        </Box>
        {isAdmin && (
          <Button
            variant="contained"
            startIcon={<AddOutlined />}
            onClick={openCreateDialog}
          >
            Create schedule
          </Button>
        )}
      </Box>

      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void query.refetch()}
            >
              Try again
            </Button>
          }
        >
          {messageFromError(query.error, "Schedules could not be loaded.")}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(3, minmax(0, 1fr))",
          },
          gap: 1.5,
        }}
      >
        {summaryStats.map((stat) => (
          <Paper
            key={stat.label}
            elevation={0}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 2,
              border: "1px solid #e8ece8",
              borderRadius: 2,
            }}
          >
            <Box
              sx={{
                display: "grid",
                placeItems: "center",
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: "#e9f2ec",
                color: stat.tone,
              }}
            >
              {stat.icon}
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">
                {stat.label}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {query.isLoading ? "—" : stat.value}
              </Typography>
            </Box>
          </Paper>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          overflow: "hidden",
          border: "1px solid #e8ece8",
          borderRadius: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "stretch", sm: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", sm: "row" },
            gap: 2,
            p: { xs: 2, sm: 2.5 },
            borderBottom: "1px solid #edf0ed",
          }}
        >
          <Box>
            <Typography
              component="h3"
              variant="subtitle1"
              sx={{ fontWeight: 700 }}
            >
              Lesson sessions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {visibleSchedules.length}{" "}
              {visibleSchedules.length === 1 ? "session" : "sessions"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 1,
              alignItems: "center",
            }}
          >
            <TextField
              select
              size="small"
              label="Status"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as ScheduleStatusFilter)
              }
              sx={{ minWidth: 148 }}
            >
              {(isStudent
                ? (["ALL", "SCHEDULED"] as const)
                : (["ALL", "SCHEDULED", "COMPLETED", "CANCELLED"] as const)
              ).map((status) => (
                <MenuItem key={status} value={status}>
                  {status === "ALL"
                    ? "All statuses"
                    : status.charAt(0) + status.slice(1).toLowerCase()}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label="Search sessions"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ minWidth: { xs: "100%", sm: 210 } }}
            />
          </Box>
        </Box>

        {query.isLoading ? (
          <Stack spacing={1.5} sx={{ py: 7, alignItems: "center" }}>
            <CircularProgress size={30} />
            <Typography variant="body2" color="text.secondary">
              Loading schedule…
            </Typography>
          </Stack>
        ) : visibleSchedules.length ? (
          <Box sx={{ display: "grid", gap: 0, px: { xs: 1.5, sm: 2.5 } }}>
            {visibleSchedules.map((schedule) => (
              <Box
                key={schedule.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "150px minmax(0, 1fr) auto",
                  },
                  alignItems: "center",
                  gap: 2,
                  py: 2,
                  borderBottom: "1px solid #edf0ed",
                  "&:last-of-type": { borderBottom: 0 },
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    color: "#28624e",
                  }}
                >
                  <ScheduleOutlined fontSize="small" />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {displayTime(schedule.startTime)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {displayTime(schedule.endTime)}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexWrap: "wrap",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#26332b", fontWeight: 700 }}
                    >
                      {schedule.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={
                        schedule.status.charAt(0) +
                        schedule.status.slice(1).toLowerCase()
                      }
                      color={
                        schedule.status === "SCHEDULED"
                          ? "success"
                          : schedule.status === "CANCELLED"
                            ? "error"
                            : "default"
                      }
                      variant="outlined"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(schedule.date)}
                    {schedule.class?.name ? ` · ${schedule.class.name}` : ""}
                    {schedule.subject?.name
                      ? ` · ${schedule.subject.name}`
                      : ""}
                    {schedule.topic?.title ? ` · ${schedule.topic.title}` : ""}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isStudent
                      ? `Teacher: ${getTeacherName(schedule.teacher)}`
                      : isAdmin
                        ? `Teacher: ${getTeacherName(schedule.teacher)}`
                        : schedule.class?.name
                          ? `Class: ${schedule.class.name}`
                          : ""}
                  </Typography>
                  {schedule.notes && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.75, whiteSpace: "pre-wrap" }}
                    >
                      {schedule.notes}
                    </Typography>
                  )}
                </Box>

                {isAdmin && schedule.status === "SCHEDULED" && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditOutlined />}
                    onClick={() => openEditDialog(schedule)}
                  >
                    Edit
                  </Button>
                )}
              </Box>
            ))}
          </Box>
        ) : (
          <Box
            sx={{
              display: "grid",
              justifyItems: "center",
              gap: 1.25,
              py: 8,
              px: 2,
              textAlign: "center",
            }}
          >
            <Avatar sx={{ bgcolor: "#e9f2ec", color: "#28624e" }}>
              <CalendarMonthOutlined />
            </Avatar>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {schedules.length ? "No matching sessions" : "No sessions yet"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {schedules.length
                ? "Try changing your search or status filter."
                : isAdmin
                  ? "Create a schedule to share upcoming lessons with your school."
                  : "There are no sessions scheduled for you right now."}
            </Typography>
            {isAdmin && schedules.length === 0 && (
              <Button
                variant="contained"
                startIcon={<AddOutlined />}
                onClick={openCreateDialog}
                sx={{ mt: 1 }}
              >
                Create schedule
              </Button>
            )}
          </Box>
        )}
      </Paper>

      {isAdmin && editorOpen && (
        <ScheduleEditorDialog
          key={selectedSchedule?.id ?? "create"}
          open
          onClose={closeEditor}
          schedule={selectedSchedule}
        />
      )}
    </Box>
  );
};

export default SchedulePage;
