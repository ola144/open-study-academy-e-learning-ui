import {
  ArrowBack,
  ImageOutlined,
  OndemandVideoOutlined,
  OpenInNew,
} from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Button,
  Chip,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import type { ILessonContentBlock } from "../../api/lesson";
import { useSingleLessonQuery } from "../../hooks/useLesson";
import "./admin-pages.css";
import "./admin-detail-pages.css";
import { formatDateAndTime } from "../../utils/helperFunctions";
import { useUserQuery } from "../../hooks/useUser";
import { useEffect } from "react";

function ContentBlock({ block }: { block: ILessonContentBlock }) {
  switch (block.type) {
    case "HEADING":
      return (
        <Typography component="h4" variant="h6">
          {block.text || "Untitled section"}
        </Typography>
      );
    case "TEXT":
      return (
        <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
          {block.text || "—"}
        </Typography>
      );
    case "LIST":
      return block.items?.length ? (
        <List dense disablePadding>
          {block.items.map((item, index) => (
            <ListItem key={`${index}-${item}`} disableGutters>
              <ListItemText primary={item} />
            </ListItem>
          ))}
        </List>
      ) : (
        <Typography color="text.secondary">This list has no items.</Typography>
      );
    case "IMAGE":
      return (
        <Stack spacing={1}>
          {block.url && (
            <img
              src={block.url}
              alt={block.caption || "Lesson content"}
              loading="lazy"
              referrerPolicy="no-referrer"
              style={{
                display: "block",
                maxWidth: "100%",
                maxHeight: 480,
                objectFit: "contain",
                borderRadius: 8,
              }}
            />
          )}
          {block.caption && (
            <Typography variant="caption" color="text.secondary">
              {block.caption}
            </Typography>
          )}
          {!block.url && (
            <Typography color="text.secondary">
              No image URL provided.
            </Typography>
          )}
        </Stack>
      );
    case "VIDEO":
      return (
        <Stack spacing={1}>
          {block.url ? (
            <Button
              component="a"
              href={block.url}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<OndemandVideoOutlined />}
              endIcon={<OpenInNew />}
              sx={{ alignSelf: "flex-start" }}
            >
              Open lesson video
            </Button>
          ) : (
            <Typography color="text.secondary">
              No video URL provided.
            </Typography>
          )}
          {block.caption && (
            <Typography variant="caption" color="text.secondary">
              {block.caption}
            </Typography>
          )}
        </Stack>
      );
    default:
      return (
        <Typography color="text.secondary">
          Unsupported content block.
        </Typography>
      );
  }
}

export default function LessonDetailsPage() {
  const { topicId = "", lessonId = "" } = useParams();
  const { data, isLoading, error, refetch } = useSingleLessonQuery(lessonId);
  const lesson = data?.data;
  const topic = lesson?.topic;
  const subject = lesson?.topic?.subject;

  const { data: currentUser } = useUserQuery();

  useEffect(() => {
    document.title = `Lesson Details | OpenStudy`;
  }, []);

  return (
    <div className="admin-page admin-detail-page">
      <Button
        component={RouterLink}
        to={
          currentUser?.user?.role === "ADMIN"
            ? `/admin/topics/${topicId}/lessons`
            : `/teacher/topics/${topicId}/lessons`
        }
        className="admin-detail-back"
        startIcon={<ArrowBack />}
      >
        Back to lessons
      </Button>

      {isLoading ? (
        <Paper className="admin-detail-loading" elevation={0}>
          <CircularProgress aria-label="Loading lesson details" />
          <Typography>Loading lesson details…</Typography>
        </Paper>
      ) : error ? (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error.message}
        </Alert>
      ) : !lesson ? (
        <Alert severity="warning">This lesson could not be found.</Alert>
      ) : (
        <>
          <Paper className="admin-detail-hero" elevation={0}>
            <Avatar className="admin-detail-avatar" aria-hidden="true">
              <ImageOutlined fontSize="large" />
            </Avatar>
            <div className="admin-detail-heading-copy">
              <Typography className="admin-eyebrow">LESSON DETAILS</Typography>
              <Typography component="h2" className="admin-page-title">
                {lesson.title}
              </Typography>
              <Typography className="admin-page-description">
                {topic?.title ?? "Topic unavailable"}
                {subject?.name ? ` · ${subject.name}` : ""}
              </Typography>
            </div>
            <Chip
              label={lesson.status === "PUBLISHED" ? "Published" : "Draft"}
              className={`admin-status-chip ${lesson.status.toLowerCase()}`}
            />
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Overview
            </Typography>
            <div className="admin-detail-grid">
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Topic</span>
                <span className="admin-detail-field-value">
                  {topic ? (
                    <Button
                      component={RouterLink}
                      to={`/admin/topics/${topic.id ?? topic.id ?? topicId}`}
                      size="small"
                      sx={{ p: 0, minWidth: 0 }}
                    >
                      {topic.title}
                    </Button>
                  ) : (
                    "Not available"
                  )}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Subject</span>
                <span className="admin-detail-field-value">
                  {subject?.name ?? "Not available"}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Duration</span>
                <span className="admin-detail-field-value">
                  {lesson.estimatedMinutes} minutes
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Objectives</span>
                <span className="admin-detail-field-value">
                  {lesson.objectives?.length ?? 0}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Created</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(lesson.createdAt)}
                </span>
              </div>
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Last updated</span>
                <span className="admin-detail-field-value">
                  {formatDateAndTime(lesson.updatedAt)}
                </span>
              </div>
              {lesson.publishedAt && (
                <div className="admin-detail-field">
                  <span className="admin-detail-field-label">Published</span>
                  <span className="admin-detail-field-value">
                    {formatDateAndTime(lesson.publishedAt)}
                  </span>
                </div>
              )}
              <div className="admin-detail-field">
                <span className="admin-detail-field-label">Lesson ID</span>
                <span className="admin-detail-field-value">
                  {lesson.id ?? lesson.id ?? lessonId}
                </span>
              </div>
            </div>
            <Divider sx={{ my: 2.5 }} />
            <Typography component="h4" className="admin-detail-card-title">
              Summary
            </Typography>
            <Typography color="text.secondary" sx={{ whiteSpace: "pre-wrap" }}>
              {lesson.summary || "No summary has been added."}
            </Typography>
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Learning objectives
            </Typography>
            {lesson.objectives?.length ? (
              <List disablePadding>
                {lesson.objectives.map((objective, index) => (
                  <ListItem key={`${index}-${objective}`} divider>
                    <ListItemText
                      primary={objective}
                      slotProps={{ primary: { color: "text.primary" } }}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No learning objectives have been added.
              </Typography>
            )}
          </Paper>

          <Paper className="admin-detail-card" elevation={0}>
            <Typography component="h3" className="admin-detail-card-title">
              Lesson content
            </Typography>
            {lesson.content?.length ? (
              <Stack divider={<Divider flexItem />} spacing={2}>
                {lesson.content.map((block, index) => (
                  <Stack
                    spacing={1}
                    key={`${block.type}-${index}`}
                    sx={{ pt: index ? 2 : 0 }}
                  >
                    <Chip
                      label={block.type.toLowerCase()}
                      size="small"
                      variant="outlined"
                      sx={{ alignSelf: "flex-start" }}
                    />
                    <ContentBlock block={block} />
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Alert severity="info">
                This lesson has no content blocks yet. Add content before
                publishing.
              </Alert>
            )}
          </Paper>
        </>
      )}
    </div>
  );
}
