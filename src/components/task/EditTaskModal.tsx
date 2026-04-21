"use client";

import { useEffect, useMemo, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BoardTask } from "@/components/boards/boardData";

export type EditTaskPayload = {
  title: string;
  description: string;
  subtaskLabels: string[];
  columnId: string;
};

export type StatusOption = { value: string; label: string };

type EditTaskModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: EditTaskPayload) => void;
  task: BoardTask | null;
  columnId: string;
  statusOptions?: StatusOption[];
};

const inputClassName =
  "w-full rounded border border-token bg-(--color-surface) px-4 py-3 text-sm font-medium text-(--color-text) placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2";

function taskToDraftSubtasks(task: BoardTask): string[] {
  if (task.subtasks?.length) {
    return task.subtasks.map((s) => s.label);
  }
  if (task.totalSubtasks > 0) {
    return Array.from({ length: task.totalSubtasks }, () => "");
  }
  return [];
}

export default function EditTaskModal({
  open,
  onClose,
  onSave,
  task,
  columnId,
  statusOptions = [],
}: EditTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subtaskDrafts, setSubtaskDrafts] = useState<string[]>([]);
  const [nextColumnId, setNextColumnId] = useState(
    statusOptions[0]?.value ?? ""
  );

  const selectOptions = useMemo(() => {
    if (columnId && !statusOptions.some((o) => o.value === columnId)) {
      return [{ value: columnId, label: "Current" }, ...statusOptions];
    }
    return statusOptions;
  }, [columnId, statusOptions]);

  const effectiveColumnId = useMemo(() => {
    if (nextColumnId && selectOptions.some((o) => o.value === nextColumnId)) {
      return nextColumnId;
    }
    if (columnId && selectOptions.some((o) => o.value === columnId)) {
      return columnId;
    }
    return selectOptions[0]?.value ?? "";
  }, [nextColumnId, selectOptions, columnId]);

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

  useEffect(() => {
    if (!open || !task) {
      return;
    }
    setTitle(task.title);
    setDescription(task.description ?? "");
    setSubtaskDrafts(taskToDraftSubtasks(task));
    setNextColumnId(columnId || selectOptions[0]?.value || "");
  }, [open, task, columnId, selectOptions]);

  if (!open || !task) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return;
    }
    const labels = subtaskDrafts.map((s) => s.trim()).filter(Boolean);
    onSave({
      title: trimmedTitle,
      description: description.trim(),
      subtaskLabels: labels,
      columnId: nextColumnId,
    });
  };

  const addSubtaskRow = () => {
    setSubtaskDrafts((rows) => [...rows, ""]);
  };

  const updateSubtaskRow = (index: number, value: string) => {
    setSubtaskDrafts((rows) => {
      const next = [...rows];
      next[index] = value;
      return next;
    });
  };

  const removeSubtaskRow = (index: number) => {
    setSubtaskDrafts((rows) => rows.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-task-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close edit task"
        onClick={onClose}
      />

      <div
        className="surface relative z-10 flex max-h-[min(90vh,100%)] w-full max-w-[480px] flex-col rounded-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-6 overflow-y-auto p-6"
        >
          <h2 id="edit-task-modal-title" className="text-lg font-bold leading-6">
            Edit Task
          </h2>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="edit-task-title"
              className="text-muted text-xs font-bold"
            >
              Title
            </label>
            <input
              id="edit-task-title"
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="e.g. Take coffee break"
              className={inputClassName}
              autoComplete="off"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="edit-task-description"
              className="text-muted text-xs font-bold"
            >
              Description
            </label>
            <textarea
              id="edit-task-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="e.g. It's always good to take a break. This 15 minute break will recharge the batteries a little."
              rows={4}
              className={`min-h-30 resize-y ${inputClassName}`}
            />
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-muted text-xs font-bold">Subtasks</span>
            <ul className="flex flex-col gap-3">
              {subtaskDrafts.map((row, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row}
                    onChange={(event) =>
                      updateSubtaskRow(index, event.target.value)
                    }
                    placeholder={
                      index === 0
                        ? "e.g. Make coffee"
                        : "e.g. Drink coffee & smile"
                    }
                    className={`${inputClassName} flex-1`}
                    aria-label={`Subtask ${index + 1}`}
                  />
                  <button
                    type="button"
                    className="text-muted grid h-10 w-10 shrink-0 place-items-center rounded hover:opacity-80 hover:cursor-pointer"
                    aria-label={`Remove subtask ${index + 1}`}
                    onClick={() => removeSubtaskRow(index)}
                  >
                    <img
                      src="/icons/icon-cross.svg"
                      alt="Remove subtask"
                      width={15}
                      height={15}
                      className="h-3.5 w-3.5"
                    />
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              className="w-full rounded-md bg-(--color-surface-2) py-3 text-sm font-bold text-(--color-primary) transition-colors hover:opacity-90 hover:cursor-pointer"
              onClick={addSubtaskRow}
            >
              + Add New Subtask
            </button>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-muted text-xs font-bold">Status</span>
            <Select value={effectiveColumnId} onValueChange={setNextColumnId}>
              <SelectTrigger
                id="edit-task-status"
                className="w-full hover:cursor-pointer"
                aria-label="Task status"
              >
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

          <button
            type="submit"
            className="btn btn-l btn-primary hover:btn-primary-hover w-full mx-auto hover:cursor-pointer"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

