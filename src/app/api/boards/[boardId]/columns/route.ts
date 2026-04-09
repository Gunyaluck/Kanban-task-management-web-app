import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

type Params = { params: Promise<{ boardId: string }> };

export const runtime = "nodejs";

const CreateColumnSchema = z.object({
  name: z.string().trim().min(1),
  color: z.string().trim().optional().nullable(),
  position: z.number().int().nonnegative().optional(),
});

export async function POST(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { boardId } = await params;
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    select: { id: true },
  });
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const json = await req.json().catch(() => null);
  const parsed = CreateColumnSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, color, position } = parsed.data;
  const nextPosition =
    position ??
    (await prisma.column.count({
      where: { boardId },
    }));

  const column = await prisma.column.create({
    data: { boardId, name, color: color ?? null, position: nextPosition },
  });

  return NextResponse.json({ column }, { status: 201 });
}

