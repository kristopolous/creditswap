import { NextResponse } from "next/server"
import { createBuyOrder, createSellOrder, getAllSellOrders, getPlatform } from "@/lib/data"

export async function GET() {
  const orders = await getAllSellOrders()
  return NextResponse.json({ orders })
}

export async function POST(req: Request) {
  const body = await req.json()
  const { side, platformId, platformName, amount, pricePerCredit, type } = body

  if (side === "sell") {
    const order = await createSellOrder({
      platformId,
      platformName,
      sellerKey: body.apiKey || "anonymous",
      totalCredits: amount,
      availableCredits: amount,
      pricePerCredit,
      type: type || "market",
    })
    return NextResponse.json({
      id: order.id,
      platformId: order.platformId,
      platformName: order.platformName,
      amount: order.availableCredits,
      pricePerCredit: order.pricePerCredit,
      type: order.type,
      status: order.status,
      side: "sell",
    })
  }

  const order = await createBuyOrder(platformId, platformName, amount, pricePerCredit, type || "market")

  return NextResponse.json({
    id: order.id,
    proxyKey: order.proxyKey,
    total: order.totalPrice,
    fee: order.fee,
    amount: order.amount,
    pricePerCredit: order.pricePerCredit,
    type: order.type,
    status: order.status,
    side: "buy",
  })
}
