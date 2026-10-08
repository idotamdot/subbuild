import { describe, expect, it } from 'vitest'
import { estimateConcept } from './design-estimates'

describe('concept estimates', () => {
  it('scales area, labor, construction, and the design allowance with each floor', () => {
    const oneFloor = estimateConcept({
      finish: 'reinforced-concrete',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 1,
    })
    const twoFloors = estimateConcept({
      finish: 'reinforced-concrete',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 2,
    })

    expect(twoFloors.area).toBe(oneFloor.area * 2)
    expect(twoFloors.constructionLow).toBe(oneFloor.constructionLow * 2)
    expect(twoFloors.laborHighHours).toBe(oneFloor.laborHighHours * 2)
    expect(twoFloors.designFeeLow).toBe(twoFloors.constructionLow * 0.15)
    expect(twoFloors.totalHigh).toBe(twoFloors.constructionHigh + twoFloors.designFeeHigh)
  })

  it('uses a distinct allowance for each finish', () => {
    const concrete = estimateConcept({ finish: 'reinforced-concrete', lengthFeet: 24, widthFeet: 16, floors: 1 })
    const steel = estimateConcept({ finish: 'steel', lengthFeet: 24, widthFeet: 16, floors: 1 })

    expect(steel.constructionLow).toBeGreaterThan(concrete.constructionLow)
    expect(steel.laborHighHours).toBeLessThan(concrete.laborHighHours)
  })

  it('keeps dimensions and floor count positive without silently capping an expandable concept', () => {
    const estimate = estimateConcept({ finish: 'masonry', lengthFeet: -4, widthFeet: 0, floors: 99 })

    expect(estimate.floors).toBe(99)
    expect(estimate.area).toBe(99)
    expect(estimate.totalLow).toBeGreaterThan(0)
  })

  it('keeps malformed numeric inputs finite', () => {
    const estimate = estimateConcept({ finish: 'shotcrete', lengthFeet: Number.NaN, widthFeet: Number.POSITIVE_INFINITY, floors: Number.NaN })

    expect(estimate.area).toBe(1)
    expect(Number.isFinite(estimate.totalLow)).toBe(true)
    expect(Number.isFinite(estimate.totalHigh)).toBe(true)
  })
})
