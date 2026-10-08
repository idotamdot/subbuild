import { neon } from '@neondatabase/serverless'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  throw new Error('Set DATABASE_URL to the Neon connection string before running migrations.')
}

const sql = neon(connectionString)
const migrationsPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../database/migrations')
const migrations = (await readdir(migrationsPath)).filter((name) => name.endsWith('.sql')).sort()

function splitStatements(source) {
  const statements = []
  let statement = ''
  let dollarTag = null
  let inString = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (dollarTag) {
      if (source.startsWith(dollarTag, index)) {
        statement += dollarTag
        index += dollarTag.length - 1
        dollarTag = null
      } else {
        statement += character
      }
      continue
    }

    if (inString) {
      statement += character
      if (character === "'" && source[index + 1] === "'") {
        statement += source[index + 1]
        index += 1
      } else if (character === "'") {
        inString = false
      }
      continue
    }

    if (character === "'") {
      inString = true
      statement += character
      continue
    }

    if (character === '$') {
      const tag = source.slice(index).match(/^\$[A-Za-z_][A-Za-z0-9_]*\$|^\$\$/)?.[0]
      if (tag) {
        dollarTag = tag
        statement += tag
        index += tag.length - 1
        continue
      }
    }

    if (character === ';') {
      if (statement.trim()) statements.push(statement.trim())
      statement = ''
    } else {
      statement += character
    }
  }

  if (statement.trim()) statements.push(statement.trim())
  if (dollarTag || inString) throw new Error('A migration contains an unterminated SQL string.')
  return statements
}

await sql`CREATE TABLE IF NOT EXISTS schema_migrations (
  name text PRIMARY KEY,
  applied_at timestamptz NOT NULL DEFAULT now()
)`

for (const name of migrations) {
  const applied = await sql`SELECT name FROM schema_migrations WHERE name = ${name}`
  if (applied.length > 0) {
    console.log(`Skipped ${name}; already applied.`)
    continue
  }

  const contents = await readFile(path.join(migrationsPath, name), 'utf8')
  const statements = splitStatements(contents)
  for (const statement of statements) await sql(statement)
  await sql`INSERT INTO schema_migrations (name) VALUES (${name})`
  console.log(`Applied ${name}.`)
}
