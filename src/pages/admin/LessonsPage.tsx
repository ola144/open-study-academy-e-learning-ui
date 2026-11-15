/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, type FormEvent } from "react";
import {
  Add,
  ArrowBack,
  DeleteOutlineOutlined,
  EditOutlined,
  MenuBookOutlined,
  PublishOutlined,
  Search,
  UnpublishedOutlined,
  VisibilityOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useParams } from "react-router-dom";
import type {
  ILessonPayload,
  ILessonRecord,
  LessonStatus,
} from "../../api/lesson";
import {
  useCreateLessonMutation,
  useLessonsQuery,
  useUpdateLessonMutation,
  useUpdateLessonStatusMutation,
} from "../../hooks/useLesson";
import { useSingleTopicQuery } from "../../hooks/useTopic";
import "./admin-pages.css";
import "./admin-detail-pages.css";
import { toast } from "react-toastify";
import { useUserQuery } from "../../hooks/useUser";

export type ContentBlockType = "TEXT" | "IMAGE" | "VIDEO" | "LIST";

export interface LessonContentBlock {
  id?: string;
  type: ContentBlockType;
  text: string;
  url?: string;
  caption?: string;
  items: string[];
}

type FormType = {
  title: string;
  summary: string;
  objectives: string[];
  content: LessonContentBlock[];
  estimatedMinutes: number;
};

export default function LessonsPage() {
  const { topicId = "" } = useParams();

  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"" | LessonStatus>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [actionError, setActionError] = useState("");
  const [draft, setDraft] = useState<FormType>({
    title: "",
    summary: "",
    objectives: [""],
    content: [],
    estimatedMinutes: 10,
  });

  const [edit, setEdit] = useState<ILessonRecord | null>(null);

  const topicQuery = useSingleTopicQuery(topicId);
  const lessonsQuery = useLessonsQuery(
    page + 1,
    limit,
    topicId,
    search,
    status || undefined,
  );

  const createLesson = useCreateLessonMutation();
  const updateLesson = useUpdateLessonMutation();
  const updateLessonStatus = useUpdateLessonStatusMutation();

  const lessons = lessonsQuery.data?.data ?? [];

  const { data: currentUser } = useUserQuery();

  const createContentBlock = (
    type: ContentBlockType = "TEXT",
  ): LessonContentBlock => ({
    type,
    text: "",
    url: "",
    caption: "",
    items: [],
  });

  const updateContentBlock = (
    index: number,
    updates: Partial<LessonContentBlock>,
  ) => {
    setDraft((current) => ({
      ...current,
      content: (current.content ?? []).map((block, i) =>
        i === index ? { ...block, ...updates } : block,
      ),
    }));
  };

  const addContentBlock = (type: ContentBlockType = "TEXT") => {
    setDraft((current) => ({
      ...current,
      content: [...(current.content ?? []), createContentBlock(type)],
    }));
  };

  const removeContentBlock = (index: number) => {
    setDraft((current) => ({
      ...current,
      content: (current.content ?? []).filter((_, i) => i !== index),
    }));
  };

  const moveContentBlock = (index: number, direction: -1 | 1) => {
    setDraft((current) => {
      const content = [...(current.content ?? [])];
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= content.length) {
        return current;
      }

      [content[index], content[targetIndex]] = [
        content[targetIndex],
        content[index],
      ];

      return { ...current, content };
    });
  };

  const buildPayload = (): ILessonPayload | undefined => {
    const content = draft.content.map((block) => ({
      ...(block.id ? { id: block.id } : {}),
      type: block.type,
      text: block.text,
      url: block.url || undefined,
      caption: block.caption || undefined,
      items: block.items,
    }));

    const objectives = draft.objectives
      .map((objective) => objective.trim())
      .filter(Boolean);

    if (objectives.length > 20) {
      toast.error("A lesson can have at most 20 learning objectives.");
      return undefined;
    }

    return {
      title: draft.title.trim(),
      topicId: topicId,
      summary: draft.summary.trim() || undefined,
      objectives,
      content,
      estimatedMinutes: Number(draft.estimatedMinutes),
    };
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoading(true);

    const payload = buildPayload();
    console.log(payload);
    if (!payload) return;

    if (edit?.id) {
      updateLesson.mutate(
        { id: edit?.id, payload: payload },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            setDialogOpen(false);
            setDraft({
              title: "",
              summary: "",
              objectives: [],
              content: [],
              estimatedMinutes: 0,
            });
            setPage(0);
          },
          onError: (err: any) => {
            toast.error(err.response?.data.message);
          },
          onSettled: () => {
            setLoading(false);
          },
        },
      );
    } else {
      createLesson.mutate(payload, {
        onSuccess: (res) => {
          toast.success(res.message);
          setDialogOpen(false);
          setDraft({
            title: "",
            summary: "",
            objectives: [],
            content: [],
            estimatedMinutes: 0,
          });
          setPage(0);
        },
        onError: (err: any) => {
          toast.error(err.response?.data.message);
        },
      });
    }
  };

  const handlePublish = (id: string, publish: boolean) => {
    updateLessonStatus.mutate(
      { id, publish },
      {
        onSuccess: (res) => {
          toast.success(res.message);
        },
        onError: (err: any) => {
          toast.error(err.response?.data.message);
        },
      },
    );
  };

  const handleCloseDialog = () => {
    setEdit(null);
    setDraft({
      title: "",
      summary: "",
      objectives: [],
      content: [],
      estimatedMinutes: 10,
    });
    setDialogOpen(false);
  };

  const handleOnEdit = (lesson: any) => {
    setEdit(lesson);
    setDraft({
      title: lesson?.title,
      summary: lesson?.summary,
      objectives: lesson.objectives,
      content: (lesson.content ?? []).map((block: LessonContentBlock) => ({
        id: block.id,
        type: block.type,
        text: block.text ?? "",
        url: block.url ?? "",
        caption: block.caption ?? "",
        items: block.items ?? [],
      })),
      estimatedMinutes: lesson?.estimatedMinutes,
    });
    setDialogOpen(true);
  };

  const topic = topicQuery.data?.data;
  const loadError = topicQuery.error ?? lessonsQuery.error;

  useEffect(() => {
    document.title = `Lessons | OpenStudy`;
  }, []);

  return (
    <div className="admin-page">
      <Button
        component={RouterLink}
        to={
          currentUser?.user?.role === "ADMIN"
            ? `/admin/topics/${topicId}`
            : `/teacher/topics/${topicId}`
        }
        className="admin-detail-back"
        startIcon={<ArrowBack />}
      >
        Topic details
      </Button>

      <div className="admin-page-heading">
        <div>
          <Typography className="admin-eyebrow">
            CURRICULUM · LESSONS
          </Typography>
          <Typography component="h2" className="admin-page-title">
            {topic?.title ?? "Lessons"}
          </Typography>
          <Typography className="admin-page-description">
            {topic
              ? `Manage the lessons in ${topic.title}.`
              : "Create and manage lessons for this topic."}
          </Typography>
        </div>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEdit(null);
            setDraft({
              title: "",
              content: [],
              estimatedMinutes: 10,
              objectives: [],
              summary: "",
            });
            setDialogOpen(true);
          }}
          disabled={!topic?.isActive || topicQuery.isLoading}
        >
          Create lesson
        </Button>
      </div>

      {loadError && (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                void topicQuery.refetch();
                void lessonsQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          {loadError.message}
        </Alert>
      )}
      {!topicQuery.isLoading && !topicQuery.error && !topic && (
        <Alert severity="warning">This topic could not be found.</Alert>
      )}
      {topic && !topic.isActive && (
        <Alert severity="warning">
          This topic is inactive. Activate it before adding lessons.
        </Alert>
      )}
      {actionError && (
        <Alert severity="error" onClose={() => setActionError("")}>
          {actionError}
        </Alert>
      )}

      <Paper className="admin-directory-panel" elevation={0}>
        <div className="admin-directory-toolbar">
          <TextField
            size="small"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(0);
            }}
            placeholder="Search lessons"
            aria-label="Search lessons"
            className="admin-search-field"
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
          <TextField
            select
            size="small"
            label="Status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "" | LessonStatus);
              setPage(0);
            }}
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            <MenuItem value="DRAFT">Draft</MenuItem>
            <MenuItem value="PUBLISHED">Published</MenuItem>
          </TextField>
        </div>
        <TableContainer>
          <Table aria-label="Topic lessons">
            <TableHead>
              <TableRow>
                <TableCell>LESSON</TableCell>
                <TableCell>OBJECTIVES</TableCell>
                <TableCell>DURATION</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell>DETAILS</TableCell>
                <TableCell align="right">ACTIONS</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lessons.map((lesson) => {
                const id = lesson.id ?? lesson.id ?? "";
                const published = lesson.status === "PUBLISHED";
                return (
                  <TableRow key={id} hover>
                    <TableCell>
                      <div className="admin-person-cell">
                        <MenuBookOutlined color="action" />
                        <div>
                          <strong>{lesson.title}</strong>
                          <span>{lesson.summary || "No summary"}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{lesson.objectives?.length ?? 0}</TableCell>
                    <TableCell>{lesson.estimatedMinutes} min</TableCell>
                    <TableCell>
                      <Chip
                        label={published ? "Published" : "Draft"}
                        size="small"
                        className={`admin-status-chip ${published ? "published" : "draft"}`}
                      />
                    </TableCell>

                    <TableCell>
                      <Button
                        component={RouterLink}
                        to={
                          currentUser?.user?.role === "ADMIN"
                            ? `/admin/topics/${topicId}/lessons/${id}`
                            : `/teacher/topics/${topicId}/lessons/${id}`
                        }
                        size="small"
                        startIcon={<VisibilityOutlined />}
                        disabled={!id}
                      >
                        Details
                      </Button>
                    </TableCell>

                    <TableCell align="right">
                      <Button
                        size="small"
                        startIcon={
                          published ? (
                            <UnpublishedOutlined />
                          ) : (
                            <PublishOutlined />
                          )
                        }
                        onClick={() => void handlePublish(id, !published)}
                        disabled={
                          updateLessonStatus.isPending ||
                          (!published && lesson.content.length === 0)
                        }
                        aria-label={`${published ? "Unpublish" : "Publish"} ${lesson.title}`}
                      >
                        {published ? "Unpublish" : "Publish"}
                      </Button>
                      {lesson.status === "DRAFT" && (
                        <Button
                          size="small"
                          startIcon={<EditOutlined />}
                          onClick={() => handleOnEdit(lesson)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {lessonsQuery.isLoading && (
                <TableRow>
                  <TableCell colSpan={6} className="admin-empty-cell">
                    <CircularProgress size={24} aria-label="Loading lessons" />
                  </TableCell>
                </TableRow>
              )}
              {!lessonsQuery.isLoading && lessons.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="admin-empty-cell">
                    No lessons found. Create the first lesson for this topic.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={lessonsQuery.data?.pagination?.total ?? 0}
          page={page}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={limit}
          onRowsPerPageChange={(event) => {
            setLimit(Number(event.target.value));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => !createLesson.isPending && handleCloseDialog()}
        fullWidth
        maxWidth="md"
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle>Create a lesson</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              New lessons start as drafts. Add lesson content before publishing.
            </Typography>

            <Stack spacing={2} sx={{ pt: 1 }}>
              <TextField
                label="Lesson title"
                value={draft.title}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                slotProps={{ htmlInput: { minLength: 2, maxLength: 200 } }}
                required
                fullWidth
              />
              <TextField
                label="Summary"
                value={draft.summary}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    summary: event.target.value,
                  }))
                }
                slotProps={{ htmlInput: { maxLength: 2000 } }}
                multiline
                minRows={2}
                fullWidth
              />
              <TextField
                label="Learning objectives"
                value={(draft.objectives ?? []).join("\n")}
                onChange={(event) => {
                  const text = event.target.value;

                  setDraft((current) => ({
                    ...current,
                    objectives: text.split(/\r?\n/),
                  }));
                }}
                helperText="Enter one objective per line (up to 20)."
                multiline
                minRows={3}
                fullWidth
              />
              <TextField
                label="Estimated duration (minutes)"
                type="number"
                value={draft.estimatedMinutes}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    estimatedMinutes: Number(event.target.value),
                  }))
                }
                slotProps={{ htmlInput: { min: 1, max: 600, step: 1 } }}
                required
                fullWidth
              />

              <Box sx={{ mt: 3 }}>
                <Stack
                  direction="row"
                  sx={{
                    mb: 2,
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography variant="h6">Lesson content</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Add text, images, videos, or lists to your lesson.
                    </Typography>
                  </Box>

                  <Button
                    startIcon={<Add />}
                    variant="contained"
                    onClick={() => addContentBlock("TEXT")}
                  >
                    Add block
                  </Button>
                </Stack>

                {(draft.content ?? []).map((block, index) => (
                  <Paper
                    key={block.id ?? `content-${index}`}
                    variant="outlined"
                    sx={{ p: 2, mb: 2 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mb: 2, alignItems: "center" }}
                    >
                      <Typography sx={{ flexGrow: 1, fontWeight: 680 }}>
                        Content block {index + 1}
                      </Typography>

                      <IconButton
                        aria-label="Move block up"
                        disabled={index === 0}
                        onClick={() => moveContentBlock(index, -1)}
                      >
                        ↑
                      </IconButton>

                      <IconButton
                        aria-label="Move block down"
                        disabled={index === (draft.content?.length ?? 0) - 1}
                        onClick={() => moveContentBlock(index, 1)}
                      >
                        ↓
                      </IconButton>

                      <IconButton
                        aria-label="Remove block"
                        color="error"
                        onClick={() => removeContentBlock(index)}
                      >
                        <DeleteOutlineOutlined />
                      </IconButton>
                    </Stack>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel id={`content-type-${index}`}>
                        Content type
                      </InputLabel>

                      <Select
                        labelId={`content-type-${index}`}
                        label="Content type"
                        value={block.type}
                        onChange={(event) => {
                          const type = event.target.value as ContentBlockType;

                          updateContentBlock(index, {
                            ...createContentBlock(type),
                            id: block.id,
                          });
                        }}
                      >
                        <MenuItem value="TEXT">Text</MenuItem>
                        <MenuItem value="IMAGE">Image</MenuItem>
                        <MenuItem value="VIDEO">Video</MenuItem>
                        <MenuItem value="LIST">List</MenuItem>
                      </Select>
                    </FormControl>

                    <Stack spacing={2}>
                      <TextField
                        label={
                          block.type === "LIST"
                            ? "Heading or description"
                            : "Text content"
                        }
                        value={block.text ?? ""}
                        onChange={(event) =>
                          updateContentBlock(index, {
                            text: event.target.value,
                          })
                        }
                        multiline
                        minRows={block.type === "TEXT" ? 5 : 2}
                        fullWidth
                      />

                      {(block.type === "IMAGE" || block.type === "VIDEO") && (
                        <>
                          <TextField
                            label={
                              block.type === "IMAGE" ? "Image URL" : "Video URL"
                            }
                            value={block.url ?? ""}
                            onChange={(event) =>
                              updateContentBlock(index, {
                                url: event.target.value,
                              })
                            }
                            placeholder={
                              block.type === "IMAGE"
                                ? "https://example.com/image.jpg"
                                : "https://example.com/video"
                            }
                            fullWidth
                          />

                          <TextField
                            label="Caption"
                            value={block.caption ?? ""}
                            onChange={(event) =>
                              updateContentBlock(index, {
                                caption: event.target.value,
                              })
                            }
                            fullWidth
                          />
                        </>
                      )}

                      {block.type === "LIST" && (
                        <TextField
                          label="List items"
                          value={(block.items ?? []).join("\n")}
                          onChange={(event) =>
                            updateContentBlock(index, {
                              items: event.target.value.split(/\r?\n/),
                            })
                          }
                          helperText="Enter one item per line. Empty lines are allowed while editing."
                          multiline
                          minRows={4}
                          fullWidth
                        />
                      )}
                    </Stack>
                  </Paper>
                ))}

                {(draft.content ?? []).length === 0 && (
                  <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      No content blocks yet. Add a block to start building your
                      lesson.
                    </Typography>

                    <Button
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => addContentBlock("TEXT")}
                    >
                      Add first block
                    </Button>
                  </Paper>
                )}
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions className="admin-dialog-actions">
            <Button
              onClick={() => setDialogOpen(false)}
              disabled={createLesson.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={createLesson.isPending || !topic?.isActive || loading}
            >
              {edit?.id ? (
                <>
                  {createLesson.isPending || loading
                    ? "Updating..."
                    : "Update draft lessson"}
                </>
              ) : (
                <>
                  {createLesson.isPending || loading
                    ? "Creating..."
                    : "Create draft lesson"}
                </>
              )}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
