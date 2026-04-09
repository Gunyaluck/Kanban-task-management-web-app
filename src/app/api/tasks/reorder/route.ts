import { NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

export const runtime = "nodejs";

const ReorderSchema = z.object({
  updates: z
    .array(
      z.object({
        taskId: z.string().min(1),
        columnId: z.string().min(1),
        position: z.number().int().nonnegative(),
      })
    )
    .min(1),
});

export async function POST(req: Request) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = ReorderSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updates = parsed.data.updates;
  const ids = updates.map((u) => u.taskId);

  const owned = await prisma.task.findMany({
    where: { id: { in: ids }, column: { board: { userId } } },
    select: { id: true },
  });
  if (owned.length !== ids.length) {
    return NextResponse.json(
      { error: "One or more tasks not found" },
      { status: 404 }
    );
  }

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Phase 1: move all tasks to unique temp positions to avoid (columnId, position) collisions.
    for (let i = 0; i < updates.length; i++) {
      const u = updates[i]!;
      await tx.task.update({
        where: { id: u.taskId },
        data: {
          columnId: u.columnId,
          position: 100000 + i,
        },
      });
    }

    // Phase 2: apply final positions.
    for (const u of updates) {
      await tx.task.update({
        where: { id: u.taskId },
        data: {
          columnId: u.columnId,
          position: u.position,
        },
      });
    }
  });

  return NextResponse.json({ ok: true });
}

