"use client";

import { useEffect } from "react";

type DeleteBoardModalProps = {
  open: boolean;
  boardName: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteBoardModal({
  open,
  boardName,
  onCancel,
  onConfirm,
}: DeleteBoardModalProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancel();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onCancel]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-board-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close delete board"
        onClick={onCancel}
      />

      <div className="surface relative z-10 w-full max-w-[480px] rounded-lg p-6">
        <h2
          id="delete-board-title"
          className="text-(--color-danger) text-lg font-bold leading-6"
        >
          Delete this board?
        </h2>

        <p className="text-muted mt-6 text-sm font-medium leading-[23px]">
          Are you sure you want to delete the &apos;{boardName}&apos; board?
          This action will remove all columns and tasks and cannot be reversed.
        </p>

        <div className="mt-6 flex flex-col gap-4 md:flex-row">
          <button
            type="button"
            className="btn btn-l btn-danger hover:btn-danger-hover w-full hover:cursor-pointer"
            onClick={onConfirm}
          >
            Delete
          </button>
          <button
            type="button"
            className="btn btn-l btn-secondary hover:btn-secondary-hover w-full hover:cursor-pointer"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

