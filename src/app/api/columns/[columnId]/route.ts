import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

type Params = { params: Promise<{ columnId: string }> };

export const runtime = "nodejs";

const PatchColumnSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    color: z.string().trim().optional().nullable(),
    position: z.number().int().nonnegative().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Empty patch body" });

export async function PATCH(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { columnId } = await params;
  const json = await req.json().catch(() => null);
  const parsed = PatchColumnSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { userId } },
    select: { id: true },
  });
  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  const updated = await prisma.column.update({
    where: { id: columnId },
    data: parsed.data,
  });
  return NextResponse.json({ column: updated });
}

export async function DELETE(req: Request, { params }: Params) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const { columnId } = await params;
  const column = await prisma.column.findFirst({
    where: { id: columnId, board: { userId } },
    select: { id: true },
  });
  if (!column) {
    return NextResponse.json({ error: "Column not found" }, { status: 404 });
  }

  await prisma.column.delete({ where: { id: columnId } });
  return NextResponse.json({ ok: true });
}

