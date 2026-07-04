import { Pool, types } from "pg"

// Parse NUMERIC / DECIMAL / MONEY as floats
types.setTypeParser(1700, (v: string) => parseFloat(v))
types.setTypeParser(20, (v: string) => parseInt(v, 10)) // BIGINT -> number

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: parseInt(process.env.PGPORT || "5433", 10),
  user: process.env.PGUSER || "creditswap",
  password: process.env.PGPASSWORD || "creditswap_dev",
  database: process.env.PGDATABASE || "creditswap",
  max: 10,
  idleTimeoutMillis: 30000,
})

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
  const client = await pool.connect()
  try {
    const result = await client.query(sql, params)
    return result.rows as T[]
  } finally {
    client.release()
  }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
  const rows = await query<T>(sql, params)
  return rows[0] || null
}
