import { describe, expect, it } from 'vitest'
import { estimateConcept, type BuildingSystems, type FootprintKey } from './design-estimates'

const baselineSystems: BuildingSystems = {
  power: 'grid-resilient',
  water: 'utility',
  air: 'monitored-ventilation',
  controls: 'manual-ready',
}

describe('concept estimates', () => {
  it('scales area, labor, construction, and the design allowance with each floor', () => {
    const oneFloor = estimateConcept({
      finish: 'reinforced-concrete',
      footprint: 'rectangular',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 1,
      stairs: 'switchback',
      lift: 'none',
      systems: baselineSystems,
    })
    const twoFloors = estimateConcept({
      finish: 'reinforced-concrete',
      footprint: 'rectangular',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 2,
      stairs: 'switchback',
      lift: 'none',
      systems: baselineSystems,
    })

    expect(twoFloors.area).toBe(oneFloor.area * 2)
    expect(twoFloors.constructionLow).toBe(oneFloor.constructionLow * 2)
    expect(twoFloors.laborHighHours).toBeLessThan(oneFloor.laborHighHours * 2)
    expect(twoFloors.designFeeLow).toBe((twoFloors.constructionLow + twoFloors.accessLow + twoFloors.systemsLow) * 0.15)
    expect(twoFloors.totalHigh).toBe(twoFloors.constructionHigh + twoFloors.accessHigh + twoFloors.systemsHigh + twoFloors.designFeeHigh)
  })

  it('uses a distinct allowance for each finish', () => {
    const concrete = estimateConcept({ finish: 'reinforced-concrete', footprint: 'rectangular', lengthFeet: 24, widthFeet: 16, floors: 1, stairs: 'switchback', lift: 'none', systems: baselineSystems })
    const steel = estimateConcept({ finish: 'steel', footprint: 'rectangular', lengthFeet: 24, widthFeet: 16, floors: 1, stairs: 'switchback', lift: 'none', systems: baselineSystems })

    expect(steel.constructionLow).toBeGreaterThan(concrete.constructionLow)
    expect(steel.laborHighHours).toBeLessThan(concrete.laborHighHours)
  })

  it('keeps dimensions and floor count positive without silently capping an expandable concept', () => {
    const estimate = estimateConcept({ finish: 'masonry', footprint: 'rectangular', lengthFeet: -4, widthFeet: 0, floors: 99, stairs: 'straight', lift: 'none', systems: baselineSystems })

    expect(estimate.floors).toBe(99)
    expect(estimate.area).toBe(99)
    expect(estimate.totalLow).toBeGreaterThan(0)
  })

  it('keeps malformed numeric inputs finite', () => {
    const estimate = estimateConcept({ finish: 'shotcrete', footprint: 'rectangular', lengthFeet: Number.NaN, widthFeet: Number.POSITIVE_INFINITY, floors: Number.NaN, stairs: 'switchback', lift: 'none', systems: baselineSystems })

    expect(estimate.area).toBe(1)
    expect(Number.isFinite(estimate.totalLow)).toBe(true)
    expect(Number.isFinite(estimate.totalHigh)).toBe(true)
  })

  it('adds chosen stair and lift allowances to construction, labor, design reserve, and total', () => {
    const stairsOnly = estimateConcept({
      finish: 'reinforced-concrete',
      footprint: 'rectangular',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 2,
      stairs: 'switchback',
      lift: 'none',
      systems: baselineSystems,
    })
    const withRegenerativeLift = estimateConcept({
      finish: 'reinforced-concrete',
      footprint: 'rectangular',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 2,
      stairs: 'switchback',
      lift: 'machine-room-less-regenerative',
      systems: baselineSystems,
    })

    expect(stairsOnly.accessLow).toBe(32000)
    expect(withRegenerativeLift.accessLow).toBeGreaterThan(stairsOnly.accessLow)
    expect(withRegenerativeLift.totalLow).toBeGreaterThan(stairsOnly.totalLow)
    expect(withRegenerativeLift.laborHighHours).toBeGreaterThan(stairsOnly.laborHighHours)
    expect(withRegenerativeLift.designFeeLow).toBe((withRegenerativeLift.constructionLow + withRegenerativeLift.accessLow + withRegenerativeLift.systemsLow) * 0.15)
    expect(withRegenerativeLift.accessBasis).toContain('unsourced planning allowances')
  })

  it('reflects power, water, air, and controls studies in estimates and labor', () => {
    const basic = estimateConcept({
      finish: 'reinforced-concrete',
      footprint: 'rectangular',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 1,
      stairs: 'switchback',
      lift: 'none',
      systems: baselineSystems,
    })
    const resilient: BuildingSystems = {
      power: 'hybrid-microgrid',
      water: 'independent-treatment',
      air: 'redundant-air-study',
      controls: 'integrated-resilience',
    }
    const enhanced = estimateConcept({
      finish: 'reinforced-concrete',
      footprint: 'rectangular',
      lengthFeet: 24,
      widthFeet: 16,
      floors: 1,
      stairs: 'switchback',
      lift: 'none',
      systems: resilient,
    })

    expect(enhanced.systemsLow).toBeGreaterThan(basic.systemsLow)
    expect(enhanced.totalHigh).toBeGreaterThan(basic.totalHigh)
    expect(enhanced.laborHighHours).toBeGreaterThan(basic.laborHighHours)
    expect(enhanced.systemsBasis).toContain('no loads, yields, water quality, airflow')
  })

  it('uses distinct approximate areas for the footprint studies', () => {
    const estimateFootprint = (footprint: FootprintKey): number => estimateConcept({
      finish: 'reinforced-concrete',
      footprint,
      lengthFeet: 24,
      widthFeet: 16,
      floors: 1,
      stairs: 'switchback',
      lift: 'none',
      systems: baselineSystems,
    }).area

    expect(estimateFootprint('rectangular')).toBe(384)
    expect(estimateFootprint('l-shaped')).toBeCloseTo(311.424)
    expect(estimateFootprint('octagonal')).toBeCloseTo(345.6)
    expect(estimateFootprint('circular')).toBeCloseTo(201.06, 1)
  })
})
