import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getUserIdFromRequest } from "@/lib/supabase/auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { userId, error } = await getUserIdFromRequest(req);
  if (!userId) {
    return NextResponse.json({ error }, { status: 401 });
  }

  const boards = await prisma.board.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      name: true,
      description: true,
      color: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { columns: true } },
    },
  });

  return NextResponse.json({ boards });
}

const CreateBoardSchema = z.object({
  name: z.string().trim().min(1),
  description: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
  columns: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        color: z.string().trim().optional().nullable(),
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
  const parsed = CreateBoardSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, description, color, columns } = parsed.data;

  const board = await prisma.board.create({
    data: {
      userId,
      name,
      description: description ?? null,
      color: color ?? null,
      columns: columns?.length
        ? {
            create: columns.map((c, idx) => ({
              name: c.name,
              color: c.color ?? null,
              position: c.position ?? idx,
            })),
          }
        : undefined,
    },
    include: {
      columns: { orderBy: { position: "asc" } },
    },
  });

  return NextResponse.json({ board }, { status: 201 });
}

