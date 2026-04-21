"use client";

import { useEffect, useMemo } from "react";

import {
  getTaskSubtasksForModal,
  type BoardTask,
} from "@/components/boards/boardData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ViewTaskModalProps = {
  open: boolean;
  onClose: () => void;
  task: BoardTask | null;
  columnId: string;
  statusOptions?: { value: string; label: string }[];
  onStatusChange?: (nextColumnId: string) => void;
  onToggleSubtask?: (subtaskId: string, nextDone: boolean) => void;
  onEditTask?: () => void;
  onDeleteTask?: () => void;
};

export default function ViewTaskModal({
  open,
  onClose,
  task,
  columnId,
  statusOptions = [],
  onStatusChange,
  onToggleSubtask,
  onEditTask,
  onDeleteTask,
}: ViewTaskModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  const selectOptions = useMemo(() => {
    if (columnId && !statusOptions.some((o) => o.value === columnId)) {
      return [{ value: columnId, label: "Current" }, ...statusOptions];
    }
    return statusOptions;
  }, [columnId, statusOptions]);

  if (!open || task === null) {
    return null;
  }

  const subtasks = getTaskSubtasksForModal(task);
  const doneCount = subtasks.filter((s) => s.done).length;
  const totalCount = subtasks.length;
  const description =
    task.description?.trim() ||
    "No description has been added for this task yet.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="view-task-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close task details"
        onClick={onClose}
      />

      <div
        className="surface relative z-10 flex max-h-[min(90vh,100%)] w-full max-w-[480px] flex-col rounded-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex flex-col gap-6 overflow-y-auto p-6">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="view-task-modal-title"
              className="text-lg font-bold leading-6"
            >
              {task.title}
            </h2>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="text-muted hover:text-(--color-text) shrink-0 rounded p-1 pt-1 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 hover:cursor-pointer"
                  aria-label="Task options"
                >
                  <img
                    src="/icons/icon-vertical-ellipsis.svg"
                    alt="More options"
                    width={5}
                    height={20}
                    className="h-5 w-[5px]"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent sideOffset={8} align="end">
                <DropdownMenuItem
                  className="text-muted data-highlighted:text-(--color-text)"
                  onSelect={() => onEditTask?.()}
                >
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-(--color-danger) data-highlighted:bg-(--color-surface-2) data-highlighted:text-(--color-danger)"
                  onSelect={() => onDeleteTask?.()}
                >
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p className="text-muted text-sm leading-[23px] font-medium">
            {description}
          </p>

          {totalCount > 0 ? (
            <div className="flex flex-col gap-4">
              <p className="text-muted text-xs font-bold">
                Subtasks ({doneCount} of {totalCount})
              </p>
              <ul className="flex flex-col gap-2">
                {subtasks.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-4 rounded-sm bg-[#F4F7FD] px-3 py-3 text-left transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 dark:bg-(--color-surface-2) hover:cursor-pointer"
                      role="checkbox"
                      aria-checked={item.done}
                      aria-label={`Toggle subtask: ${item.label}`}
                      onClick={() => onToggleSubtask?.(item.id, !item.done)}
                    >
                      <span
                        className={`grid h-4 w-4 shrink-0 place-items-center rounded border-2 ${
                          item.done
                            ? "border-(--color-primary) bg-(--color-primary)"
                            : "border-token bg-(--color-surface)"
                        }`}
                        aria-hidden
                      >
                        {item.done ? (
                          <img
                            src="/icons/icon-check.svg"
                            alt="Completed subtask"
                            width={10}
                            height={8}
                            className="h-2 w-2.5"
                          />
                        ) : null}
                      </span>
                      <span
                        className={`text-[12px] font-bold leading-4 ${
                          item.done
                            ? "text-muted line-through opacity-50"
                            : ""
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label
              htmlFor="task-status-select"
              className="text-muted text-xs font-bold"
            >
              Current Status
            </label>
            <Select
              value={columnId}
              onValueChange={(next) => onStatusChange?.(next)}
              disabled={!onStatusChange}
            >
              <SelectTrigger id="task-status-select" className="w-full hover:cursor-pointer">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}
