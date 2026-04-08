export type TaskSubitem = {
  id: string;
  label: string;
  done: boolean;
};

export type BoardTask = {
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

export const SAMPLE_COLUMNS: ColumnDefinition[] = [
  {
    id: "todo",
    title: "Todo",
    dotClassName: "bg-[#49C4E5]",
    tasks: [
      {
        title: "Build UI for onboarding flow",
        completedSubtasks: 0,
        totalSubtasks: 3,
      },
      {
        title: "Build UI for search",
        completedSubtasks: 0,
        totalSubtasks: 1,
      },
      {
        title: "Create template structures",
        completedSubtasks: 0,
        totalSubtasks: 2,
      },
      {
        title: "QA and test all major user journeys",
        completedSubtasks: 0,
        totalSubtasks: 6,
      },
    ],
  },
  {
    id: "doing",
    title: "Doing",
    dotClassName: "bg-[#8471F2]",
    tasks: [
      {
        title: "Design settings and search pages",
        completedSubtasks: 2,
        totalSubtasks: 2,
      },
      {
        title: "Add account management endpoints",
        completedSubtasks: 3,
        totalSubtasks: 7,
      },
      {
        title: "Design onboarding flow",
        completedSubtasks: 1,
        totalSubtasks: 6,
      },
      {
        title: "Add search endpoints",
        completedSubtasks: 1,
        totalSubtasks: 3,
      },
      {
        title: "Add authentication endpoints",
        completedSubtasks: 2,
        totalSubtasks: 3,
      },
      {
        title: "Research pricing points of various competitors and trial different business models",
        completedSubtasks: 2,
        totalSubtasks: 3,
        description:
          "We know what we're planning to build for version one. Now we need to finalise the first pricing model we'll use. Keep iterating the subtasks until we have a coherent proposition.",
        subtasks: [
          {
            id: "rp-1",
            label: "Research competitor pricing and business models",
            done: true,
          },
          {
            id: "rp-2",
            label: "Outline a business model for our product",
            done: true,
          },
          {
            id: "rp-3",
            label: "Surveying and testing",
            done: false,
          },
        ],
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    dotClassName: "bg-[#67E3AE]",
    tasks: [
      {
        title: "Conduct 5 wireframe tests",
        completedSubtasks: 1,
        totalSubtasks: 1,
      },
      {
        title: "Create wireframe prototype",
        completedSubtasks: 2,
        totalSubtasks: 2,
      },
      {
        title: "Review results of usability tests and iterate",
        completedSubtasks: 3,
        totalSubtasks: 3,
      },
      {
        title: "Create paper prototypes and conduct 10 usability tests",
        completedSubtasks: 5,
        totalSubtasks: 5,
      },
      {
        title: "Market discovery",
        completedSubtasks: 1,
        totalSubtasks: 1,
      },
      {
        title: "Competitor analysis",
        completedSubtasks: 1,
        totalSubtasks: 2,
      },
      {
        title: "Research the market",
        completedSubtasks: 1,
        totalSubtasks: 1,
      },
    ],
  },
];

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
