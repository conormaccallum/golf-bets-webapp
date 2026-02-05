import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error:
        "Disabled on hosted version. Run the model locally and push outputs to the outputs repo.",
    },
    { status: 400 }
  );
}
