import { createBuyOrder } from "@/lib/data"
import { json, error, parseBody } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function POST(req: Request) {
  const body = await parseBody(req)
  const { platformId, platformName, amount, pricePerCredit } = body as Record<string, unknown>

  if (!platformId || !amount || !pricePerCredit) {
    return error("platformId, amount, and pricePerCredit are required", 400)
  }

  if (typeof pricePerCredit === "number" && pricePerCredit >= 1) {
    return error("pricePerCredit must be under $1.00", 400)
  }

  const order = await createBuyOrder(
    platformId as string,
    (platformName as string) || (platformId as string),
    amount as number,
    pricePerCredit as number,
    "market"
  )

  return json({
    key: order.proxyKey,
    orderId: order.id,
    platformId: order.platformId,
    platformName: order.platformName,
    amount: order.amount,
    totalPrice: order.totalPrice,
    fee: order.fee,
    status: order.status,
  }, 201)
}
