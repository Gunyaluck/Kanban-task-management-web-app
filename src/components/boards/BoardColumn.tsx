import TaskCard from "@/components/task/TaskCard";
import type { BoardTask } from "./boardData";

type BoardColumnProps = {
  title: string;
  dotClassName: string;
  tasks: BoardTask[];
  onTaskClick?: (task: BoardTask, taskIndex: number) => void;
};

export default function BoardColumn({
  title,
  dotClassName,
  tasks,
  onTaskClick,
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
      <ul className="flex flex-col gap-3.5">
        {tasks.map((task, index) => (
          <li key={`${task.title}-${index}`}>
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
