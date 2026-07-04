import { getUsageLog } from "@/lib/data"
import { json, error } from "@/lib/api-helpers"

export const runtime = "nodejs"

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const logs = await getUsageLog(params.id)
  return json(logs)
}
