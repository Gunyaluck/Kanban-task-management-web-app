"use client";

import { useEffect, useState } from "react";

export type AddBoardPayload = {
  boardName: string;
  columns: { title: string; dotClassName: string }[];
};

type AddBoardModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: AddBoardPayload) => void;
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

export default function AddBoardModal({
  open,
  onClose,
  onCreate,
}: AddBoardModalProps) {
  const [name, setName] = useState("");
  const [colDrafts, setColDrafts] = useState<ColumnDraft[]>([
    { title: "Todo", dotClassName: "bg-(--col-dot-cyan)" },
    { title: "Doing", dotClassName: "bg-(--col-dot-purple)" },
  ]);

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
    setName("");
    setColDrafts([
      { title: "Todo", dotClassName: "bg-(--col-dot-cyan)" },
      { title: "Doing", dotClassName: "bg-(--col-dot-purple)" },
      { title: "Done", dotClassName: "bg-(--col-dot-green)" },
    ]);
  }, [open]);

  if (!open) {
    return null;
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      return;
    }
    const columns = colDrafts
      .map((c) => ({ title: c.title.trim(), dotClassName: c.dotClassName }))
      .filter((c) => Boolean(c.title));
    onCreate({ boardName: trimmedName, columns });
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
      aria-labelledby="add-board-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close add board"
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
          <h2 id="add-board-modal-title" className="text-lg font-bold leading-6">
            Add New Board
          </h2>

          <div className="flex flex-col gap-2">
            <label htmlFor="add-board-name" className="text-muted text-xs font-bold">
              Board Name
            </label>
            <input
              id="add-board-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Web Design"
              className={inputClassName}
              autoComplete="off"
            />
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
                  <label className="sr-only" htmlFor={`add-board-col-color-${index}`}>
                    Column color {index + 1}
                  </label>
                  <div className="relative shrink-0">
                    <select
                      id={`add-board-col-color-${index}`}
                      value={row.dotClassName}
                      onChange={(e) => updateColumnDotColor(index, e.target.value)}
                      className="h-10 w-[116px] appearance-none rounded border border-token bg-(--color-surface) pl-10 pr-8 text-sm font-medium text-(--color-text) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2 hover:cursor-pointer"
                      aria-label={`Column color ${index + 1}`}
                    >
                      {DOT_COLORS.map((c) => (
                        <option key={c.id} value={c.dotClassName}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                    <span
                      aria-hidden="true"
                      className={`pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 rounded-full ${row.dotClassName}`}
                    />
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                    >
                      ▼
                    </span>
                  </div>
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
            Create New Board
          </button>
        </form>
      </div>
    </div>
  );
}

