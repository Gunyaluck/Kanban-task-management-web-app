"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import BoardEmptyState from "./BoardEmptyState";
import KanbanBoard from "./KanbanBoard";
import BoardShowSidebarFab from "./BoardShowSidebarFab";
import AddTaskModal from "@/components/task/AddTaskModal";
import type { NewTaskPayload } from "@/components/task/AddTaskModal";
import DeleteTaskModal from "@/components/task/DeleteTaskModal";
import EditTaskModal from "@/components/task/EditTaskModal";
import type { EditTaskPayload } from "@/components/task/EditTaskModal";
import ViewTaskModal from "@/components/task/ViewTaskModal";
import Navbar from "@/components/nav/Navbar";
import BoardsSidebar from "@/components/nav/BoardsSidebar";
import DeleteBoardModal from "@/components/board/DeleteBoardModal";
import EditBoardModal from "@/components/board/EditBoardModal";
import type { EditBoardPayload } from "@/components/board/EditBoardModal";
import AddBoardModal from "@/components/board/AddBoardModal";
import type { AddBoardPayload } from "@/components/board/AddBoardModal";
import {
  type BoardTask,
  type ColumnDefinition,
} from "./boardData";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  createBoard,
  createColumn,
  createTask,
  deleteBoard,
  deleteColumn,
  deleteTask,
  getBoard,
  listBoards,
  patchBoard,
  patchColumn,
  patchSubtask,
  reorderTasks,
  patchTask,
} from "@/services/kanban";

type ViewTaskState = {
  task: BoardTask;
  statusLabel: string;
  columnId: string;
  taskIndex: number;
};

const CORE_STATUSES = ["Todo", "Doing", "Done"] as const;

function mapBoardToColumns(res: Awaited<ReturnType<typeof getBoard>>) {
  const getDotClassName = (title: string) => {
    const t = title.trim().toLowerCase();
    if (t === "todo") return "bg-(--col-dot-cyan)";
    if (t === "doing") return "bg-(--col-dot-purple)";
    if (t === "done") return "bg-(--col-dot-green)";
    return "bg-(--color-text-muted)";
  };

  return res.board.columns.map((col) => ({
    id: col.id,
    title: col.name,
    dotClassName: col.color ?? getDotClassName(col.name),
    tasks: col.tasks.map((t) => ({
      id: t.id,
      title: t.title,
      completedSubtasks: t.subtasks?.filter((s) => s.isCompleted).length ?? 0,
      totalSubtasks: t.subtasks?.length ?? 0,
      description: t.description ?? undefined,
      subtasks: t.subtasks?.map((s) => ({
        id: s.id,
        label: s.title,
        done: s.isCompleted,
      })),
    })),
  })) satisfies ColumnDefinition[];
}

export default function BoardsPageContent() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([]);
  const [columns, setColumns] = useState<ColumnDefinition[] | null>(null);
  const [viewTask, setViewTask] = useState<ViewTaskState | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [addBoardOpen, setAddBoardOpen] = useState(false);
  const [boardName, setBoardName] = useState("Board");
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loadingBoard, setLoadingBoard] = useState(false);
  const [loadingBoards, setLoadingBoards] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const viewTaskRef = useRef<ViewTaskState | null>(null);
  const columnsRef = useRef<ColumnDefinition[] | null>(null);

  viewTaskRef.current = viewTask;
  columnsRef.current = columns;
  accessTokenRef.current = accessToken;

  const viewTaskStatusFromColumn =
    (viewTask?.columnId
      ? columns?.find((c) => c.id === viewTask.columnId)?.title
      : null) ?? null;

  const refreshBoards = useCallback(
    async (token: string) => {
      setLoadingBoards(true);
      setLoadError(null);
      try {
        const res = await listBoards(token);
        const nextBoards = res.boards.map((b) => ({ id: b.id, name: b.name }));
        setBoards(nextBoards);
        return nextBoards;
      } catch (e) {
        setBoards([]);
        setColumns(null);
        setActiveBoardId(null);
        setBoardName("Board");
        setLoadError(e instanceof Error ? e.message : "Failed to load boards");
        return [];
      } finally {
        setLoadingBoards(false);
      }
    },
    []
  );

  const refreshActiveBoard = useCallback(
    async (token: string, boardId: string) => {
      setLoadingBoard(true);
      setLoadError(null);
      try {
        const res = await getBoard(token, boardId);
        setBoardName(res.board.name);
        setColumns(mapBoardToColumns(res));
      } catch (e) {
        setColumns(null);
        setLoadError(e instanceof Error ? e.message : "Failed to load board");
      } finally {
        setLoadingBoard(false);
      }
    },
    []
  );

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token ?? null;
      if (cancelled) return;

      setAccessToken(token);
      accessTokenRef.current = token;
      if (!token) {
        setBoards([]);
        setColumns(null);
        setActiveBoardId(null);
        setBoardName("Board");
        setLoadError("You are not logged in.");
        return;
      }

      const nextBoards = await refreshBoards(token);
      if (cancelled) return;

      const nextActive = nextBoards[0]?.id ?? null;
      setActiveBoardId(nextActive);
      if (nextActive) {
        await refreshActiveBoard(token, nextActive);
      } else {
        setColumns([]);
      }
    })();

    const supabase = createSupabaseBrowserClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextToken = session?.access_token ?? null;
      setAccessToken(nextToken);
      accessTokenRef.current = nextToken;
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, [refreshActiveBoard, refreshBoards]);

  const handleAddColumn = useCallback(() => {
    const token = accessTokenRef.current;
    const boardId = activeBoardId;
    if (!token || !boardId) return;

    (async () => {
      const position = columnsRef.current?.length ?? 0;
      await createColumn(token, boardId, {
        name: "New Column",
        color: "bg-(--color-text-muted)",
        position,
      });
      await refreshActiveBoard(token, boardId);
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to add column");
    });
  }, [accessToken, activeBoardId, refreshActiveBoard]);

  const handleTaskStatusChange = useCallback((nextTitle: string) => {
    const v = viewTaskRef.current;
    const cols = columnsRef.current;
    const token = accessTokenRef.current;
    if (!v || !cols || v.statusLabel === nextTitle || !token) {
      return;
    }

    const taskId = v.task.id;
    const targetCol = cols.find((c) => c.title === nextTitle);
    if (!taskId || !targetCol) return;

    (async () => {
      const nextPosition = targetCol.tasks.length;
      await patchTask(token, taskId, { columnId: targetCol.id, position: nextPosition });
      if (activeBoardId) {
        await refreshActiveBoard(token, activeBoardId);
      }
      setViewTask(null);
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to move task");
    });
  }, [activeBoardId, refreshActiveBoard]);

  const handleDeleteTask = useCallback(() => {
    const v = viewTaskRef.current;
    const token = accessTokenRef.current;
    if (!v || !token) {
      return;
    }
    const taskId = v.task.id;
    if (!taskId) return;

    (async () => {
      await deleteTask(token, taskId);
      if (activeBoardId) {
        await refreshActiveBoard(token, activeBoardId);
      }
      setViewTask(null);
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to delete task");
    });
  }, [activeBoardId, refreshActiveBoard]);

  const handleSaveEditTask = useCallback((payload: EditTaskPayload) => {
    const v = viewTaskRef.current;
    const token = accessTokenRef.current;
    const cols = columnsRef.current;
    if (!v || !token || !cols) {
      return;
    }

    const taskId = v.task.id;
    const targetCol = cols.find((c) => c.title === payload.status);
    if (!taskId || !targetCol) return;

    (async () => {
      await patchTask(token, taskId, {
        title: payload.title,
        description: payload.description || null,
        columnId: targetCol.id,
        subtasks: payload.subtaskLabels.map((title, idx) => ({
          title,
          position: idx,
        })),
      });
      if (activeBoardId) {
        await refreshActiveBoard(token, activeBoardId);
      }
      setEditTaskOpen(false);
      setViewTask(null);
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to save task");
    });
  }, [activeBoardId, refreshActiveBoard]);

  const statusOptionsForAdd = useMemo(() => {
    if (!columns) {
      return [...CORE_STATUSES];
    }
    const extra = columns
      .map((c) => c.title)
      .filter((t) => !CORE_STATUSES.includes(t as (typeof CORE_STATUSES)[number]));
    return [...CORE_STATUSES, ...extra];
  }, [columns]);

  const handleCreateTask = useCallback((payload: NewTaskPayload) => {
    const token = accessTokenRef.current;
    const boardId = activeBoardId;
    const cols = columnsRef.current;
    if (!token || !boardId || !cols) return;

    const col = cols.find((c) => c.title === payload.status);
    if (!col) return;

    (async () => {
      await createTask(token, {
        columnId: col.id,
        title: payload.title,
        description: payload.description || null,
        subtasks: payload.subtaskLabels.map((title, idx) => ({
          title,
          position: idx,
        })),
        position: col.tasks.length,
      });
      await refreshActiveBoard(token, boardId);
      setAddTaskOpen(false);
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to create task");
    });
  }, [activeBoardId, refreshActiveBoard]);

  const handleSaveEditBoard = useCallback((payload: EditBoardPayload) => {
    const token = accessTokenRef.current;
    const boardId = activeBoardId;
    const prevCols = columnsRef.current;
    if (!token || !boardId || !prevCols) return;

    (async () => {
      await patchBoard(token, boardId, { name: payload.boardName });

      const nextCols = payload.columns.map((c, idx) => ({
        name: c.title,
        color: c.dotClassName,
        position: idx,
      }));

      // Update existing columns by index
      for (let i = 0; i < Math.min(prevCols.length, nextCols.length); i++) {
        await patchColumn(token, prevCols[i]!.id, {
          name: nextCols[i]!.name,
          color: nextCols[i]!.color,
          position: nextCols[i]!.position,
        });
      }

      // Delete extra columns
      for (let i = nextCols.length; i < prevCols.length; i++) {
        await deleteColumn(token, prevCols[i]!.id);
      }

      // Create new columns
      for (let i = prevCols.length; i < nextCols.length; i++) {
        await createColumn(token, boardId, nextCols[i]!);
      }

      await refreshBoards(token);
      await refreshActiveBoard(token, boardId);
      setEditBoardOpen(false);
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to save board");
    });
  }, [activeBoardId, refreshActiveBoard, refreshBoards]);

  const handleConfirmDeleteBoard = useCallback(() => {
    const token = accessTokenRef.current;
    const boardId = activeBoardId;
    if (!token || !boardId) return;

    (async () => {
      await deleteBoard(token, boardId);
      const nextBoards = await refreshBoards(token);
      const nextActive = nextBoards[0]?.id ?? null;
      setActiveBoardId(nextActive);
      setViewTask(null);
      setAddTaskOpen(false);
      setDeleteTaskOpen(false);
      setEditTaskOpen(false);
      setDeleteBoardOpen(false);
      setEditBoardOpen(false);
      if (nextActive) {
        await refreshActiveBoard(token, nextActive);
      } else {
        setColumns([]);
        setBoardName("Board");
      }
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to delete board");
    });
  }, [activeBoardId, refreshActiveBoard, refreshBoards]);

  const handleCreateBoard = useCallback((payload: AddBoardPayload) => {
    const token = accessTokenRef.current;
    if (!token) return;

    (async () => {
      const res = await createBoard(token, {
        name: payload.boardName,
        columns: payload.columns.map((c, idx) => ({
          name: c.title,
          color: c.dotClassName,
          position: idx,
        })),
      });

      const nextBoards = await refreshBoards(token);
      // try to select the newest board (first in updatedAt desc) — otherwise fallback
      const nextActive = nextBoards[0]?.id ?? null;
      setActiveBoardId(nextActive);
      setViewTask(null);
      setAddBoardOpen(false);
      if (nextActive) {
        await refreshActiveBoard(token, nextActive);
      } else {
        setColumns([]);
      }
      void res;
    })().catch((e) => {
      setLoadError(e instanceof Error ? e.message : "Failed to create board");
    });
  }, [refreshActiveBoard, refreshBoards]);

  const handleCreateFirstBoard = useCallback(() => {
    const token = accessTokenRef.current;
    if (!token) return;

    setLoadError(null);
    (async () => {
      await createBoard(token, { name: "My First Board" });
      const nextBoards = await refreshBoards(token);
      const nextActive = nextBoards[0]?.id ?? null;
      setActiveBoardId(nextActive);
      setViewTask(null);
      if (nextActive) {
        await refreshActiveBoard(token, nextActive);
      } else {
        setColumns([]);
      }
    })().catch((e) => {
      setLoadError(
        e instanceof Error ? e.message : "Failed to create your first board"
      );
    });
  }, [refreshActiveBoard, refreshBoards]);

  return (
    <div className="flex min-h-screen w-full">
      {sidebarOpen ? (
        <BoardsSidebar
          boards={boards}
          activeBoardId={activeBoardId ?? ""}
          onBoardSelect={(boardId) => {
            const token = accessTokenRef.current;
            if (!token) return;
            setActiveBoardId(boardId);
            setViewTask(null);
            void refreshActiveBoard(token, boardId);
          }}
          onCreateBoardClick={() => setAddBoardOpen(true)}
          onHideSidebar={() => setSidebarOpen(false)}
        />
      ) : (
        <div className="hidden md:block">
          <BoardShowSidebarFab onClick={() => setSidebarOpen(true)} />
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar
          title={boardName}
          boards={boards}
          activeBoardId={activeBoardId ?? ""}
          showDesktopBrand={!sidebarOpen}
          onBoardSelect={(boardId) => {
            const token = accessTokenRef.current;
            if (!token) return;
            setActiveBoardId(boardId);
            setViewTask(null);
            void refreshActiveBoard(token, boardId);
          }}
          onCreateBoardClick={() => setAddBoardOpen(true)}
          onAddTaskClick={() => setAddTaskOpen(true)}
          onEditBoardClick={() => setEditBoardOpen(true)}
          onDeleteBoardClick={() => setDeleteBoardOpen(true)}
        />

        {loadError ? (
          <div className="px-4 py-6 text-(--color-danger) text-sm font-medium">
            {loadError}
          </div>
        ) : loadingBoards || loadingBoard ? (
          <section className="grid min-h-[calc(100vh-64px)] place-items-center px-4">
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-token border-t-(--color-primary)" />
              <p className="text-muted text-sm font-medium">
                Loading board…
              </p>
            </div>
          </section>
        ) : boards.length === 0 ? (
          <BoardEmptyState variant="no-boards" onCreateBoard={handleCreateFirstBoard} />
        ) : columns === null || columns.length === 0 ? (
          <BoardEmptyState variant="no-columns" onAddColumn={handleAddColumn} />
        ) : (
          <KanbanBoard
            columns={columns}
            onAddColumn={handleAddColumn}
            onMoveTask={({ taskId, fromColumnId, toColumnId, toIndex }) => {
              const token = accessTokenRef.current;
              const boardId = activeBoardId;
              const cols = columnsRef.current;
              if (!token || !boardId || !cols) return;

              // Build next columns state (optimistic)
              const next = cols.map((c) => ({ ...c, tasks: [...c.tasks] }));
              const fromCol = next.find((c) => c.id === fromColumnId);
              const toCol = next.find((c) => c.id === toColumnId);
              if (!fromCol || !toCol) return;

              const fromIndex = fromCol.tasks.findIndex((t) => t.id === taskId);
              if (fromIndex === -1) return;

              const [moved] = fromCol.tasks.splice(fromIndex, 1);
              const safeIndex = Math.max(0, Math.min(toIndex, toCol.tasks.length));
              toCol.tasks.splice(safeIndex, 0, moved);

              setColumns(next);
              setViewTask((prev) => {
                if (!prev || prev.task.id !== taskId) return prev;
                return {
                  ...prev,
                  statusLabel: toCol.title,
                  columnId: toCol.id,
                  taskIndex: safeIndex,
                };
              });

              const updates: { taskId: string; columnId: string; position: number }[] =
                [];
              for (const c of next) {
                if (c.id !== fromColumnId && c.id !== toColumnId) continue;
                c.tasks.forEach((t, idx) => {
                  updates.push({ taskId: t.id, columnId: c.id, position: idx });
                });
              }

              void reorderTasks(token, updates)
                .then(() => refreshActiveBoard(token, boardId))
                .catch((e) =>
                  setLoadError(
                    e instanceof Error ? e.message : "Failed to reorder tasks"
                  )
                );
            }}
            onTaskClick={(task, statusLabel, columnId, taskIndex) =>
              setViewTask({ task, statusLabel, columnId, taskIndex })
            }
          />
        )}
      </div>
      <ViewTaskModal
        open={viewTask !== null}
        onClose={() => setViewTask(null)}
        task={viewTask?.task ?? null}
        statusLabel={viewTaskStatusFromColumn || viewTask?.statusLabel || "Todo"}
        statusOptions={["Todo", "Doing", "Done"]}
        onStatusChange={handleTaskStatusChange}
        onToggleSubtask={(subtaskId, nextDone) => {
          const token = accessTokenRef.current;
          const boardId = activeBoardId;
          if (!token || !boardId) return;

          // Optimistic UI update
          setViewTask((prev) => {
            if (!prev?.task.subtasks?.length) return prev;
            const next = {
              ...prev,
              task: {
                ...prev.task,
                subtasks: prev.task.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, done: nextDone } : s
                ),
              },
            };
            return next;
          });
          setColumns((prev) => {
            if (!prev) return prev;
            return prev.map((c) => ({
              ...c,
              tasks: c.tasks.map((t) => {
                if (t.id !== viewTaskRef.current?.task.id) return t;
                if (!t.subtasks?.length) return t;
                const nextSubtasks = t.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, done: nextDone } : s
                );
                return {
                  ...t,
                  subtasks: nextSubtasks,
                  completedSubtasks: nextSubtasks.filter((s) => s.done).length,
                  totalSubtasks: nextSubtasks.length,
                };
              }),
            }));
          });

          void patchSubtask(token, subtaskId, { isCompleted: nextDone })
            .then(() => refreshActiveBoard(token, boardId))
            .catch((e) =>
              setLoadError(
                e instanceof Error ? e.message : "Failed to update subtask"
              )
            );
        }}
        onEditTask={() => setEditTaskOpen(true)}
        onDeleteTask={() => setDeleteTaskOpen(true)}
      />
      <EditTaskModal
        open={editTaskOpen}
        onClose={() => setEditTaskOpen(false)}
        onSave={handleSaveEditTask}
        task={viewTask?.task ?? null}
        status={viewTaskStatusFromColumn || viewTask?.statusLabel || "Todo"}
        statusOptions={statusOptionsForAdd}
      />
      <DeleteTaskModal
        open={deleteTaskOpen}
        taskTitle={viewTask?.task.title ?? ""}
        onCancel={() => setDeleteTaskOpen(false)}
        onConfirm={() => {
          setDeleteTaskOpen(false);
          handleDeleteTask();
        }}
      />
      <EditBoardModal
        open={editBoardOpen}
        onClose={() => setEditBoardOpen(false)}
        onSave={handleSaveEditBoard}
        boardName={boardName}
        columns={columns}
      />
      <DeleteBoardModal
        open={deleteBoardOpen}
        boardName={boardName}
        onCancel={() => setDeleteBoardOpen(false)}
        onConfirm={handleConfirmDeleteBoard}
      />
      <AddBoardModal
        open={addBoardOpen}
        onClose={() => setAddBoardOpen(false)}
        onCreate={handleCreateBoard}
      />
      <AddTaskModal
        open={addTaskOpen}
        onClose={() => setAddTaskOpen(false)}
        onCreate={handleCreateTask}
        statusOptions={statusOptionsForAdd}
      />
    </div>
  );
}
