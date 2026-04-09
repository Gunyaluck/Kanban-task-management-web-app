import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      id?: string;
      email?: string;
      name?: string;
    };

    const id = body.id?.trim();
    const email = body.email?.trim();
    const name = body.name?.trim();

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 }
      );
    }
    if (!isUuid(id)) {
      return NextResponse.json(
        { error: "id must be a UUID" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.upsert({
        where: { id },
        create: {
          id,
          email: email || null,
          name: name || null,
        },
        update: {
          email: email || null,
          name: name || null,
        },
      });

      const existingDefaultBoard = await tx.board.findFirst({
        where: { userId: id, name: "Platform Launch" },
        select: { id: true },
      });

      if (!existingDefaultBoard) {
        await tx.board.create({
          data: {
            userId: id,
            name: "Platform Launch",
            description: null,
            color: null,
            columns: {
              create: [
                { name: "Todo", position: 0 },
                { name: "Doing", position: 1 },
                { name: "Done", position: 2 },
              ],
            },
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 }
    );
  }
}

