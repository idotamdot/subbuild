import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'

function getKey(name: 'INQUIRY_ENCRYPTION_KEY' | 'SITE_ASSESSMENT_ENCRYPTION_KEY' = 'INQUIRY_ENCRYPTION_KEY') {
  const encoded = process.env[name]
  if (!encoded) throw new Error(`${name} is not configured.`)
  const key = Buffer.from(encoded, 'base64')
  if (key.length !== 32) throw new Error(`${name} must be a base64-encoded 32-byte key.`)
  return key
}

export function encryptPayload(payload: unknown, keyName: 'INQUIRY_ENCRYPTION_KEY' | 'SITE_ASSESSMENT_ENCRYPTION_KEY' = 'INQUIRY_ENCRYPTION_KEY') {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', getKey(keyName), iv)
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(payload), 'utf8'),
    cipher.final(),
  ])
  return { encrypted, iv, tag: cipher.getAuthTag() }
}

export function decryptPayload<T>(encrypted: Buffer, iv: Buffer, tag: Buffer, keyName: 'INQUIRY_ENCRYPTION_KEY' | 'SITE_ASSESSMENT_ENCRYPTION_KEY' = 'INQUIRY_ENCRYPTION_KEY'): T {
  const decipher = createDecipheriv('aes-256-gcm', getKey(keyName), iv)
  decipher.setAuthTag(tag)
  const plaintext = Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
  return JSON.parse(plaintext) as T
}
