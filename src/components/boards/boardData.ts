export type TaskSubitem = {
  id: string;
  label: string;
  done: boolean;
};

export type BoardTask = {
  id: string;
  title: string;
  completedSubtasks: number;
  totalSubtasks: number;
  description?: string;
  subtasks?: TaskSubitem[];
};

export type ColumnDefinition = {
  id: string;
  title: string;
  dotClassName: string;
  tasks: BoardTask[];
};

export function getTaskSubtasksForModal(task: BoardTask): TaskSubitem[] {
  if (task.subtasks?.length) {
    return task.subtasks;
  }

  const total = Math.max(0, task.totalSubtasks);
  const doneCount = Math.min(Math.max(0, task.completedSubtasks), total);

  if (total === 0) {
    return [];
  }

  return Array.from({ length: total }, (_, index) => ({
    id: `generated-${index}`,
    label: `Subtask ${index + 1}`,
    done: index < doneCount,
  }));
}
