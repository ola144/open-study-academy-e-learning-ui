import {
  ArrowBack,
  ArrowForward,
  LibraryBooksOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useLessonsQuery } from "../../hooks/useLesson";
import { useSingleTopicQuery } from "../../hooks/useTopic";
import "./admin-pages.css";
import "./admin-detail-pages.css";
import { formatDateAndTime } from "../../utils/helperFunctions";
import { useUserQuery } from "../../hooks/useUser";
import { useEffect } from "react";

export default function TopicDetailsPage() {
  const { topicId = "" } = useParams();
  const {
    data: topicResponse,
    isLoading: topicLoading,
    error: topicError,
    refetch: retryTopic,
  } = useSingleTopicQuery(topicId);
  const {
    data: lessonsResponse,
    isLoading: lessonsLoading,
    error: lessonsError,
    refetch: retryLessons,
  } = useLessonsQuery(1, 5, topicId);
  const topic = topicResponse?.data;
  const lessonCount = lessonsResponse?.pagination?.total ?? 0;
  const subject = topic?.subject ? topic?.subject : undefined;
  const error = topicError ?? lessonsError;

  const { data: currentUser } = useUserQuery();

  useEffect(() => {
    document.title = `Topic Details | OpenStudy`;
  }, []);

  return (
    <div className="admin-page admin-detail-page">
      <Button
        component={RouterLink}
        to={
          currentUser?.user?.role === "ADMIN"
            ? "/admin/topics"
            : "/teacher/topics"
        }
        className="admin-detail-back"
        startIcon={<ArrowBack />}
      >
        All topics
      </Button>

      {topicLoading ? (
        <Paper className="admin-detail-loading" elevation={0}>
          <CircularProgress aria-label="Loading topic" />
          <Typography>Loading topic details…</Typography>
        </Paper>
      ) : topicError ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void retryTopic()}
            >
              Retry
            </Button>
          }
        >
          {topicError.message}
        </Alert>
      ) : !topic ? (
        <Alert severity="warning">This topic could not be found.</Alert>
      ) : (
        <>
          <Paper className="admin-detail-hero" elevation={0}>
            <Avatar className="admin-detail-avatar">
              <LibraryBooksOutlined fontSize="large" />
            </Avatar>
            <div className="admin-detail-heading-copy">
              <Typography className="admin-eyebrow">
                CURRICULUM TOPIC
              </Typography>
              <Typography component="h6" className="admin-page-title">
                {topic.title}
              </Typography>
              <Typography className="admin-page-description">
                {subject?.name ?? "Subject unavailable"}
              </Typography>
            </div>
            <Chip
              label={topic.isActive ? "Active" : "Inactive"}
              className={`admin-status-chip ${topic.isActive ? "active" : "inactive"}`}
            />
          </Paper>

          {error && (
            <Alert
              severity="error"
              action={
                <Button
                  color="inherit"
                  size="small"
                  onClick={() => void retryLessons()}
                >
                  Retry
                </Button>
              }
            >
              Unable to load lessons: {lessonsError?.message}
            </Alert>
          )}

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Topic information
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Subject</span>
                <span className="admin-detail-field-value">
                  {subject ? (
                    <Button
                      component={RouterLink}
                      to={`/admin/subjects/${subject?.id ?? subject?.id}`}
                      size="small"
                      sx={{ p: 0, minWidth: 0 }}
                    >
                      {subject.name}
                    </Button>
                  ) : (
                    "Not available"
                  )}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Academic term</span>
                <span className="admin-detail-field-value">
                  {topic.term ?? "FIRST"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Display order</span>
                <span className="admin-detail-field-value">
                  {topic.order ?? 0}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Created</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(topic.createdAt)}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Topic ID</span>
                <span className="admin-detail-field-value">
                  {topic.id ?? topic.id ?? topicId}
                </span>
              </div>
            </div>
            <Typography
              component="h4"
              className="admin-detail-card-title"
              sx={{ mt: 3, mb: 1 }}
            >
              Description
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
              {topic.description || "No description has been added."}
            </Typography>
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Stack
              direction={{ xs: "column", sm: "row" }}
              sx={{
                display: "flex",
                alignItems: { sm: "center", xs: "stretch" },
                justifyContent: "space-between",
              }}
              spacing={1}
            >
              <div>
                <Typography
                  component="h3"
                  className="admin-detail-card-title"
                  sx={{ mb: 0.5 }}
                >
                  Lessons
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {lessonsLoading ? "Loading lessons…" : `${lessonCount} total`}
                </Typography>
              </div>
              <Button
                component={RouterLink}
                to={
                  currentUser?.user?.role === "ADMIN"
                    ? `/admin/topics/${topicId}/lessons`
                    : `/teacher/topics/${topicId}/lessons`
                }
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{ height: "fit-content" }}
              >
                Manage lessons
              </Button>
            </Stack>
            {lessonsLoading ? (
              <CircularProgress
                size={22}
                sx={{ mt: 2 }}
                aria-label="Loading lessons"
              />
            ) : lessonsError ? null : lessonCount === 0 ? (
              <Typography color="text.secondary" sx={{ mt: 2 }}>
                No lessons have been created for this topic yet.
              </Typography>
            ) : (
              <List disablePadding sx={{ mt: 1 }}>
                {(lessonsResponse?.data ?? []).map((lesson) => (
                  <ListItem
                    key={lesson.id ?? lesson.id}
                    divider
                    secondaryAction={
                      <Chip
                        label={lesson.status}
                        size="small"
                        className={`admin-status-chip ${lesson.status.toLowerCase()}`}
                      />
                    }
                  >
                    <ListItemText
                      primary={lesson.title}
                      secondary={
                        lesson.summary ||
                        `${lesson.estimatedMinutes} minute lesson`
                      }
                    />
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </>
      )}
    </div>
  );
}
