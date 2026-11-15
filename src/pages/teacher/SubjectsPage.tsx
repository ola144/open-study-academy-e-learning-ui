import { useEffect, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  InputAdornment,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { MenuBookOutlined, Search } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAssignedTeacherSubjectsQuery } from "../../hooks/useSubject";
import "./teacher-pages.css";

const subjectTones = ["green", "blue", "coral", "gold"];

export default function SubjectsPage() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const { data, isLoading, error, refetch } = useAssignedTeacherSubjectsQuery(
    page + 1,
    rowsPerPage,
    search,
  );

  const subjects = data?.data ?? [];

  useEffect(() => {
    document.title = `Subjects | OpenStudy`;
  }, []);

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <Typography className="teacher-eyebrow">CONTENT LIBRARY</Typography>
          <Typography component="h2" className="teacher-page-title">
            My Subjects
          </Typography>
          <Typography className="teacher-page-description">
            View the subjects assigned to you and explore their topics.
          </Typography>
        </div>
      </div>

      <div
        className="teacher-subject-toolbar"
        style={{ display: "flex", justifyContent: "space-between" }}
      >
        <TextField
          size="small"
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          placeholder="Search subjects"
          aria-label="Search subjects"
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
        <Typography variant="body2" color="text.secondary">
          {data?.pagination?.total ?? 0} assigned{" "}
          {data?.pagination?.total === 1 ? "subject" : "subjects"}
        </Typography>
      </div>

      {error && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => void refetch()}>
              Retry
            </Button>
          }
        >
          {error instanceof Error
            ? error.message
            : "Unable to load your assigned subjects."}
        </Alert>
      )}

      {isLoading ? (
        <div
          className="teacher-empty-state"
          role="status"
          aria-label="Loading assigned subjects"
        >
          <CircularProgress size={28} />
        </div>
      ) : !error && subjects.length > 0 ? (
        <>
          <div className="teacher-subject-grid">
            {subjects.map((subject, index) => {
              const className = subject.class.name
                ? subject.class?.name
                : "Class not assigned";
              const tone = subjectTones[index % subjectTones.length];
              const subjectId = subject.id ?? subject.id;

              return (
                <Card
                  variant="outlined"
                  className="teacher-subject-card"
                  key={subjectId ?? `${subject.name}-${index}`}
                >
                  <div className={`teacher-subject-band ${tone}`} />
                  <CardContent>
                    <div className="teacher-subject-card-top">
                      <span className={`teacher-subject-icon ${tone}`}>
                        <MenuBookOutlined />
                      </span>
                      <Chip
                        label={subject.isActive ? "Active" : "Inactive"}
                        size="small"
                        className={`teacher-status-chip ${subject.isActive ? "published" : "draft"}`}
                      />
                    </div>
                    <Typography
                      component="h3"
                      className="teacher-subject-title"
                    >
                      {subject.name}
                    </Typography>
                    <Typography className="teacher-subject-class">
                      {className}
                    </Typography>
                    <Typography className="teacher-subject-description">
                      {subject.description || "No description available."}
                    </Typography>
                    <div className="teacher-subject-meta">
                      <span>
                        <strong>{subject.category}</strong> category
                      </span>
                      <span>
                        <strong>{subject.order ?? 0}</strong> display order
                      </span>
                    </div>
                  </CardContent>
                  <CardActions>
                    <Button
                      component={RouterLink}
                      to={`/teacher/topics?subjectId=${subject.id}`}
                      size="small"
                      disabled={!subjectId}
                      endIcon={<span aria-hidden="true">→</span>}
                    >
                      View topics
                    </Button>
                  </CardActions>
                </Card>
              );
            })}
          </div>
          <TablePagination
            component="div"
            count={data?.pagination?.total ?? 0}
            page={page}
            onPageChange={(_event, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </>
      ) : (
        !error && (
          <div className="teacher-empty-state">
            {search
              ? `No assigned subjects match "${search}".`
              : "No subjects have been assigned to your account yet."}
          </div>
        )
      )}
    </div>
  );
}
