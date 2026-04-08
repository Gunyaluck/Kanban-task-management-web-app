type BoardNewColumnSlotProps = {
  onClick?: () => void;
};

export default function BoardNewColumnSlot({
  onClick,
}: BoardNewColumnSlotProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-muted flex min-h-[65vh] w-70 shrink-0 snap-start items-center justify-center rounded-lg bg-linear-to-b from-[#E9EFFA] to-[#E9EFFA] py-8 text-2xl font-bold leading-8 transition-opacity hover:opacity-90 dark:from-(--color-surface-2) dark:to-(--color-surface-2)"
      aria-label="Add new column"
    >
      + New Column
    </button>
  );
}
