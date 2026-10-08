import { neon } from '@neondatabase/serverless'

let client: ReturnType<typeof neon<false, false>> | undefined

export function getDatabase() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) throw new Error('DATABASE_URL is not configured.')
  client ??= neon<false, false>(connectionString)
  return client
}

export async function queryRows<Row extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  parameters: unknown[] = [],
) {
  return await getDatabase().query(text, parameters) as Row[]
}
