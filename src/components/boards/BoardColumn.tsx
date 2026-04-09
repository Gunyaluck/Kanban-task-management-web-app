import TaskCard from "@/components/task/TaskCard";
import type { BoardTask } from "./boardData";

type BoardColumnProps = {
  columnId: string;
  title: string;
  dotClassName: string;
  tasks: BoardTask[];
  onTaskClick?: (task: BoardTask, taskIndex: number) => void;
  onMoveTask?: (args: {
    taskId: string;
    fromColumnId: string;
    toColumnId: string;
    toIndex: number;
  }) => void;
};

export default function BoardColumn({
  columnId,
  title,
  dotClassName,
  tasks,
  onTaskClick,
  onMoveTask,
}: BoardColumnProps) {
  const count = tasks.length;

  return (
    <div className="flex w-70 shrink-0 snap-start flex-col gap-6">
      <div className="flex items-center gap-3">
        <span
          className={`h-4 w-4 shrink-0 rounded-full ${dotClassName}`}
          aria-hidden
        />
        <h2 className="text-muted text-xs font-bold tracking-[0.15em] uppercase">
          {title} ({count})
        </h2>
      </div>
      <ul
        className="flex flex-col gap-3.5"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const taskId = e.dataTransfer.getData("text/taskId");
          const fromColumnId = e.dataTransfer.getData("text/fromColumnId");
          const rawToIndex = e.dataTransfer.getData("text/toIndex");
          const toIndex = Number.isFinite(Number(rawToIndex))
            ? Number(rawToIndex)
            : tasks.length;
          if (!taskId || !fromColumnId) return;
          onMoveTask?.({
            taskId,
            fromColumnId,
            toColumnId: columnId,
            toIndex,
          });
        }}
      >
        {tasks.length === 0 ? (
          <li>
            <div className="grid min-h-32 place-items-center rounded-lg border border-dashed border-token bg-(--color-surface) text-muted">
              <span className="text-xs font-bold tracking-[0.15em] uppercase">
                Drop here
              </span>
            </div>
          </li>
        ) : null}
        {tasks.map((task, index) => (
          <li
            key={task.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/taskId", task.id);
              e.dataTransfer.setData("text/fromColumnId", columnId);
              e.dataTransfer.effectAllowed = "move";
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const taskId = e.dataTransfer.getData("text/taskId");
              const fromColumnId = e.dataTransfer.getData("text/fromColumnId");
              if (!taskId || !fromColumnId) return;
              onMoveTask?.({
                taskId,
                fromColumnId,
                toColumnId: columnId,
                toIndex: index,
              });
            }}
          >
            <TaskCard
              {...task}
              onSelect={
                onTaskClick ? () => onTaskClick(task, index) : undefined
              }
            />
          </li>
        ))}
      </ul>
    </div>
  );
}