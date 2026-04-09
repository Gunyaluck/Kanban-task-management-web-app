import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

type Params = { params: Promise<{ taskId: string }> };

export const runtime = "nodejs";

export async function GET(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { taskId } = await params;
  const task = await prisma.task.findFirst({
    where: { id: taskId, column: { board: { userId } } },
    include: { subtasks: { orderBy: { position: "asc" } } },
  });
  if (!task) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }
  return NextResponse.json({ task });
}

const PatchTaskSchema = z
  .object({
    columnId: z.string().min(1).optional(),
    title: z.string().trim().min(1).optional(),
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
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch body" });

export async function PATCH(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { taskId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchTaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await prisma.task.findFirst({
    where: { id: taskId, column: { board: { userId } } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  if (parsed.data.columnId) {
    const column = await prisma.column.findFirst({
      where: { id: parsed.data.columnId, board: { userId } },
      select: { id: true },
    });
    if (!column) {
      return NextResponse.json({ error: "Target column not found" }, { status: 404 });
    }
  }

  const { dueDate, subtasks, ...rest } = parsed.data;

  const task = await prisma.$transaction(async (tx) => {
    const updated = await tx.task.update({
      where: { id: taskId },
      data: {
        ...rest,
        ...(dueDate !== undefined
          ? { dueDate: dueDate ? new Date(dueDate) : null }
          : {}),
      },
    });

    if (subtasks) {
      await tx.subtask.deleteMany({ where: { taskId } });
      if (subtasks.length > 0) {
        await tx.subtask.createMany({
          data: subtasks.map((s, idx) => ({
            taskId,
            title: s.title,
            isCompleted: s.isCompleted ?? false,
            position: s.position ?? idx,
          })),
        });
      }
    }

    return updated;
  });

  return NextResponse.json({ task });
}

export async function DELETE(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { taskId } = await params;
  const existing = await prisma.task.findFirst({
    where: { id: taskId, column: { board: { userId } } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ ok: true });
}

