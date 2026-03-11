import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  const { name } = await context.params;

  const baseRaw = process.env.OUTPUT_BASE_URL;
  if (!baseRaw) {
    return NextResponse.json({ error: "OUTPUT_BASE_URL not set" }, { status: 500 });
  }
  const tour = (() => {
    const t = (req.nextUrl.searchParams.get("tour") || "").toLowerCase();
    if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
    return "pga";
  })();
  const baseTour = `${baseRaw}/${tour}`;
  const baseFlat = baseRaw;

  const allowed = new Set([
    "latest_betslip.csv",
    "latest_value_top20.csv",
    "latest_value_make_cut.csv",
    "latest_value_miss_cut.csv",
    "latest_value_makecut.csv",
    "latest_value_misscut.csv",
    "latest_value_matchups_2ball.csv",
    "latest_value_matchups_3ball.csv",
    "event_meta.json",
  ]);

  if (!allowed.has(name)) {
    return NextResponse.json({ error: "Not allowed" }, { status: 400 });
  }

  const urlTour = `${baseTour}/${name}?t=${Date.now()}`;
  const urlFlat = `${baseFlat}/${name}?t=${Date.now()}`;
  let res = await fetch(urlTour, { cache: "no-store" });

  if (!res.ok) {
    const res2 = await fetch(urlFlat, { cache: "no-store" });
    if (res2.ok) {
      res = res2;
    } else {
      return NextResponse.json(
        { error: `Failed to fetch ${name}`, status: res2.status },
        { status: 502 }
      );
    }
  }

  const body = await res.text();
  const contentType = name.endsWith(".json")
    ? "application/json"
    : "text/csv; charset=utf-8";

  return new NextResponse(body, { headers: { "content-type": contentType } });
}
