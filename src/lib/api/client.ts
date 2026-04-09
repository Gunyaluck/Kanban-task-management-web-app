export type ApiError = { error: string; issues?: unknown };

async function apiFetch<T>(
  input: string,
  init: RequestInit & { accessToken?: string } = {}
): Promise<T> {
  const { accessToken, headers, ...rest } = init;
  const res = await fetch(input, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}),
      ...(headers ?? {}),
    },
  });

  const data = (await res.json().catch(() => null)) as T | ApiError | null;
  if (!res.ok) {
    const msg =
      (data as ApiError | null)?.error || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data as T;
}

export type BoardListItem = {
  id: string;
  name: string;
  description: string | null;
  color: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { columns: number };
};

export type ColumnDto = {
  id: string;
  boardId: string;
  name: string;
  color: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export type TaskDto = {
  id: string;
  columnId: string;
  title: string;
  description: string | null;
  priority: string | null;
  dueDate: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
  subtasks?: {
    id: string;
    taskId: string;
    title: string;
    isCompleted: boolean;
    position: number | null;
    createdAt: string;
    updatedAt: string;
  }[];
};

export async function listBoards(accessToken: string) {
  return apiFetch<{ boards: BoardListItem[] }>("/api/boards", { accessToken });
}

export async function getBoard(accessToken: string, boardId: string) {
  return apiFetch<{
    board: {
      id: string;
      userId: string;
      name: string;
      description: string | null;
      color: string | null;
      createdAt: string;
      updatedAt: string;
      columns: (ColumnDto & { tasks: TaskDto[] })[];
    };
  }>(`/api/boards/${boardId}`, { accessToken });
}

export async function createBoard(
  accessToken: string,
  payload: {
    name: string;
    description?: string | null;
    color?: string | null;
    columns?: { name: string; color?: string | null; position?: number }[];
  }
) {
  return apiFetch<{ board: unknown }>("/api/boards", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function patchBoard(
  accessToken: string,
  boardId: string,
  payload: { name?: string; description?: string | null; color?: string | null }
) {
  return apiFetch<{ board: unknown }>(`/api/boards/${boardId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function deleteBoard(accessToken: string, boardId: string) {
  return apiFetch<{ ok: true }>(`/api/boards/${boardId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function createColumn(
  accessToken: string,
  boardId: string,
  payload: { name: string; color?: string | null; position?: number }
) {
  return apiFetch<{ column: ColumnDto }>(`/api/boards/${boardId}/columns`, {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function patchColumn(
  accessToken: string,
  columnId: string,
  payload: { name?: string; color?: string | null; position?: number }
) {
  return apiFetch<{ column: ColumnDto }>(`/api/columns/${columnId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function deleteColumn(accessToken: string, columnId: string) {
  return apiFetch<{ ok: true }>(`/api/columns/${columnId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function createTask(
  accessToken: string,
  payload: {
    columnId: string;
    title: string;
    description?: string | null;
    priority?: string | null;
    dueDate?: string | null;
    position?: number;
    subtasks?: { title: string; isCompleted?: boolean; position?: number }[];
  }
) {
  return apiFetch<{ task: TaskDto }>("/api/tasks", {
    method: "POST",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function patchTask(
  accessToken: string,
  taskId: string,
  payload: {
    columnId?: string;
    title?: string;
    description?: string | null;
    priority?: string | null;
    dueDate?: string | null;
    position?: number;
  }
) {
  return apiFetch<{ task: TaskDto }>(`/api/tasks/${taskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function deleteTask(accessToken: string, taskId: string) {
  return apiFetch<{ ok: true }>(`/api/tasks/${taskId}`, {
    method: "DELETE",
    accessToken,
  });
}

export async function patchSubtask(
  accessToken: string,
  subtaskId: string,
  payload: { isCompleted?: boolean }
) {
  return apiFetch<{ subtask: unknown }>(`/api/subtasks/${subtaskId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    accessToken,
  });
}

export async function reorderTasks(
  accessToken: string,
  updates: { taskId: string; columnId: string; position: number }[]
) {
  return apiFetch<{ ok: true }>("/api/tasks/reorder", {
    method: "POST",
    body: JSON.stringify({ updates }),
    accessToken,
  });
}

