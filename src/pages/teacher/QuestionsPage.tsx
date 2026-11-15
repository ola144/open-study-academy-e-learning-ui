import { useEffect, useState, type FormEvent } from "react";
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Add, Edit, Search } from "@mui/icons-material";
import {
  type IQuestionRecord,
  type IQuestionOption,
  type QuestionDifficulty,
  type QuestionType,
} from "../../api/question";
import { type ISubjectRecord } from "../../api/subject";
import { type ITopicRecord } from "../../api/topic";
import { useAssignedTeacherSubjectsQuery } from "../../hooks/useSubject";
import { useAssignedTeacherTopicsQuery } from "../../hooks/useTopic";
import { useLessonsQuery } from "../../hooks/useLesson";
import {
  useCreateQuestionMutation,
  useQuestionsQuery,
  useUpdateQuestionMutation,
} from "../../hooks/useQuestion";
import "./teacher-pages.css";
import { errorMessage } from "../../utils/helperFunctions";

const optionLetters = ["A", "B", "C", "D", "E", "F"];
const emptyQuestion = {
  prompt: "",
  type: "MULTIPLE_CHOICE" as QuestionType,
  difficulty: "MEDIUM" as QuestionDifficulty,
  marks: "1",
  subjectId: "",
  topicId: "",
  lessonId: "",
  explanation: "",
  optionTexts: ["", ""] as string[],
  correctOption: "0",
  correctAnswer: "",
};

const typeLabel: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Multiple choice",
  TRUE_FALSE: "True / false",
  SHORT_ANSWER: "Short answer",
  ESSAY: "Essay",
};

export default function QuestionsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draft, setDraft] = useState(emptyQuestion);
  const [selectedEditQuestion, setSelectedEditQuetions] =
    useState<IQuestionRecord | null>(null);

  const subjectsQuery = useAssignedTeacherSubjectsQuery(1, 100);
  const subjects = subjectsQuery.data?.data ?? [];

  const topicsQuery = useAssignedTeacherTopicsQuery(
    1,
    10000,
    undefined,
    draft.subjectId || undefined,
  );
  const topics = topicsQuery.data?.data ?? [];
  const lessonsQuery = useLessonsQuery(1, 100, draft.topicId || undefined);
  const lessons = lessonsQuery.data?.data ?? [];
  const questionsQuery = useQuestionsQuery(page, 10, { search });
  const questions = questionsQuery.data?.data ?? [];
  const total = questionsQuery.data?.pagination.total ?? 0;

  const createMutation = useCreateQuestionMutation();
  const updateMutation = useUpdateQuestionMutation();

  const changeType = (type: QuestionType) => {
    setDraft((current) => ({
      ...current,
      type,
      optionTexts: type === "MULTIPLE_CHOICE" ? ["", ""] : [],
      correctOption: "0",
      correctAnswer: "",
    }));
  };

  const addOption = () => {
    setDraft((current) => ({
      ...current,
      optionTexts: [...current.optionTexts, ""],
    }));
  };

  const removeOption = (index: number) => {
    setDraft((current) => ({
      ...current,
      optionTexts: current.optionTexts.filter(
        (_, optionIndex) => optionIndex !== index,
      ),
      correctOption:
        Number(current.correctOption) === index
          ? "0"
          : Number(current.correctOption) > index
            ? String(Number(current.correctOption) - 1)
            : current.correctOption,
    }));
  };

  const handleEditQuestion = (question: IQuestionRecord) => {
    setSelectedEditQuetions(question);
    setDraft({
      prompt: question.prompt,
      type: question.type as QuestionType,
      difficulty: question.difficulty as QuestionDifficulty,
      marks: String(question.marks),
      subjectId: question.subject.id,
      topicId: question.topic?.id ?? "",
      lessonId: question.lesson?.id ?? "",
      explanation: question.explanation ?? "",
      optionTexts: (question.options ?? []).map((option) =>
        option.label.replace(/^[A-Z]\.\s*/, ""),
      ),
      correctOption: "0",
      correctAnswer:
        question.type === "MULTIPLE_CHOICE"
          ? (question.correctAnswers?.[0] ?? "")
          : (question.correctAnswers?.[0] ?? ""),
    });

    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDraft(emptyQuestion);
    setDialogOpen(false);
  };

  const handleCreate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const options: IQuestionOption[] =
      draft.type === "MULTIPLE_CHOICE"
        ? draft.optionTexts.map((text, index) => ({
            label: `${optionLetters[index]}. ${text.trim()}`,
            value: `option-${index + 1}`,
          }))
        : draft.type === "TRUE_FALSE"
          ? [
              { label: "True", value: "true" },
              { label: "False", value: "false" },
            ]
          : [];

    const correctAnswers =
      draft.type === "MULTIPLE_CHOICE"
        ? [`option-${Number(draft.correctOption) + 1}`]
        : draft.type === "TRUE_FALSE"
          ? [draft.correctAnswer]
          : draft.type === "SHORT_ANSWER"
            ? draft.correctAnswer
                .split("\n")
                .map((answer) => answer.trim())
                .filter(Boolean)
            : [];

    const payload = {
      prompt: draft.prompt.trim(),
      type: draft.type,
      options,
      correctAnswers,
      explanation: draft.explanation.trim() || undefined,
      marks: Number(draft.marks),
      difficulty: draft.difficulty,
      subjectId: draft.subjectId,
      ...(draft.topicId ? { topicId: draft.topicId } : {}),
      ...(draft.lessonId ? { lessonId: draft.lessonId } : {}),
    };

    if (selectedEditQuestion?.id) {
      await updateMutation.mutateAsync({
        payload: payload,
        id: selectedEditQuestion.id,
      });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setDraft(emptyQuestion);
    setDialogOpen(false);
    setPage(1);
  };

  useEffect(() => {
    document.title = `Questions | OpenStudy`;
  }, []);

  return (
    <div className="teacher-page">
      <div className="teacher-page-heading">
        <div>
          <Typography className="teacher-eyebrow">ASSESSMENT CENTER</Typography>
          <Typography component="h2" className="teacher-page-title">
            Question Bank
          </Typography>
          <Typography className="teacher-page-description">
            Create and manage questions for your assigned subjects.
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Create question
        </Button>
      </div>

      {questionsQuery.isError && (
        <Alert severity="error">{errorMessage(questionsQuery.error)}</Alert>
      )}
      <Paper elevation={0} className="teacher-directory-panel">
        <div
          className="teacher-directory-toolbar"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search questions"
            aria-label="Search questions"
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
            {total} questions
          </Typography>
        </div>
        <TableContainer className="teacher-table-container">
          <Table aria-label="Teacher question bank">
            <TableHead>
              <TableRow>
                <TableCell>QUESTION</TableCell>
                <TableCell>SUBJECT / TOPIC</TableCell>
                <TableCell>TYPE</TableCell>
                <TableCell>DIFFICULTY</TableCell>
                <TableCell>MARKS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {questionsQuery.isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    Loading questions…
                  </TableCell>
                </TableRow>
              ) : (
                questions.map((question) => (
                  <TableRow key={question.id} hover>
                    <TableCell
                      sx={{ maxWidth: 420, whiteSpace: "normal", fontSize: 12 }}
                    >
                      <Typography variant="body2">{question.prompt}</Typography>
                    </TableCell>
                    <TableCell>
                      {question.subject.name}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block" }}
                      >
                        {question.topic?.title}
                      </Typography>
                    </TableCell>
                    <TableCell>{typeLabel[question.type]}</TableCell>
                    <TableCell>
                      <Chip label={question.difficulty} size="small" />
                    </TableCell>
                    <TableCell>{question.marks}</TableCell>
                    <TableCell align="right">
                      <Button
                        variant="text"
                        color="success"
                        startIcon={<Edit />}
                        onClick={() => handleEditQuestion(question)}
                      >
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {!questionsQuery.isLoading && questions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="teacher-empty-cell">
                    No questions match your search. Create a question to add it
                    to your bank.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Stack
          direction="row"
          sx={{ justifyContent: "space-between", alignItems: "center", p: 2 }}
        >
          <Typography variant="caption">
            Showing {questions.length} of {total} questions
          </Typography>
          {(questionsQuery.data?.pagination.totalPages ?? 0) > 1 && (
            <Pagination
              count={questionsQuery.data?.pagination.totalPages ?? 1}
              page={page}
              onChange={(_, value) => setPage(value)}
              size="small"
            />
          )}
        </Stack>
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => !createMutation.isPending && setDialogOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <form onSubmit={(event) => void handleCreate(event)}>
          <DialogTitle>
            {selectedEditQuestion?.id ? "Update Question" : "Create Question"}
          </DialogTitle>
          <DialogContent>
            {createMutation.isError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                {errorMessage(createMutation.error)}
              </Alert>
            )}
            {(subjectsQuery.isError || topicsQuery.isError) && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Unable to load your assigned subjects or topics.
              </Alert>
            )}
            {lessonsQuery.isError && (
              <Alert severity="error" sx={{ mt: 1 }}>
                Unable to load lessons for this topic.
              </Alert>
            )}
            <Stack spacing={2} className="teacher-dialog-fields">
              <TextField
                label="Question prompt"
                value={draft.prompt}
                onChange={(event) =>
                  setDraft({ ...draft, prompt: event.target.value })
                }
                required
                multiline
                minRows={2}
                fullWidth
              />
              <div className="teacher-evaluation-form-row">
                <TextField
                  select
                  label="Question type"
                  value={draft.type}
                  onChange={(event) =>
                    changeType(event.target.value as QuestionType)
                  }
                  fullWidth
                >
                  {Object.entries(typeLabel).map(([value, label]) => (
                    <MenuItem key={value} value={value}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Difficulty"
                  value={draft.difficulty}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      difficulty: event.target.value as QuestionDifficulty,
                    })
                  }
                  fullWidth
                >
                  {(["EASY", "MEDIUM", "HARD"] as const).map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Marks"
                  type="number"
                  value={draft.marks}
                  onChange={(event) =>
                    setDraft({ ...draft, marks: event.target.value })
                  }
                  slotProps={{ htmlInput: { min: 1 } }}
                  required
                  fullWidth
                />
              </div>
              <TextField
                select
                label="Assigned subject"
                value={draft.subjectId}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    subjectId: event.target.value,
                    topicId: "",
                    lessonId: "",
                  })
                }
                required
                fullWidth
              >
                {subjects.map((subject: ISubjectRecord) => (
                  <MenuItem
                    key={subject.id ?? subject.id}
                    value={subject.id ?? subject.id}
                  >
                    {subject.name} form {subject.class.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Topic (optional)"
                value={draft.topicId}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    topicId: event.target.value,
                    lessonId: "",
                  })
                }
                disabled={!draft.subjectId}
                fullWidth
              >
                <MenuItem value="">No specific topic</MenuItem>
                {topics.map((topic: ITopicRecord) => (
                  <MenuItem
                    key={topic.id ?? topic.id}
                    value={topic.id ?? topic.id}
                  >
                    {topic.title}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Lesson (optional)"
                value={draft.lessonId}
                onChange={(event) =>
                  setDraft({ ...draft, lessonId: event.target.value })
                }
                disabled={!draft.topicId}
                fullWidth
              >
                <MenuItem value="">No specific lesson</MenuItem>
                {lessons.map((lesson) => (
                  <MenuItem
                    key={lesson.id ?? lesson.id}
                    value={lesson.id ?? lesson.id}
                  >
                    {lesson.title}
                  </MenuItem>
                ))}
              </TextField>

              {/* MULTIPLE CHOICE */}
              {draft.type === "MULTIPLE_CHOICE" && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Answer options</Typography>
                  {draft.optionTexts.map((option, index) => (
                    <Stack
                      key={index}
                      direction="row"
                      spacing={1}
                      sx={{ alignItems: "center" }}
                    >
                      <TextField
                        label={`Option ${optionLetters[index]}`}
                        value={option}
                        onChange={(event) =>
                          setDraft((current) => ({
                            ...current,
                            optionTexts: current.optionTexts.map(
                              (text, optionIndex) =>
                                optionIndex === index
                                  ? event.target.value
                                  : text,
                            ),
                          }))
                        }
                        required
                        fullWidth
                      />
                      <Button
                        color="inherit"
                        disabled={draft.optionTexts.length <= 2}
                        onClick={() => removeOption(index)}
                      >
                        Remove
                      </Button>
                    </Stack>
                  ))}
                  {draft.optionTexts.length < optionLetters.length && (
                    <Button
                      onClick={addOption}
                      sx={{ alignSelf: "flex-start" }}
                    >
                      Add option
                    </Button>
                  )}
                  <TextField
                    select
                    label="Correct answer"
                    value={draft.correctOption}
                    onChange={(event) =>
                      setDraft({ ...draft, correctOption: event.target.value })
                    }
                    required
                  >
                    {draft.optionTexts.map((_, index) => (
                      <MenuItem key={index} value={String(index)}>
                        Option {optionLetters[index]}
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
              )}

              {/* TRUE / FALSE */}
              {draft.type === "TRUE_FALSE" && (
                <TextField
                  select
                  label="Correct answer"
                  value={draft.correctAnswer}
                  onChange={(event) =>
                    setDraft({ ...draft, correctAnswer: event.target.value })
                  }
                  required
                  fullWidth
                >
                  <MenuItem value="true">True</MenuItem>
                  <MenuItem value="false">False</MenuItem>
                </TextField>
              )}

              {/* SHORT ANSWERS */}
              {draft.type === "SHORT_ANSWER" && (
                <TextField
                  label="Accepted answers"
                  value={draft.correctAnswer}
                  onChange={(event) =>
                    setDraft({ ...draft, correctAnswer: event.target.value })
                  }
                  helperText="Enter one accepted answer per line."
                  required
                  multiline
                  minRows={2}
                  fullWidth
                />
              )}

              <TextField
                label="Explanation (optional)"
                value={draft.explanation}
                onChange={(event) =>
                  setDraft({ ...draft, explanation: event.target.value })
                }
                multiline
                minRows={2}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions className="teacher-dialog-actions">
            <Button
              color="inherit"
              onClick={() => handleCloseDialog()}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !draft.subjectId
              }
            >
              {selectedEditQuestion?.id ? (
                <>
                  {updateMutation.isPending ? "Updating..." : "Update question"}
                </>
              ) : (
                <>{createMutation.isPending ? "Saving..." : "Save question"}</>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
