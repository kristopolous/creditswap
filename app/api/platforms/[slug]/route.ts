import { NextResponse } from "next/server"
import { getPlatform, getSellOrders } from "@/lib/data"

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const platform = await getPlatform(params.slug)
  if (!platform) return NextResponse.json({ error: "not found" }, { status: 404 })
  const orders = await getSellOrders(platform.id)
  return NextResponse.json({ platform, orders })
}
