import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  InputAdornment,
  LinearProgress,
  Pagination,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  Close,
  MenuBookOutlined,
  Search,
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useQueries } from "@tanstack/react-query";
import { getAllTopics } from "../../api/topic";
import { useStudentSubjectsQuery } from "../../hooks/useSubject";
import type { ISubjectRecord } from "../../api/subject";
import "./student-pages.css";
import { useSchoolInfoQuery } from "../../hooks/useSchoolInfo";
import { errorMessage } from "../../utils/helperFunctions";

const tones = ["green", "blue", "coral", "gold"];

const SubjectsPage = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const schoolInfoQuery = useSchoolInfoQuery();
  const info = schoolInfoQuery.data?.data;

  const subjectsQuery = useStudentSubjectsQuery(page, 10, search);
  const subjects = subjectsQuery.data?.data ?? [];

  const topicCounts = useQueries({
    queries: subjects.map((subject) => {
      const subjectId = subject.id;

      return {
        queryKey: ["topic", "student-subject", subjectId],
        queryFn: () => getAllTopics(1, 1, undefined, subjectId, info?.term),
      };
    }),
  });

  useEffect(() => {
    document.title = `Subjects | OpenStudy`;
  }, []);

  return (
    <div className="student-page">
      <div className="student-page-heading">
        <div>
          <Typography className="student-eyebrow">YOUR CLASSROOM</Typography>
          <Typography component="h2" className="student-page-title">
            My Subjects
          </Typography>
          <Typography className="student-page-description">
            Explore the active subjects assigned to your class.
          </Typography>
        </div>
        <Chip
          label={`${subjectsQuery.data?.pagination?.total ?? subjects.length} subjects`}
          variant="outlined"
          className="student-count-chip"
        />
      </div>
      <TextField
        size="small"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
          setPage(1);
        }}
        placeholder="Find a subject"
        aria-label="Find a subject"
        className="student-search-field"
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {search.trim() && (
                  <Button
                    size="small"
                    sx={{ width: "10px", px: 0 }}
                    variant="text"
                    color="inherit"
                    onClick={() => setSearch("")}
                  >
                    <Close fontSize="small" />
                  </Button>
                )}
              </InputAdornment>
            ),
          },
        }}
      />
      {subjectsQuery.isError && (
        <Alert severity="error">{errorMessage(subjectsQuery.error)}</Alert>
      )}
      {topicCounts.some((query) => query.isError) && (
        <Alert severity="error">
          Some topic counts could not be loaded. Open a subject to view its
          topics.
        </Alert>
      )}
      {subjectsQuery.isLoading ? (
        <div className="student-loading-state">
          <LinearProgress />
          <Typography>Loading your class subjects…</Typography>
        </div>
      ) : (
        <div className="student-subject-grid">
          {subjects.map((subject: ISubjectRecord, index) => {
            const subjectId = subject.id;

            const topicCountIndex = subjects.findIndex(
              (item) => item.id === subjectId,
            );

            const topicCountQuery = topicCounts[topicCountIndex];

            const totalTopics = topicCountQuery.data?.pagination?.total;

            const tone = tones[index % tones.length];
            console.log(tone);

            return (
              <Card
                variant="outlined"
                className="student-subject-card"
                key={subjectId}
              >
                <div className={`student-subject-topline ${tone}`} />
                <CardContent>
                  <div className="student-subject-card-head">
                    <span className={`student-course-icon ${tone}`}>
                      <MenuBookOutlined />
                    </span>
                    <Chip
                      label={subject.category || "GENERAL"}
                      size="small"
                      className="student-category-chip"
                    />
                  </div>
                  <Typography
                    component="h3"
                    className="student-subject-card-title"
                  >
                    {subject.name}
                  </Typography>
                  <Typography className="student-subject-description">
                    {subject.description || "No subject description provided."}
                  </Typography>
                  <div className="student-teacher-line">
                    <span>Class</span>
                    <strong>{subject.class?.name ?? "Your class"}</strong>
                  </div>
                  <div className="student-progress-caption">
                    <span>Topics</span>
                    <strong>
                      {topicCountQuery?.isLoading
                        ? "Loading…"
                        : ` ${totalTopics ?? "—"} available`}
                    </strong>
                  </div>
                </CardContent>
                <CardActions>
                  <Button
                    component={RouterLink}
                    to={`/student/subjects/${subjectId}`}
                    fullWidth
                    endIcon={<ArrowForward />}
                  >
                    Open subject
                  </Button>
                </CardActions>
              </Card>
            );
          })}
        </div>
      )}
      {!subjectsQuery.isLoading && subjects.length === 0 && (
        <div className="student-empty-state">
          {search
            ? `No subjects match “${search}”.`
            : "There are no active subjects assigned to your class yet."}
        </div>
      )}
      {(subjectsQuery.data?.pagination?.totalPages ?? 0) > 1 && (
        <Stack sx={{ alignItems: "center" }}>
          <Pagination
            count={subjectsQuery.data?.pagination?.totalPages ?? 1}
            page={page}
            onChange={(_, nextPage) => setPage(nextPage)}
          />
        </Stack>
      )}
    </div>
  );
};

export default SubjectsPage;
