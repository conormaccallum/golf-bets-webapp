import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: { name: string } }
) {
  const base = process.env.OUTPUT_BASE_URL;
  if (!base) {
    return NextResponse.json({ error: "OUTPUT_BASE_URL not set" }, { status: 500 });
  }

  const allowed = new Set([
    "latest_betslip.csv",
    "latest_value_top20.csv",
    "latest_value_makecut.csv",
    "latest_value_misscut.csv",
    "event_meta.json",
  ]);

  const name = params.name;
  if (!allowed.has(name)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 400 });
  }

  const url = `${base}/${name}`;
  const res = await fetch(url, { cache: "no-store" });

  if (!res.ok) {
    return NextResponse.json(
      { error: `Failed to fetch ${name}`, status: res.status },
      { status: 502 }
    );
  }

  const body = await res.text();
  const contentType = name.endsWith(".json")
    ? "application/json"
    : "text/csv; charset=utf-8";

  return new NextResponse(body, { headers: { "content-type": contentType } });
}
