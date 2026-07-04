import { NextResponse } from "next/server"

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status })
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status })
}

export function parseBody(req: Request): Promise<Record<string, unknown>> {
  return req.json().catch(() => ({}))
}
