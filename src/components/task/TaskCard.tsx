import type { BoardTask } from "@/components/boards/boardData";

type TaskCardProps = BoardTask & {
  onSelect?: () => void;
};

export default function TaskCard({
  title,
  completedSubtasks,
  totalSubtasks,
  onSelect,
}: TaskCardProps) {
  const interactive = Boolean(onSelect);

  return (
    <article
      role={interactive ? "button" : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={`surface rounded-lg px-4 py-5 ${
        interactive
          ? "cursor-pointer transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--color-primary) focus-visible:ring-offset-2"
          : ""
      }`}
      onClick={onSelect}
      onKeyDown={(event) => {
        if (!onSelect) {
          return;
        }
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
    >
      <h3 className="text-[15px] font-bold leading-[18px]">{title}</h3>
      {totalSubtasks > 0 ? (
        <p className="text-muted mt-2 text-xs font-bold leading-4">
          {completedSubtasks} of {totalSubtasks} subtasks
        </p>
      ) : null}
    </article>
  );
}
