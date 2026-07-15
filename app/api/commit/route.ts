import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "The old CSV commit route is disabled. Use the Betslip page: mark bets as placed, then click Commit placed bets.",
    },
    { status: 410 }
  );
}
