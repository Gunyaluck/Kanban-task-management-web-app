import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

export const runtime = "nodejs";

type Params = { params: Promise<{ subtaskId: string }> };

const PatchSubtaskSchema = z
  .object({
    isCompleted: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch body" });

export async function PATCH(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { subtaskId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchSubtaskSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await prisma.subtask.findFirst({
    where: { id: subtaskId, task: { column: { board: { userId } } } },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Subtask not found" }, { status: 404 });
  }

  const updated = await prisma.subtask.update({
    where: { id: subtaskId },
    data: {
      ...(parsed.data.isCompleted !== undefined
        ? { isCompleted: parsed.data.isCompleted }
        : {}),
    },
  });

  return NextResponse.json({ subtask: updated });
}

