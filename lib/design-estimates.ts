export type FinishKey = 'reinforced-concrete' | 'shotcrete' | 'steel' | 'masonry'
export type StairKey = 'switchback' | 'straight' | 'sculptural-spiral'
export type LiftKey = 'none' | 'machine-room-less-regenerative' | 'hydraulic' | 'platform'
export type PowerKey = 'grid-resilient' | 'solar-storage' | 'hybrid-microgrid'
export type WaterKey = 'utility' | 'treatment-reuse' | 'independent-treatment'
export type AirKey = 'monitored-ventilation' | 'filtered-heat-recovery' | 'redundant-air-study'
export type ControlsKey = 'manual-ready' | 'building-automation' | 'integrated-resilience'
export type BuildingSystems = { power: PowerKey; water: WaterKey; air: AirKey; controls: ControlsKey }
export type FootprintKey = 'rectangular' | 'l-shaped' | 'octagonal' | 'circular'

type EstimateRate = {
  label: string
  lowPerSquareFoot: number
  highPerSquareFoot: number
  laborLowHoursPerSquareFoot: number
  laborHighHoursPerSquareFoot: number
}

const rates: Record<FinishKey, EstimateRate> = {
  'reinforced-concrete': {
    label: 'Cast-in-place concrete',
    lowPerSquareFoot: 430,
    highPerSquareFoot: 760,
    laborLowHoursPerSquareFoot: 28,
    laborHighHoursPerSquareFoot: 46,
  },
  shotcrete: {
    label: 'Shotcrete finish',
    lowPerSquareFoot: 460,
    highPerSquareFoot: 820,
    laborLowHoursPerSquareFoot: 30,
    laborHighHoursPerSquareFoot: 50,
  },
  steel: {
    label: 'Steel-panel concept',
    lowPerSquareFoot: 510,
    highPerSquareFoot: 940,
    laborLowHoursPerSquareFoot: 24,
    laborHighHoursPerSquareFoot: 42,
  },
  masonry: {
    label: 'Masonry finish concept',
    lowPerSquareFoot: 390,
    highPerSquareFoot: 710,
    laborLowHoursPerSquareFoot: 34,
    laborHighHoursPerSquareFoot: 56,
  },
}

export type DesignEstimate = {
  finish: string
  access: { stairs: StairKey; lift: LiftKey }
  area: number
  floors: number
  accessLow: number
  accessHigh: number
  systemsLow: number
  systemsHigh: number
  constructionLow: number
  constructionHigh: number
  designFeeLow: number
  designFeeHigh: number
  totalLow: number
  totalHigh: number
  laborLowHours: number
  laborHighHours: number
  designFeePercent: number
  accessBasis: string
  systemsBasis: string
}

export function estimateConcept({
  finish,
  footprint,
  lengthFeet,
  widthFeet,
  floors,
  stairs,
  lift,
  systems,
}: {
  finish: FinishKey
  footprint: FootprintKey
  lengthFeet: number
  widthFeet: number
  floors: number
  stairs: StairKey
  lift: LiftKey
  systems: BuildingSystems
}): DesignEstimate {
  const rate = rates[finish]
  const safeLength = Number.isFinite(lengthFeet) ? Math.max(1, Math.round(lengthFeet)) : 1
  const safeWidth = Number.isFinite(widthFeet) ? Math.max(1, Math.round(widthFeet)) : 1
  const safeFloors = Number.isFinite(floors) ? Math.max(1, Math.round(floors)) : 1
  const footprintFactor: Record<FootprintKey, number> = { rectangular: 1, 'l-shaped': 0.78, octagonal: 0.9, circular: Math.PI / 4 }
  const area = safeLength * safeWidth * safeFloors * footprintFactor[footprint]
  const constructionLow = area * rate.lowPerSquareFoot
  const constructionHigh = area * rate.highPerSquareFoot
  const stairRates: Record<StairKey, { low: number; high: number; laborLow: number; laborHigh: number; label: string }> = {
    switchback: { low: 16000, high: 38000, laborLow: 140, laborHigh: 300, label: 'Switchback stair concept' },
    straight: { low: 19000, high: 46000, laborLow: 160, laborHigh: 340, label: 'Straight-run stair concept' },
    'sculptural-spiral': { low: 26000, high: 64000, laborLow: 180, laborHigh: 390, label: 'Spiral stair concept' },
  }
  const liftRates: Record<LiftKey, { low: number; high: number; laborLow: number; laborHigh: number; label: string }> = {
    none: { low: 0, high: 0, laborLow: 0, laborHigh: 0, label: 'No lift concept selected' },
    'machine-room-less-regenerative': { low: 145000, high: 310000, laborLow: 900, laborHigh: 1900, label: 'Machine-room-less regenerative elevator study' },
    hydraulic: { low: 105000, high: 245000, laborLow: 800, laborHigh: 1700, label: 'Hydraulic elevator study' },
    platform: { low: 42000, high: 105000, laborLow: 280, laborHigh: 720, label: 'Vertical platform lift study' },
  }
  const stairRate = stairRates[stairs]
  const liftRate = liftRates[lift]
  const accessLow = (stairRate.low + liftRate.low) * safeFloors
  const accessHigh = (stairRate.high + liftRate.high) * safeFloors
  const systemRates: { [K in keyof BuildingSystems]: Record<BuildingSystems[K], { low: number; high: number; laborLow: number; laborHigh: number; label: string }> } = {
    power: {
      'grid-resilient': { low: 18000, high: 65000, laborLow: 120, laborHigh: 360, label: 'Grid-connected resilience study' },
      'solar-storage': { low: 45000, high: 145000, laborLow: 220, laborHigh: 620, label: 'Solar plus storage study' },
      'hybrid-microgrid': { low: 85000, high: 260000, laborLow: 360, laborHigh: 900, label: 'Hybrid microgrid study' },
    },
    water: {
      utility: { low: 12000, high: 42000, laborLow: 90, laborHigh: 280, label: 'Utility water and monitoring study' },
      'treatment-reuse': { low: 28000, high: 115000, laborLow: 180, laborHigh: 560, label: 'Water treatment and reuse study' },
      'independent-treatment': { low: 55000, high: 210000, laborLow: 260, laborHigh: 820, label: 'Independent water treatment study' },
    },
    air: {
      'monitored-ventilation': { low: 18000, high: 62000, laborLow: 140, laborHigh: 420, label: 'Monitored mechanical ventilation study' },
      'filtered-heat-recovery': { low: 32000, high: 108000, laborLow: 220, laborHigh: 680, label: 'Filtered ventilation and heat recovery study' },
      'redundant-air-study': { low: 65000, high: 195000, laborLow: 360, laborHigh: 980, label: 'Redundant air-system study' },
    },
    controls: {
      'manual-ready': { low: 9000, high: 32000, laborLow: 70, laborHigh: 220, label: 'Monitored controls with manual-ready concept' },
      'building-automation': { low: 24000, high: 88000, laborLow: 160, laborHigh: 520, label: 'Building automation study' },
      'integrated-resilience': { low: 48000, high: 165000, laborLow: 280, laborHigh: 840, label: 'Integrated resilience controls study' },
    },
  }
  const selectedSystems = [
    systemRates.power[systems.power],
    systemRates.water[systems.water],
    systemRates.air[systems.air],
    systemRates.controls[systems.controls],
  ]
  const systemsLow = selectedSystems.reduce((sum, system) => sum + system.low, 0)
  const systemsHigh = selectedSystems.reduce((sum, system) => sum + system.high, 0)
  const designFeePercent = 0.15
  const designFeeLow = (constructionLow + accessLow + systemsLow) * designFeePercent
  const designFeeHigh = (constructionHigh + accessHigh + systemsHigh) * designFeePercent
  const accessBasis = `${stairRate.label} plus ${liftRate.label}; broad, unsourced planning allowances multiplied by ${safeFloors} level${safeFloors === 1 ? '' : 's'}. Site, shaft, equipment, accessibility, approvals, and vendor quotes can materially change these figures.`
  const systemsBasis = `Includes ${selectedSystems.map((system) => system.label).join(', ')}. Broad, unsourced equipment and installation allowances only; no loads, yields, water quality, airflow, redundancy, interconnection, code, or performance are calculated or guaranteed.`

  return {
    finish: rate.label,
    access: { stairs, lift },
    area,
    floors: safeFloors,
    accessLow,
    accessHigh,
    systemsLow,
    systemsHigh,
    constructionLow,
    constructionHigh,
    designFeeLow,
    designFeeHigh,
    totalLow: constructionLow + accessLow + systemsLow + designFeeLow,
    totalHigh: constructionHigh + accessHigh + systemsHigh + designFeeHigh,
    laborLowHours: area * rate.laborLowHoursPerSquareFoot + (stairRate.laborLow + liftRate.laborLow) * safeFloors + selectedSystems.reduce((sum, system) => sum + system.laborLow, 0),
    laborHighHours: area * rate.laborHighHoursPerSquareFoot + (stairRate.laborHigh + liftRate.laborHigh) * safeFloors + selectedSystems.reduce((sum, system) => sum + system.laborHigh, 0),
    designFeePercent,
    accessBasis,
    systemsBasis,
  }
}
