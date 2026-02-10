import { NextResponse } from "next/server";

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
