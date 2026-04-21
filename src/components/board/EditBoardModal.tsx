"use client";

import { useEffect, useMemo, useState } from "react";

import type { ColumnDefinition } from "@/components/boards/boardData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type EditBoardPayload = {
  boardName: string;
  columns: { title: string; dotClassName: string }[];
};

type EditBoardModalProps = {
  open: boolean;
  onClose: () => void;
  onSave: (payload: EditBoardPayload) => void;
  boardName: string;
  columns: ColumnDefinition[] | null;
};

const inputClassName =
  "w-full rounded border border-token bg-(--color-surface) px-4 py-3 text-sm font-medium text-(--color-text) placeholder:text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2";

const DOT_COLORS: { id: string; label: string; dotClassName: string }[] = [
  { id: "gray", label: "Gray", dotClassName: "bg-(--color-text-muted)" },
  { id: "cyan", label: "Cyan", dotClassName: "bg-(--col-dot-cyan)" },
  { id: "purple", label: "Purple", dotClassName: "bg-(--col-dot-purple)" },
  { id: "green", label: "Green", dotClassName: "bg-(--col-dot-green)" },
  { id: "orange", label: "Orange", dotClassName: "bg-(--col-dot-orange)" },
  { id: "pink", label: "Pink", dotClassName: "bg-(--col-dot-pink)" },
];

type ColumnDraft = { title: string; dotClassName: string };

export default function EditBoardModal({
  open,
  onClose,
  onSave,
  boardName,
  columns,
}: EditBoardModalProps) {
  const [name, setName] = useState(boardName);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [colDrafts, setColDrafts] = useState<ColumnDraft[]>([]);

  const getDotLabel = (dotClassName: string) =>
    DOT_COLORS.find((c) => c.dotClassName === dotClassName)?.label ?? "Gray";

  const initialCols = useMemo(
    () =>
      columns?.map((c) => ({ title: c.title, dotClassName: c.dotClassName })) ??
      [],
    [columns]
  );

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
    if (!open) {
      return;
    }
    setName(boardName);
    setSubmitAttempted(false);
    setColDrafts(initialCols);
  }, [open, boardName, initialCols]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitAttempted(true);
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const cols = colDrafts
      .map((c) => ({
        title: c.title.trim(),
        dotClassName: c.dotClassName || DOT_COLORS[0]!.dotClassName,
      }))
      .filter((c) => Boolean(c.title));
    onSave({ boardName: trimmedName, columns: cols });
  };

  const addColumnRow = () => {
    setColDrafts((rows) => [
      ...rows,
      { title: "", dotClassName: DOT_COLORS[0]!.dotClassName },
    ]);
  };

  const updateColumnRow = (index: number, value: string) => {
    setColDrafts((rows) => {
      const next = [...rows];
      next[index] = { ...next[index]!, title: value };
      return next;
    });
  };

  const updateColumnDotColor = (index: number, dotClassName: string) => {
    setColDrafts((rows) => {
      const next = [...rows];
      next[index] = { ...next[index]!, dotClassName };
      return next;
    });
  };

  const removeColumnRow = (index: number) => {
    setColDrafts((rows) => rows.filter((_, i) => i !== index));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-board-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close edit board"
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
          <h2 id="edit-board-modal-title" className="text-lg font-bold leading-6">
            Edit Board
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="edit-board-name" className="text-muted text-xs font-bold">
              Board Name
            </label>
            <input
              id="edit-board-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={inputClassName}
              autoComplete="off"
              aria-invalid={submitAttempted && !name.trim() ? true : undefined}
              aria-describedby={
                submitAttempted && !name.trim()
                  ? "edit-board-name-error"
                  : undefined
              }
            />
            {submitAttempted && !name.trim() ? (
              <p
                id="edit-board-name-error"
                className="text-(--color-danger) text-sm font-medium"
              >
                Board name is required.
              </p>
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            <span className="text-muted text-xs font-bold">Board Columns</span>
            <ul className="flex flex-col gap-3">
              {colDrafts.map((row, index) => (
                <li key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={row.title}
                    onChange={(event) =>
                      updateColumnRow(index, event.target.value)
                    }
                    className={`${inputClassName} flex-1`}
                    aria-label={`Board column ${index + 1}`}
                  />
                  <Select
                    value={row.dotClassName}
                    onValueChange={(value) => updateColumnDotColor(index, value)}
                  >
                    <SelectTrigger
                      className="h-10 w-[140px] shrink-0 px-3 py-2 hover:cursor-pointer"
                      aria-label={`Column color ${index + 1}`}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`h-3 w-3 shrink-0 rounded-full ${row.dotClassName}`}
                        />
                        <SelectValue placeholder="Color">
                          <span className="truncate">{getDotLabel(row.dotClassName)}</span>
                        </SelectValue>
                      </span>
                    </SelectTrigger>
                    <SelectContent align="end">
                      {DOT_COLORS.map((c) => (
                        <SelectItem key={c.id} value={c.dotClassName}>
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden="true"
                              className={`h-3 w-3 rounded-full ${c.dotClassName}`}
                            />
                            <span>{c.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    type="button"
                    className="text-muted grid h-10 w-10 shrink-0 place-items-center rounded hover:opacity-80 hover:cursor-pointer"
                    aria-label={`Remove column ${index + 1}`}
                    onClick={() => removeColumnRow(index)}
                  >
                    <img
                      src="/icons/icon-cross.svg"
                      alt="Remove column"
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
              onClick={addColumnRow}
            >
              + Add New Column
            </button>
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

