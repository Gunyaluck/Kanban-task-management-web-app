import BoardColumn from "./BoardColumn";
import BoardNewColumnSlot from "./BoardNewColumnSlot";
import BoardShowSidebarFab from "./BoardShowSidebarFab";
import type { BoardTask, ColumnDefinition } from "./boardData";

type KanbanBoardProps = {
  columns: ColumnDefinition[];
  onAddColumn?: () => void;
  onTaskClick?: (
    task: BoardTask,
    columnTitle: string,
    columnId: string,
    taskIndex: number
  ) => void;
};

export default function KanbanBoard({
  columns,
  onAddColumn,
  onTaskClick,
}: KanbanBoardProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-64px)] flex-1 flex-col md:min-h-screen">
      <div className="snap-x snap-mandatory scroll-px-4 overflow-x-auto overscroll-x-contain pb-24 [-ms-overflow-style:none] [scrollbar-width:none] md:snap-none [&::-webkit-scrollbar]:hidden">
        <div className="inline-flex gap-6 px-4 pt-6">
          {columns.map((col) => (
            <BoardColumn
              key={col.id}
              title={col.title}
              dotClassName={col.dotClassName}
              tasks={col.tasks}
              onTaskClick={
                onTaskClick
                  ? (task, taskIndex) =>
                      onTaskClick(task, col.title, col.id, taskIndex)
                  : undefined
              }
            />
          ))}
          <BoardNewColumnSlot onClick={onAddColumn} />
        </div>
      </div>
    </div>
  );
}
