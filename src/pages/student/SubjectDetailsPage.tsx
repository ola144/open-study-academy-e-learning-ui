import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  LinearProgress,
  Pagination,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { ArrowBack, Lock, PlayArrow } from "@mui/icons-material";
import { Link as RouterLink, useParams } from "react-router-dom";
import { useStudentSubjectQuery } from "../../hooks/useSubject";
import { useTopicsQuery } from "../../hooks/useTopic";
import type { ITopicRecord } from "../../api/topic";
import "./student-pages.css";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";
import { errorMessage } from "../../utils/helperFunctions";

const SubjectDetailsPage = () => {
  const { subjectId = "" } = useParams();
  const [page, setPage] = useState(1);

  const { data: schoolInfo } = useSchoolInfoQuery();

  const subjectQuery = useStudentSubjectQuery(subjectId);
  const subject = subjectQuery.data?.data;

  const topicsQuery = useTopicsQuery(
    page,
    20,
    undefined,
    subjectId || undefined,
    false,
    Boolean(subjectId && subject),
    schoolInfo?.data?.term,
  );
  const topics = [...(topicsQuery.data?.data ?? [])].sort(
    (first, second) => (first.order ?? 0) - (second.order ?? 0),
  );
  const totalTopics = topicsQuery.data?.pagination?.total ?? topics.length;

  const totalCompletedTopic = topics.filter((t) => t.isComplete).length;

  const topicPercentageDifference =
    totalTopics > 0 ? Math.round((totalCompletedTopic / totalTopics) * 100) : 0;

  useEffect(() => {
    document.title = `Subject Details | OpenStudy`;
  }, []);

  if (subjectQuery.isLoading) {
    return (
      <div className="student-page">
        <Paper elevation={0} className="student-panel" sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading subject…</Typography>
        </Paper>
      </div>
    );
  }

  if (subjectQuery.isError || !subject) {
    return (
      <div className="student-page">
        {subjectQuery.isError && (
          <Alert severity="error">{errorMessage(subjectQuery.error)}</Alert>
        )}
        <div className="student-empty-state">
          {errorMessage(subjectQuery.error) ||
            "This subject is not assigned to your class or could not be found."}
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

  const subjectClass =
    subject.class && typeof subject.class === "object"
      ? subject.class.name
      : "Your class";

  return (
    <div className="student-page">
      <Button
        component={RouterLink}
        to="/student/subjects"
        className="student-back-link"
        startIcon={<ArrowBack />}
      >
        All subjects
      </Button>
      <div className="student-subject-hero green">
        <div className="student-subject-hero-copy">
          <Chip label={subject.category || "GENERAL"} size="small" />
          <Typography component="h2">{subject.name}</Typography>
          <Typography>
            {subject.description || "No subject description provided."}
          </Typography>
          <div className="student-subject-hero-meta">
            <span>
              Class <strong>{subjectClass}</strong>
            </span>
            {subject.class &&
              typeof subject.class === "object" &&
              subject.class.level && (
                <span>
                  Level <strong>{subject.class.level}</strong>
                </span>
              )}
          </div>
        </div>
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            width: 92,
            height: 92,
          }}
        >
          <CircularProgress
            variant="determinate"
            value={100}
            size={92}
            thickness={5}
            sx={{ color: "grey.400" }}
          />

          <CircularProgress
            variant="determinate"
            color="success"
            thickness={5}
            size={92}
            value={topicPercentageDifference}
            sx={{
              position: "absolute",
              left: 0,
              "& .MuiCircularProgress-circle": {
                strokeLinecap: "round",
              },
              // "&::before": {
              //   content: '""',
              //   position: "absolute",
              //   inset: 0,
              //   borderRadius: "50%",
              //   border: "10px solid",
              //   borderColor: "grey.300",
              //   zIndex: -1,
              // },
            }}
          />

          <Box
            sx={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <strong style={{ display: "flex", flexDirection: "column" }}>
              {topicsQuery.isLoading
                ? "…"
                : `${totalCompletedTopic} / ${totalTopics}`}{" "}
              <span style={{ color: "gray", fontSize: 12 }}>topics</span>
            </strong>
          </Box>
        </Box>
      </div>

      {topicsQuery.isError && (
        <Alert severity="error">{errorMessage(topicsQuery.error)}</Alert>
      )}
      <div className="student-section-heading">
        <div>
          <Typography component="h3">Course topics</Typography>
          <Typography component="p" variant="body2">
            Published topics and lessons for this subject
          </Typography>
        </div>
        <span style={{ fontSize: 12 }}>
          {" "}
          <span style={{ fontWeight: "bold" }}>{totalCompletedTopic}</span>{" "}
          {totalCompletedTopic > 1 ? "topics" : "topic"} completed out of{" "}
          <span style={{ fontWeight: "bold" }}>{totalTopics} </span>total topics
        </span>
      </div>

      {topicsQuery.isLoading ? (
        <Paper elevation={0} className="student-panel" sx={{ p: 3 }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading course topics…</Typography>
        </Paper>
      ) : (
        <>
          <div className="student-topic-list">
            {topics.map((topic: ITopicRecord, index) => {
              const topicId = topic.id;

              const previousTopic = topics[index - 1];

              const isDisabled = index > 0 && !previousTopic.isComplete;

              return (
                <Paper
                  elevation={0}
                  className="student-topic-list-item"
                  key={topicId}
                >
                  <span className="student-topic-state current">
                    {String(topic.order || index + 1).padStart(2, "0")}
                  </span>
                  <div className="student-topic-list-copy">
                    <strong>{topic.title}</strong>
                    <span style={{ fontSize: "12px" }}>
                      {topic.description || "Open to view published lessons."}
                    </span>
                  </div>
                  {topic.term && (
                    <Chip
                      label={`${topic.term} TERM`}
                      size="small"
                      sx={{ fontSize: 12 }}
                    />
                  )}
                  <Tooltip
                    title={
                      isDisabled
                        ? "Complete the previous topic to unlock this topic."
                        : topic.isComplete
                          ? "Review the completed topic."
                          : "Open to start the topic."
                    }
                  >
                    <Button
                      component={RouterLink}
                      to={`/student/topics/${topicId}`}
                      variant="contained"
                      size="small"
                      disabled={isDisabled}
                      endIcon={isDisabled ? <Lock /> : <PlayArrow />}
                    >
                      {isDisabled
                        ? "Lock"
                        : topic.isComplete
                          ? "Review Topic"
                          : "Open Topic"}
                    </Button>
                  </Tooltip>
                </Paper>
              );
            })}
            {topics.length === 0 && !topicsQuery.isError && (
              <div className="student-empty-state">
                No active topics are available for this subject yet.
              </div>
            )}
          </div>
          {(topicsQuery.data?.pagination?.totalPages ?? 0) > 1 && (
            <Stack sx={{ alignItems: "center" }}>
              <Pagination
                count={topicsQuery.data?.pagination?.totalPages ?? 1}
                page={page}
                onChange={(_, nextPage) => setPage(nextPage)}
              />
            </Stack>
          )}
        </>
      )}
    </div>
  );
};

export default SubjectDetailsPage;
