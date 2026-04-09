import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const CreateTaskSchema = z.object({
  columnId: z.string().min(1),
  title: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  priority: z.string().trim().optional().nullable(),
  dueDate: z.union([z.string().datetime(), z.null()]).optional(),
  position: z.number().int().nonnegative().optional(),
  subtasks: z
    .array(
      z.object({
        title: z.string().trim().min(1),
        isCompleted: z.boolean().optional(),
        position: z.number().int().nonnegative().optional(),
      })
    )
    .optional(),
});

export async function POST(req: Request) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { columnId, title, description, priority, dueDate, position, subtasks } =
    parsed.data;

  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { userId } },
    select: { id: true },
  });
  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const nextPosition =
    position ??
    (await prisma.task.count({
      where: { columnId },
    }));

  const task = await prisma.task.create({
    data: {
      columnId,
      title,
      description: description ?? null,
      priority: priority ?? null,
      dueDate: dueDate ? new Date(dueDate) : null,
      position: nextPosition,
      subtasks: subtasks?.length
        ? {
            create: subtasks.map((s, idx) => ({
              title: s.title,
              isCompleted: s.isCompleted ?? false,
              position: s.position ?? idx,
            })),
          }
        : undefined,
    },
  });

  return NextResponse.json({ task }, { status: 201 });
}

