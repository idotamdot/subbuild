const iterations = 310_000
const draftAad = new TextEncoder().encode('esspt-private-draft-v1')
const shareAad = new TextEncoder().encode('esspt-co-review-v1')

export type DraftEnvelope = {
  version: 1
  salt: string
  iv: string
  ciphertext: string
}

export type VaultKey = {
  key: CryptoKey
  salt: string
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000))
  }
  return btoa(binary)
}

function base64ToBytes(value: string) {
  return Uint8Array.from(atob(value), (character) => character.charCodeAt(0))
}

async function deriveKey(passphrase: string, salt: Uint8Array) {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: Uint8Array.from(salt).buffer, iterations, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
}

export async function createVaultKey(passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { key: await deriveKey(passphrase, salt), salt: bytesToBase64(salt) }
}

export async function unlockVaultKey(passphrase: string, salt: string): Promise<VaultKey> {
  const saltBytes = base64ToBytes(salt)
  if (saltBytes.length !== 16) throw new Error('The encrypted draft has an invalid key salt.')
  return { key: await deriveKey(passphrase, saltBytes), salt }
}

export async function encryptDraft(value: unknown, vault: VaultKey): Promise<DraftEnvelope> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(value))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: draftAad }, vault.key, plaintext)
  return {
    version: 1,
    salt: vault.salt,
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
}

export async function decryptDraft<T>(envelope: DraftEnvelope, vault: VaultKey): Promise<T> {
  const plaintext = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: base64ToBytes(envelope.iv),
    additionalData: draftAad,
  }, vault.key, base64ToBytes(envelope.ciphertext))
  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}

export async function encryptCoReview(value: unknown, passphrase: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await deriveKey(passphrase, salt)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = new TextEncoder().encode(JSON.stringify(value))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: shareAad }, key, plaintext)
  const envelope: DraftEnvelope = {
    version: 1,
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  }
  return JSON.stringify({ ...envelope, purpose: 'co-review' }, null, 2)
}

export async function decryptCoReview<T>(serialized: string, passphrase: string): Promise<T> {
  const value: unknown = JSON.parse(serialized)
  if (!value || typeof value !== 'object') throw new Error('The co-review file is invalid.')
  const envelope = value as DraftEnvelope & { purpose?: string }
  if (envelope.version !== 1 || envelope.purpose !== 'co-review' || typeof envelope.salt !== 'string' || typeof envelope.iv !== 'string' || typeof envelope.ciphertext !== 'string') {
    throw new Error('This is not a supported co-review file.')
  }
  const vault = await unlockVaultKey(passphrase, envelope.salt)
  const plaintext = await crypto.subtle.decrypt({
    name: 'AES-GCM',
    iv: base64ToBytes(envelope.iv),
    additionalData: shareAad,
  }, vault.key, base64ToBytes(envelope.ciphertext))
  return JSON.parse(new TextDecoder().decode(plaintext)) as T
}
