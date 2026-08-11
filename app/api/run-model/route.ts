import { NextResponse } from "next/server";

const OUTPUT_BASE = process.env.OUTPUT_BASE_URL || "";

function normalizeTour(input: string | null | undefined) {
  const t = (input || "").toLowerCase();
  if (t === "dp" || t === "dpwt" || t === "euro") return "dp";
  return "pga";
}

async function fetchOutputJson(tour: string, name: string) {
  if (!OUTPUT_BASE) return null;
  const primary = `${OUTPUT_BASE}/${tour}/${name}?t=${Date.now()}`;
  const fallback = `${OUTPUT_BASE}/${name}?t=${Date.now()}`;
  let res = await fetch(primary, { cache: "no-store" });
  if (!res.ok && res.status === 404) {
    res = await fetch(fallback, { cache: "no-store" });
  }
  if (!res.ok) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

function isAtOrAfter(value: unknown, since: string | null) {
  if (!value || !since) return false;
  const a = Date.parse(String(value));
  const b = Date.parse(since);
  return Number.isFinite(a) && Number.isFinite(b) && a >= b;
}

export async function POST() {
  try {
    const token = process.env.GITHUB_ACTIONS_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const workflow = process.env.GITHUB_WORKFLOW || "run-model.yml";
    const ref = process.env.GITHUB_REF || "main";

    if (!token || !repo) {
      return NextResponse.json(
        { ok: false, error: "Missing GITHUB_ACTIONS_TOKEN or GITHUB_REPO" },
        { status: 500 }
      );
    }

    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/dispatches`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ref }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `GitHub dispatch failed (${res.status}): ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, message: "Workflow dispatched" });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const token = process.env.GITHUB_ACTIONS_TOKEN;
    const repo = process.env.GITHUB_REPO;
    const workflow = process.env.GITHUB_WORKFLOW || "run-model.yml";
    const urlObj = new URL(req.url);
    const tour = normalizeTour(urlObj.searchParams.get("tour"));
    const since = urlObj.searchParams.get("since");

    if (!token || !repo) {
      return NextResponse.json(
        { ok: false, error: "Missing GITHUB_ACTIONS_TOKEN or GITHUB_REPO" },
        { status: 500 }
      );
    }

    const url = `https://api.github.com/repos/${repo}/actions/workflows/${workflow}/runs?per_page=1`;
    const res = await fetch(url, {
      headers: {
        "Accept": "application/vnd.github+json",
        "Authorization": `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { ok: false, error: `GitHub runs fetch failed (${res.status}): ${text}` },
        { status: 500 }
      );
    }
    const json = await res.json();
    const run = json?.workflow_runs?.[0];
    const outputRunMeta = await fetchOutputJson(tour, "run_meta.json");
    const outputEventMeta = await fetchOutputJson(tour, "event_meta.json");

    return NextResponse.json({
      ok: true,
      tour,
      output: {
        runMeta: outputRunMeta,
        eventMeta: outputEventMeta,
        updatedForRequest: isAtOrAfter(outputRunMeta?.runAt, since),
      },
      run: run
        ? {
            id: run.id,
            status: run.status,
            conclusion: run.conclusion,
            created_at: run.created_at,
            run_started_at: run.run_started_at,
            updated_at: run.updated_at,
            html_url: run.html_url,
            isCurrentRequest: isAtOrAfter(run.created_at, since),
          }
        : null,
    });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
