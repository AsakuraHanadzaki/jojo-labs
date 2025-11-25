import { NextResponse } from "next/server"
import type { RoutineInput, RoutineResult } from "@/lib/routine-algorithm"
import { buildRoutine } from "@/lib/routine-algorithm"

// Optional: use Edge runtime (algorithm is pure JS)
export const runtime = "edge"

function normalize(input: any): RoutineInput {
  return {
    skinType: String(input?.skinType || ""),
    concerns: String(input?.concerns || ""),
    age: String(input?.age || ""),
    routine: String(input?.routine || "basic"),
  }
}

export async function POST(req: Request) {
  try {
    const ct = req.headers.get("content-type") || ""
    if (!ct.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 })
    }

    const body = await req.json()
    const input = normalize(body)

    if (!input.skinType || !input.concerns || !input.age || !input.routine) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const result: RoutineResult = buildRoutine(input)
    return NextResponse.json(result, { status: 200 })
  } catch (err: any) {
    return NextResponse.json(
      { error: "Internal server error", detail: String(err?.message || err) },
      { status: 500 }
    )
  }
}
