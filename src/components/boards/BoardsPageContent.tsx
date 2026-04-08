"use client";

import { useCallback, useMemo, useRef, useState } from "react";

import BoardEmptyState from "./BoardEmptyState";
import KanbanBoard from "./KanbanBoard";
import BoardShowSidebarFab from "./BoardShowSidebarFab";
import AddTaskModal from "@/components/task/AddTaskModal";
import type { NewTaskPayload } from "@/components/task/AddTaskModal";
import DeleteTaskModal from "@/components/task/DeleteTaskModal";
import EditTaskModal from "@/components/task/EditTaskModal";
import type { EditTaskPayload } from "@/components/task/EditTaskModal";
import ViewTaskModal from "@/components/task/ViewTaskModal";
import MobileNavbar from "@/components/nav/MobileNavbar";
import BoardsSidebar from "@/components/nav/BoardsSidebar";
import DeleteBoardModal from "@/components/board/DeleteBoardModal";
import EditBoardModal from "@/components/board/EditBoardModal";
import type { EditBoardPayload } from "@/components/board/EditBoardModal";
import AddBoardModal from "@/components/board/AddBoardModal";
import type { AddBoardPayload } from "@/components/board/AddBoardModal";
import {
  SAMPLE_COLUMNS,
  type BoardTask,
  type ColumnDefinition,
} from "./boardData";

type ViewTaskState = {
  task: BoardTask;
  statusLabel: string;
  columnId: string;
  taskIndex: number;
};

const CORE_STATUSES = ["Todo", "Doing", "Done"] as const;

const SAMPLE_BOARDS = [
  { id: "platform-launch", name: "Platform Launch" },
  { id: "marketing-plan", name: "Marketing Plan" },
  { id: "roadmap", name: "Roadmap" },
] as const;

function cloneBoard(source: ColumnDefinition[]): ColumnDefinition[] {
  return source.map((c) => ({
    ...c,
    tasks: c.tasks.map((t) => ({
      ...t,
      subtasks: t.subtasks?.map((s) => ({ ...s })),
    })),
  }));
}

export default function BoardsPageContent() {
  const [boards, setBoards] = useState<{ id: string; name: string }[]>([
    ...SAMPLE_BOARDS,
  ]);
  const [columns, setColumns] = useState<ColumnDefinition[] | null>(null);
  const [viewTask, setViewTask] = useState<ViewTaskState | null>(null);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [deleteTaskOpen, setDeleteTaskOpen] = useState(false);
  const [editTaskOpen, setEditTaskOpen] = useState(false);
  const [deleteBoardOpen, setDeleteBoardOpen] = useState(false);
  const [editBoardOpen, setEditBoardOpen] = useState(false);
  const [addBoardOpen, setAddBoardOpen] = useState(false);
  const [boardName, setBoardName] = useState("Platform Launch");
  const [activeBoardId, setActiveBoardId] = useState("platform-launch");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const viewTaskRef = useRef<ViewTaskState | null>(null);
  const columnsRef = useRef<ColumnDefinition[] | null>(null);

  viewTaskRef.current = viewTask;
  columnsRef.current = columns;

  const showSampleBoard = useCallback(() => {
    setColumns(cloneBoard(SAMPLE_COLUMNS));
  }, []);

  const handleAddColumn = useCallback(() => {
    setColumns((prev) => {
      const next = prev ?? [];
      return [
        ...next,
        {
          id: `col-${Date.now()}`,
          title: "New",
          dotClassName: "bg-(--color-text-muted)",
          tasks: [],
        },
      ];
    });
  }, []);

  const handleTaskStatusChange = useCallback((nextTitle: string) => {
    const v = viewTaskRef.current;
    const cols = columnsRef.current;
    if (!v || !cols || v.statusLabel === nextTitle) {
      return;
    }

    const next = cols.map((c) => ({ ...c, tasks: [...c.tasks] }));
    const fromI = next.findIndex((c) => c.id === v.columnId);
    const toI = next.findIndex((c) => c.title === nextTitle);
    if (fromI === -1 || toI === -1) {
      return;
    }

    const fromTasks = next[fromI].tasks;
    if (v.taskIndex < 0 || v.taskIndex >= fromTasks.length) {
      return;
    }

    const [moved] = fromTasks.splice(v.taskIndex, 1);
    next[toI].tasks.push(moved);
    const newColumnId = next[toI].id;
    const newTaskIndex = next[toI].tasks.length - 1;

    setColumns(next);
    setViewTask({
      ...v,
      task: moved,
      statusLabel: nextTitle,
      columnId: newColumnId,
      taskIndex: newTaskIndex,
    });
  }, []);

  const handleDeleteTask = useCallback(() => {
    const v = viewTaskRef.current;
    if (!v) {
      return;
    }
    setColumns((cols) => {
      if (!cols) {
        return cols;
      }
      const next = cloneBoard(cols);
      const col = next.find((c) => c.id === v.columnId);
      if (!col) {
        return cols;
      }
      if (v.taskIndex < 0 || v.taskIndex >= col.tasks.length) {
        return cols;
      }
      col.tasks.splice(v.taskIndex, 1);
      return next;
    });
    setViewTask(null);
  }, []);

  const handleSaveEditTask = useCallback((payload: EditTaskPayload) => {
    const v = viewTaskRef.current;
    if (!v) {
      return;
    }

    setColumns((cols) => {
      if (!cols) {
        return cols;
      }
      const next = cloneBoard(cols);
      const fromI = next.findIndex((c) => c.id === v.columnId);
      const toI = next.findIndex((c) => c.title === payload.status);
      if (fromI === -1 || toI === -1) {
        return cols;
      }

      const fromTasks = next[fromI].tasks;
      if (v.taskIndex < 0 || v.taskIndex >= fromTasks.length) {
        return cols;
      }

      const updated: BoardTask = {
        title: payload.title,
        completedSubtasks: 0,
        totalSubtasks: payload.subtaskLabels.length,
        description: payload.description || undefined,
      };
      if (payload.subtaskLabels.length > 0) {
        updated.subtasks = payload.subtaskLabels.map((label, i) => ({
          id: `edit-${Date.now()}-${i}`,
          label,
          done: false,
        }));
      }

      // Remove old
      fromTasks.splice(v.taskIndex, 1);
      // Add to target
      next[toI].tasks.push(updated);

      // Keep viewTask in sync so ViewTaskModal shows updated content after save
      const newColumnId = next[toI].id;
      const newTaskIndex = next[toI].tasks.length - 1;
      setViewTask({
        ...v,
        task: updated,
        statusLabel: payload.status,
        columnId: newColumnId,
        taskIndex: newTaskIndex,
      });

      return next;
    });

    setEditTaskOpen(false);
  }, []);

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
    setColumns((prev) => {
      const base = prev ? cloneBoard(prev) : cloneBoard(SAMPLE_COLUMNS);
      const col = base.find((c) => c.title === payload.status);
      if (!col) {
        return base;
      }
      const total = payload.subtaskLabels.length;
      const newTask: BoardTask = {
        title: payload.title,
        completedSubtasks: 0,
        totalSubtasks: total,
        description: payload.description || undefined,
      };
      if (total > 0) {
        newTask.subtasks = payload.subtaskLabels.map((label, i) => ({
          id: `new-${Date.now()}-${i}`,
          label,
          done: false,
        }));
      }
      col.tasks.push(newTask);
      return base;
    });
    setAddTaskOpen(false);
  }, []);

  const handleSaveEditBoard = useCallback((payload: EditBoardPayload) => {
    setBoardName(payload.boardName);
    setColumns((prev) => {
      if (!prev) {
        return prev;
      }

      const next = cloneBoard(prev);
      const titles = payload.columnTitles;

      // Keep/relabel existing columns by index; dropped columns are removed (and their tasks are removed too)
      const kept = next.slice(0, titles.length).map((col, idx) => ({
        ...col,
        title: titles[idx]!,
      }));

      // Add new empty columns if user added more titles than existing columns
      for (let i = kept.length; i < titles.length; i++) {
        kept.push({
          id: `col-${Date.now()}-${i}`,
          title: titles[i]!,
          dotClassName: "bg-(--color-text-muted)",
          tasks: [],
        });
      }

      return kept;
    });
    setEditBoardOpen(false);
  }, []);

  const handleConfirmDeleteBoard = useCallback(() => {
    setColumns(null);
    setViewTask(null);
    setAddTaskOpen(false);
    setDeleteTaskOpen(false);
    setEditTaskOpen(false);
    setDeleteBoardOpen(false);
    setEditBoardOpen(false);
  }, []);

  const handleCreateBoard = useCallback((payload: AddBoardPayload) => {
    const id = `board-${Date.now()}`;
    setBoards((prev) => [...prev, { id, name: payload.boardName }]);
    setActiveBoardId(id);
    setBoardName(payload.boardName);
    setViewTask(null);
    setColumns(
      payload.columnTitles.length
        ? payload.columnTitles.map((t, i) => ({
            id: `col-${Date.now()}-${i}`,
            title: t,
            dotClassName: "bg-(--color-text-muted)",
            tasks: [],
          }))
        : null
    );
    setAddBoardOpen(false);
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      {sidebarOpen ? (
        <BoardsSidebar
          boards={boards}
          activeBoardId={activeBoardId}
          onBoardSelect={(boardId) => {
            setActiveBoardId(boardId);
            const b = boards.find((x) => x.id === boardId);
            setBoardName(b?.name ?? "Board");
            setViewTask(null);
            setColumns(
              boardId === "platform-launch" ? cloneBoard(SAMPLE_COLUMNS) : null
            );
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
        <MobileNavbar
          title={boardName}
          boards={boards}
          activeBoardId={activeBoardId}
          showDesktopBrand={!sidebarOpen}
          onBoardSelect={(boardId) => {
            setActiveBoardId(boardId);
            const b = boards.find((x) => x.id === boardId);
            setBoardName(b?.name ?? "Board");
            setViewTask(null);
            setColumns(
              boardId === "platform-launch" ? cloneBoard(SAMPLE_COLUMNS) : null
            );
          }}
          onCreateBoardClick={() => setAddBoardOpen(true)}
          onAddTaskClick={() => setAddTaskOpen(true)}
          onEditBoardClick={() => setEditBoardOpen(true)}
          onDeleteBoardClick={() => setDeleteBoardOpen(true)}
        />

        {columns === null ? (
          <BoardEmptyState onAddColumn={showSampleBoard} />
        ) : (
          <KanbanBoard
            columns={columns}
            onAddColumn={handleAddColumn}
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
        statusLabel={viewTask?.statusLabel ?? ""}
        statusOptions={["Todo", "Doing", "Done"]}
        onStatusChange={handleTaskStatusChange}
        onEditTask={() => setEditTaskOpen(true)}
        onDeleteTask={() => setDeleteTaskOpen(true)}
      />
      <EditTaskModal
        open={editTaskOpen}
        onClose={() => setEditTaskOpen(false)}
        onSave={handleSaveEditTask}
        task={viewTask?.task ?? null}
        status={viewTask?.statusLabel ?? "Todo"}
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
