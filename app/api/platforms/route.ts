import { NextResponse } from "next/server"
import { getPlatforms } from "@/lib/data"

export async function GET() {
  const platforms = await getPlatforms()
  return NextResponse.json({ platforms })
}
