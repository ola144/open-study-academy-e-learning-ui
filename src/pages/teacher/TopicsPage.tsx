/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  InputAdornment,
  MenuItem,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import {
  ExpandMore,
  MenuBookOutlined,
  RemoveRedEye,
  Search,
} from "@mui/icons-material";
import { useSearchParams } from "react-router-dom";
import { useAssignedTeacherSubjectsQuery } from "../../hooks/useSubject";
import { useAssignedTeacherTopicsQuery } from "../../hooks/useTopic";
import "./teacher-pages.css";
import { Link as RouterLink } from "react-router-dom";

export default function TopicsPage() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | false>(false);

  const subjectId = searchParams.get("subjectId") ?? "";

  const subjectsQuery = useAssignedTeacherSubjectsQuery(1, 100);

  const topicsQuery = useAssignedTeacherTopicsQuery(
    page + 1,
    limit,
    search,
    subjectId || undefined,
  );

  const subjects = useMemo(
    () => subjectsQuery.data?.data ?? [],
    [subjectsQuery.data],
  );
  const topics = useMemo(
    () => topicsQuery.data?.data ?? [],
    [topicsQuery.data],
  );

  const subjectClass = (id: string) => {
    return subjects.find((sub) => sub.id === id)?.class.name;
  };

  const groupedTopics = useMemo(() => {
    const groups = new Map<string, { name: string; topics: typeof topics }>();

    for (const subject of subjects) {
      const id = subject.id;

      if (id) groups.set(id, { name: subject.name, topics: [] });
    }

    for (const topic of topics) {
      const subject = topic.subject;

      const id = subject?.id;
      if (!id) continue;

      const group = groups.get(id);
      if (group) group.topics.push(topic);
    }

    return [...groups.entries()].filter(([id, group]) =>
      subjectId ? id === subjectId : group.topics.length > 0,
    );
  }, [subjects, subjectId, topics]);

  const handleSubjectChange = (value: string) => {
    setPage(0);
    if (value) setSearchParams({ subjectId: value });
    else setSearchParams({});
  };

  const handleAccordionChange =
    (panel: string) => (_event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const error = subjectsQuery.error ?? topicsQuery.error;

  useEffect(() => {
    if (subjectId) {
      handleSubjectChange(subjectId);
    }
  }, [searchParams, subjectId]);

  useEffect(() => {
    document.title = `Topics | OpenStudy`;
  }, []);

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <Typography className="teacher-eyebrow">LESSON CONTENT</Typography>
          <Typography component="h2" className="teacher-page-title">
            My Topics
          </Typography>
          <Typography className="teacher-page-description">
            Browse the active topics for the subjects assigned to you.
          </Typography>
        </div>
      </div>

      <Box
        className="teacher-subject-toolbar"
        sx={{ display: "flex", justifyContent: "space-between" }}
      >
        <TextField
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search topics"
          aria-label="Search topics"
          className="teacher-search-field"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <TextField
            select
            size="small"
            label="Subject"
            value={subjectId}
            onChange={(event) => handleSubjectChange(event.target.value)}
            sx={{ minWidth: 220 }}
            disabled={subjectsQuery.isLoading || subjects.length === 0}
          >
            <MenuItem value="">All assigned subjects</MenuItem>
            {subjects.map((subject) => (
              <MenuItem
                key={subject.id ?? subject.id}
                value={subject.id ?? subject.id}
              >
                {subject.name} for {subject.class.name}
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary">
            {topicsQuery.data?.pagination?.total ?? 0} topics
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void subjectsQuery.refetch();
                void topicsQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "Unable to load assigned topics."}
        </Alert>
      )}

      {subjectsQuery.isLoading || topicsQuery.isLoading ? (
        <div
          className="teacher-empty-state"
          role="status"
          aria-label="Loading topics"
        >
          <CircularProgress size={28} />
        </div>
      ) : !error && groupedTopics.length > 0 ? (
        <div className="teacher-topic-subject-list">
          {groupedTopics.map(([id, group]) => (
            <Accordion
              key={id}
              onChange={handleAccordionChange(id)}
              expanded={subjectId ? Boolean(subjectId) : expanded === id}
              disableGutters
              className="teacher-topic-accordion"
            >
              {/*defaultExpanded={Boolean(subjectId)}
              slots={{ transition: Fade as AccordionSlots["transition"] }}
              slotProps={{ transition: { timeout: 400 } }} */}
              <AccordionSummary expandIcon={<ExpandMore />}>
                <div className="teacher-topic-subject-heading">
                  <span
                    className="teacher-topic-subject-icon"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <MenuBookOutlined />
                  </span>
                  <div>
                    <strong>
                      {group.name} for {subjectClass(id)}
                    </strong>
                    <span>
                      {group.topics.length}{" "}
                      {group.topics.length === 1 ? "topic" : "topics"} on this
                      page
                    </span>
                  </div>
                </div>
              </AccordionSummary>
              <AccordionDetails>
                {group.topics.length === 0 ? (
                  <div className="teacher-topic-empty">
                    No active topics are available for this subject yet.
                  </div>
                ) : (
                  group.topics.map((topic) => (
                    <div
                      className="teacher-topic-row"
                      key={topic.id ?? topic.id}
                    >
                      <div className="teacher-topic-order">
                        {String(topic.order ?? 0).padStart(2, "0")}
                      </div>
                      <div className="teacher-topic-copy">
                        <strong>{topic.title}</strong>
                        <span>
                          {topic.description || "No description provided."}
                        </span>
                      </div>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Chip
                          label="Active"
                          size="small"
                          className="teacher-status-chip published"
                        />
                        <Button
                          component={RouterLink}
                          to={`/teacher/topics/${topic.id ?? topic.id}`}
                          size="small"
                          startIcon={<RemoveRedEye />}
                        ></Button>
                      </Box>
                    </div>
                  ))
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      ) : (
        !error && (
          <div className="teacher-empty-state">
            {subjects.length === 0
              ? "No subjects have been assigned to your account yet."
              : search
                ? `No topics match "${search}".`
                : subjectId
                  ? "This subject has no active topics yet."
                  : "No active topics are available for your assigned subjects."}
          </div>
        )
      )}

      <TablePagination
        component="div"
        count={topicsQuery.data?.pagination?.total ?? 0}
        page={page}
        onPageChange={(_event, nextPage) => setPage(nextPage)}
        rowsPerPage={limit}
        onRowsPerPageChange={(event) => {
          setLimit(Number(event.target.value));
          setPage(0);
        }}
        rowsPerPageOptions={[10, 25, 50]}
      />
    </div>
  );
}
