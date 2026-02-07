import { NextResponse } from "next/server";
import { getPrisma } from "../../../lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const weekId = Number(body?.weekId);
    const isFinal = Boolean(body?.isFinal);

    if (!Number.isFinite(weekId)) {
      return NextResponse.json({ ok: false, error: "Invalid weekId" }, { status: 400 });
    }

    const prisma = getPrisma();

    const week = await prisma.week.update({
      where: { id: weekId },
      data: { isFinal },
    });

    return NextResponse.json({ ok: true, isFinal: week.isFinal });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
