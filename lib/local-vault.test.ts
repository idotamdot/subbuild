import { describe, expect, it } from 'vitest'
import { createVaultKey, decryptCoReview, decryptDraft, encryptCoReview, encryptDraft, unlockVaultKey } from './local-vault'

describe('browser-side encrypted planning vault', () => {
  it('encrypts and restores a local draft with its passphrase', async () => {
    const draft = { goal: 'Storm shelter', ownerPriorities: ['Medical access'] }
    const vault = await createVaultKey('a sufficiently long private phrase')
    const envelope = await encryptDraft(draft, vault)
    const unlocked = await unlockVaultKey('a sufficiently long private phrase', envelope.salt)

    expect(envelope.ciphertext).not.toContain('Storm shelter')
    await expect(decryptDraft(envelope, unlocked)).resolves.toEqual(draft)
  })

  it('rejects an incorrect local passphrase', async () => {
    const vault = await createVaultKey('correct local passphrase')
    const envelope = await encryptDraft({ private: 'draft' }, vault)
    const wrongVault = await unlockVaultKey('incorrect local passphrase', envelope.salt)

    await expect(decryptDraft(envelope, wrongVault)).rejects.toThrow()
  })

  it('uses a separately encrypted co-review package', async () => {
    const review = { priorities: ['Accessibility'], brief: { occupancy: 'Withheld' } }
    const packageText = await encryptCoReview(review, 'separate co-review passphrase')

    await expect(decryptCoReview(packageText, 'separate co-review passphrase')).resolves.toEqual(review)
    await expect(decryptCoReview(packageText, 'different co-review passphrase')).rejects.toThrow()
  })
})
