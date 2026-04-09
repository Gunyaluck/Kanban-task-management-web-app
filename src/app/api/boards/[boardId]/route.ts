import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

type Params = { params: Promise<{ boardId: string }> };

export const runtime = "nodejs";

export async function GET(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { boardId } = await params;
  const board = await prisma.board.findFirst({
    where: { id: boardId, userId },
    include: {
      columns: {
        orderBy: { position: "asc" },
        include: {
          tasks: {
            orderBy: { position: "asc" },
            include: { subtasks: { orderBy: { position: "asc" } } },
          },
        },
      },
    },
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  return NextResponse.json({ board });
}

const PatchBoardSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    description: z.string().trim().optional().nullable(),
    color: z.string().trim().optional().nullable(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch body" });

export async function PATCH(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { boardId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchBoardSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await prisma.board.findFirst({
    where: { id: boardId, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const board = await prisma.board.update({
    where: { id: boardId },
    data: parsed.data,
  });

  return NextResponse.json({ board });
}

export async function DELETE(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { boardId } = await params;
  const existing = await prisma.board.findFirst({
    where: { id: boardId, userId },
    select: { id: true },
  });
  if (!existing) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  await prisma.board.delete({ where: { id: boardId } });
  return NextResponse.json({ ok: true });
}

