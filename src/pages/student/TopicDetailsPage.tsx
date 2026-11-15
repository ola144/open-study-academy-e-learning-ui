/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Alert,
  Box,
  Button,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ArrowForward,
  AssignmentOutlined,
  MenuBookOutlined,
} from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom";
import {
  useMarkAsCompletedMutation,
  useSingleTopicQuery,
  useTopicsQuery,
} from "../../hooks/useTopic";
import { useLessonsQuery } from "../../hooks/useLesson";
import { useStudentEvaluationsQuery } from "../../hooks/useStudentLearning";
import type { ITopicRecord } from "../../api/topic";
import type { ILessonRecord } from "../../api/lesson";
import "./student-pages.css";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { errorMessage } from "../../utils/helperFunctions";

const LessonContent = ({ lesson }: { lesson: ILessonRecord }) => {
  const getEmbedUrl = (videoUrl: string) => {
    try {
      const parsedUrl = new URL(videoUrl);

      let videoId = "";

      if (parsedUrl.hostname === "youtu.be") {
        videoId = parsedUrl.pathname.slice(1);
      } else if (
        parsedUrl.hostname === "youtube.com" ||
        parsedUrl.hostname === "www.youtube.com" ||
        parsedUrl.hostname === "m.youtube.com"
      ) {
        if (parsedUrl.pathname === "/watch") {
          videoId = parsedUrl.searchParams.get("v") ?? "";
        } else if (parsedUrl.pathname.startsWith("/embed/")) {
          videoId = parsedUrl.pathname.split("/")[2] ?? "";
        } else if (parsedUrl.pathname.startsWith("/shorts/")) {
          videoId = parsedUrl.pathname.split("/")[2] ?? "";
        }
      }

      if (!/^[\w-]{11}$/.test(videoId)) {
        return null;
      }

      return `https://www.youtube.com/embed/${videoId}`;
    } catch {
      return null;
    }
  };

  return (
    <Paper elevation={0} className="student-panel student-topic-lesson">
      <div className="student-panel-heading">
        <div>
          <Typography component="h3">{lesson.title}</Typography>
          {lesson.summary && <Typography>{lesson.summary}</Typography>}
        </div>
        <Chip
          icon={<MenuBookOutlined />}
          label={`${lesson.estimatedMinutes} min`}
          size="small"
          variant="outlined"
        />
      </div>
      {lesson.objectives?.length > 0 && (
        <div className="student-topic-objectives">
          <Typography variant="subtitle2" sx={{ textTransform: "uppercase" }}>
            Learning objectives
          </Typography>
          <ul>
            {lesson.objectives.map((objective, index) => (
              <li key={`${lesson.id}-objective-${index}`}>{objective}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="student-lesson-content">
        {lesson.content?.map((block, index) => (
          <div
            className="student-lesson-block"
            key={`${lesson.id}-block-${index}`}
          >
            {block.type === "HEADING" ? (
              <Typography component="h4" sx={{ whiteSpace: "pre-wrap" }}>
                {block.text}
              </Typography>
            ) : block.type === "IMAGE" && block.url ? (
              <figure>
                <img src={block.url} alt={block.caption || lesson.title} />
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            ) : block.type === "VIDEO" && block.url ? (
              <div>
                <Box
                  sx={{
                    width: "100%",
                    aspectRatio: "16 / 9",
                    overflow: "hidden",
                    borderRadius: 2,
                  }}
                >
                  <iframe
                    src={getEmbedUrl(block.url) ?? ""}
                    title={block.caption || lesson.title}
                    allowFullScreen
                    style={{
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                </Box>
                {block.caption && (
                  <Typography variant="caption">{block.caption}</Typography>
                )}
              </div>
            ) : block.type === "LIST" ? (
              <ul>
                {block.items?.map((item, itemIndex) => (
                  <li key={itemIndex}>{item}</li>
                ))}
              </ul>
            ) : (
              <Typography component="p" sx={{ whiteSpace: "pre-wrap" }}>
                {block.text}
              </Typography>
            )}
          </div>
        ))}
        {(!lesson.content || lesson.content.length === 0) && (
          <Typography color="text.secondary">
            Lesson content has not been added yet.
          </Typography>
        )}
      </div>
    </Paper>
  );
};

const TopicDetailsPage = () => {
  const { topicId = "" } = useParams();

  const [loading, setLoading] = useState(false);

  const topicQuery = useSingleTopicQuery(topicId);
  const topic = topicQuery.data?.data;

  const subjectId = topic ? topic.subject.id : "";
  const topicsQuery = useTopicsQuery(1, 100, undefined, subjectId || undefined);

  const lessonsQuery = useLessonsQuery(1, 100, topicId);

  const evaluationsQuery = useStudentEvaluationsQuery(
    1,
    100,
    topicId || undefined,
  );

  const subjectTopics = [...(topicsQuery.data?.data ?? [])].sort(
    (a, b) => (a?.order ?? 0) - (b?.order ?? 0),
  );

  const lessons = lessonsQuery.data?.data ?? [];
  const evaluations = evaluationsQuery.data?.data ?? [];

  const topicIndex = subjectTopics.findIndex(
    (item: ITopicRecord) => item.id === topicId,
  );

  const previousTopic = subjectTopics[topicIndex - 1];
  const nextTopic = subjectTopics[topicIndex + 1];

  const markTopicCompleted = useMarkAsCompletedMutation();

  const handlleTopicCompleted = () => {
    setLoading(true);

    markTopicCompleted.mutate(
      { id: topicId },
      {
        onSuccess: (res) => {
          toast.success(res.message);
        },
        onError: (err: any) => {
          toast.error(err.response.data.message);
        },
        onSettled: () => {
          setLoading(false);
        },
      },
    );
  };

  useEffect(() => {
    document.title = `Topic Details | OpenStudy`;
  }, []);

  if (topicQuery.isLoading) {
    return (
      <div className="student-page">
        <Paper elevation={0} className="student-panel" sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading topic…</Typography>
        </Paper>
      </div>
    );
  }

  if (topicQuery.isError || !topic) {
    return (
      <div className="student-page">
        {topicQuery.isError && (
          <Alert severity="error">{errorMessage(topicQuery.error)}</Alert>
        )}
        <div className="student-empty-state">
          This topic could not be found.
        </div>
        <Button
          component={RouterLink}
          to="/student/subjects"
          startIcon={<ArrowBack />}
        >
          Back to subjects
        </Button>
      </div>
    );
  }

  const subject = typeof topic.subject === "object" ? topic.subject : undefined;

  return (
    <div className="student-page student-lesson-page">
      <Button
        component={RouterLink}
        to={`/student/subjects/${topic.subject.id}`}
        className="student-back-link"
        startIcon={<ArrowBack />}
      >
        {subject?.name ?? "Subject"}
      </Button>
      <div className="student-lesson-heading">
        <div>
          <Typography className="student-eyebrow">
            {topic.term ? `${topic.term} TERM` : "COURSE TOPIC"}
            {topic.order
              ? ` · TOPIC ${String(topic.order).padStart(2, "0")}`
              : ""}
          </Typography>
          <Typography
            component="h2"
            sx={{
              fontSize: { sm: 24, md: 30, xs: 18, fontWeight: "bold" },
            }}
          >
            {topic.title}
          </Typography>
          <Typography className="student-page-description">
            {topic.description ||
              "Study the published lessons and check your learning with an evaluation."}
          </Typography>
        </div>
        <div className="student-lesson-meta">
          <MenuBookOutlined />
          <span>
            {lessons.length} published{" "}
            {lessons.length === 1 ? "lesson" : "lessons"}
          </span>
        </div>
      </div>

      {(lessonsQuery.isError ||
        topicsQuery.isError ||
        evaluationsQuery.isError) && (
        <Alert severity="error">
          {errorMessage(
            lessonsQuery.error ?? topicsQuery.error ?? evaluationsQuery.error,
          )}
        </Alert>
      )}

      {lessonsQuery.isLoading ? (
        <Paper elevation={0} className="student-panel" sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading published lessons…</Typography>
        </Paper>
      ) : lessons.length ? (
        <Stack spacing={2}>
          {lessons.map((lesson) => (
            <LessonContent key={lesson.id} lesson={lesson} />
          ))}

          {topic.isComplete ? (
            <Typography variant="body1" color="success">
              You complete this topic. You can go to next topic
            </Typography>
          ) : (
            <Box sx={{ display: "flex", justifyContent: "end" }}>
              <Tooltip title="Mark as complete to continue">
                <Button
                  variant="contained"
                  sx={{
                    width: "fit-content",
                  }}
                  color="success"
                  onClick={handlleTopicCompleted}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Mark As Complete"}
                </Button>
              </Tooltip>
            </Box>
          )}
        </Stack>
      ) : (
        <Alert severity="info">
          There are no published lessons for this topic yet.
        </Alert>
      )}

      {evaluations.length > 0 && lessons.length > 0 && (
        <Paper
          elevation={0}
          className="student-panel student-lesson-evaluation"
        >
          <span className="student-lesson-evaluation-icon">
            <AssignmentOutlined />
          </span>
          <Typography component="h3">Check your learning</Typography>
          <Typography>Published evaluations for this topic:</Typography>
          <Stack spacing={1} sx={{ mt: 2 }}>
            {evaluations.map((evaluation) => (
              <Button
                key={evaluation.id}
                component={RouterLink}
                to={`/student/evaluations/${evaluation.id}`}
                variant="outlined"
                endIcon={<ArrowForward />}
              >
                {evaluation.title}
              </Button>
            ))}
          </Stack>
        </Paper>
      )}

      <div className="student-topic-pager">
        {previousTopic ? (
          <Button
            component={RouterLink}
            to={`/student/topics/${previousTopic.id}`}
            startIcon={<ArrowBack />}
          >
            {previousTopic.title}
          </Button>
        ) : (
          <span />
        )}
        {nextTopic && (
          <Button
            component={RouterLink}
            disabled={!topic.isComplete}
            to={`/student/topics/${nextTopic.id}`}
            endIcon={<ArrowForward />}
          >
            Next topic
          </Button>
        )}
      </div>
    </div>
  );
};

export default TopicDetailsPage;
